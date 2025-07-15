// lib/richTextToHTML.ts
// lib/richTextToHTML.ts

export default function richTextToHTML(nodes: any[]): string {
  if (!Array.isArray(nodes)) return '';

  const renderNode = (node: any): string => {
    switch (node.type) {
      case 'h1':
        return `<h1>${renderChildren(node.children)}</h1>`;
      case 'h2':
        return `<h2>${renderChildren(node.children)}</h2>`;
      case 'h3':
        return `<h3>${renderChildren(node.children)}</h3>`;
      case 'ul':
        return `<ul>${renderChildren(node.children)}</ul>`;
      case 'ol':
        return `<ol>${renderChildren(node.children)}</ol>`;
      case 'li':
        return `<li>${renderChildren(node.children)}</li>`;
      case 'link':
        return `<a href="${node.url}" target="_blank" rel="noopener noreferrer">${renderChildren(node.children)}</a>`;
      case 'paragraph':
        return `<p>${renderChildren(node.children)}</p>`;
      case 'text':
        let text = node.text || '';
        if (node.bold) text = `<strong>${text}</strong>`;
        if (node.italic) text = `<em>${text}</em>`;
        if (node.underline) text = `<u>${text}</u>`;
        return text;
      default:
        return node.children ? renderChildren(node.children) : '';
    }
  };

  const renderChildren = (children: any[]): string =>
    children.map((child) => renderNode(child)).join('');

  return nodes.map((node) => renderNode(node)).join('');
}
