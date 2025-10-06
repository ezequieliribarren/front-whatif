// lib/richTextToHTML.ts
// lib/richTextToHTML.ts

export default function richTextToHTML(nodes: any[]): string {
  if (!Array.isArray(nodes)) return '';

  // Lexical bitmask flags for inline formatting
  const FORMAT = {
    BOLD: 1,
    ITALIC: 2,
    UNDERLINE: 4,
    STRIKETHROUGH: 8,
    CODE: 16,
    SUBSCRIPT: 32,
    SUPERSCRIPT: 64,
  } as const;

  const renderChildren = (children: any[] = []): string =>
    children.map((child) => renderNode(child)).join('');

  const renderNode = (node: any): string => {
    if (!node) return '';

    switch (node.type) {
      // Explicit line break
      case 'linebreak':
        return '<br />';

      // Payload/Lexical heading: { type: 'heading', tag: 'h1'|'h2'|... }
      case 'heading': {
        const tag = ['h1','h2','h3','h4','h5','h6'].includes(node.tag) ? node.tag : 'h3';
        return `<${tag}>${renderChildren(node.children)}</${tag}>`;
      }

      // Payload/Lexical lists: { type: 'list', listType: 'bullet'|'number' }
      case 'list': {
        const isOrdered = (node.listType === 'number' || node.tag === 'ol');
        const tag = isOrdered ? 'ol' : 'ul';
        return `<${tag}>${renderChildren(node.children)}</${tag}>`;
      }
      case 'listitem':
      case 'li':
        return `<li>${renderChildren(node.children)}</li>`;

      // Block types
      case 'paragraph':
        return `<p>${renderChildren(node.children)}</p>`;
      case 'quote':
        return `<blockquote>${renderChildren(node.children)}</blockquote>`;

      // Inline link
      case 'link': {
        const href = node.url || node.fields?.url || '#';
        const newTab = node.newTab ?? node.fields?.newTab;
        const rel = node.rel || node.fields?.rel || (newTab ? 'noopener noreferrer' : undefined);
        const target = newTab ? ' target="_blank"' : '';
        const relAttr = rel ? ` rel="${rel}"` : '';
        return `<a href="${href}"${target}${relAttr}>${renderChildren(node.children)}</a>`;
      }

      // Text with formatting bitmask (Lexical)
      case 'text': {
        let html = node.text || '';
        const fmt: number = typeof node.format === 'number' ? node.format : 0;
        if (fmt & FORMAT.CODE) html = `<code>${html}</code>`;
        if (fmt & FORMAT.BOLD) html = `<strong>${html}</strong>`;
        if (fmt & FORMAT.ITALIC) html = `<em>${html}</em>`;
        if (fmt & FORMAT.UNDERLINE) html = `<u>${html}</u>`;
        if (fmt & FORMAT.STRIKETHROUGH) html = `<s>${html}</s>`;
        if (fmt & FORMAT.SUBSCRIPT) html = `<sub>${html}</sub>`;
        if (fmt & FORMAT.SUPERSCRIPT) html = `<sup>${html}</sup>`;
        // Optional inline style
        if (node.style) html = `<span style="${node.style}">${html}</span>`;
        return html;
      }

      // Legacy direct heading tags for safety
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return `<${node.type}>${renderChildren(node.children)}</${node.type}>`;

      // Fallback: descend into children
      default:
        return node.children ? renderChildren(node.children) : '';
    }
  };

  return nodes.map((node) => renderNode(node)).join('');
}
