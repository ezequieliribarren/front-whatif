'use client';
import { useEffect, useState } from 'react';
import Slider from 'react-slick';
 
import { useRouter } from 'next/navigation';
import styles from '../ui/project.module.css';
import richTextToHTML from '../lib/richTextToHTML';
import { useCursor } from './CursorProvider';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type Media = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  mimeType?: string;
};

type Project = {
  title: string;
  date?: string;
  galeria?: Media[];
  imagenDestacada?: Media;
  categories?: { name: string }[];
  types?: { name: string }[];
  location?: string;
  client?: string;
  detail?: any;
  detail_en?: any;
  detail_es?: any;
  // Optional dynamic label fields coming from API
  campoDetail?: any;
  campoDetail_en?: string;
  campoDetail_es?: string;
  detailLabel?: string;
  detailLabel_en?: string;
  detailLabel_es?: string;
  area?: string;
  // `agency` may arrive as a plain string or a Lexical rich-text object
  agency?: any;
  awards?: string;
  photos?: Media[];
  drawings?: Media[];
  renders?: Media[];
  videos?: Media[];
  models3D?: { url: string }[];
  text?: any;
  text_en?: any;
  text_es?: any;
};

type Props = {
  project: Project;
};

const CustomPrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  const { show, move, isTouch, hide } = useCursor();
  return (
    <div
      className={`${className} ${styles.customArrow} ${styles.leftArrow}`}
      style={{ ...style, cursor: isTouch ? 'pointer' : 'none' }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isTouch) {
          show('', { variant: 'arrow' });
          move(e.clientX, e.clientY);
        }
      }}
      onMouseMove={(e) => { if (!isTouch) move(e.clientX, e.clientY); }}
      onMouseLeave={() => { if (!isTouch) hide(); }}
    >
      <img src="/left-arrow.png" alt="Previous" width={32} height={32} />
    </div>
  );
};

const CustomNextArrow = (props: any) => {
  const { className, style, onClick } = props;
  const { show, move, isTouch, hide } = useCursor();
  return (
    <div
      className={`${className} ${styles.customArrow} ${styles.rightArrow}`}
      style={{ ...style, cursor: isTouch ? 'pointer' : 'none' }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isTouch) {
          show('', { variant: 'arrow' });
          move(e.clientX, e.clientY);
        }
      }}
      onMouseMove={(e) => { if (!isTouch) move(e.clientX, e.clientY); }}
      onMouseLeave={() => { if (!isTouch) hide(); }}
    >
      <img src="/right-arrow.png" alt="Next" width={32} height={32} />
    </div>
  );
};

export default function ProjectClient({ project }: Props) {
  const router = useRouter();
  const { show, hide, move, isTouch } = useCursor();
  const [activeType, setActiveType] = useState<
    'photos' | 'drawings' | 'renders' | 'videos' | 'models3D'
  >('photos');
  type Language = 'ES' | 'EN';
  const [lang, setLang] = useState<Language>('ES');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const normalizeUrl = (url?: string) => {
    if (!url) return '';
    const noQuery = url.split('?')[0];
    return noQuery.replace(/^https?:\/\/[^/]+/i, '');
  };

  const featuredUrl = normalizeUrl(project.imagenDestacada?.url);
  const filterFeatured = <T extends { url?: string }>(items?: T[]) => {
    if (!Array.isArray(items)) return [] as T[];
    if (!featuredUrl) return items;
    return items.filter((item) => normalizeUrl(item.url) !== featuredUrl);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/work');
    }
  };

  const baseSettings = {
    dots: false,
    infinite: true,
    speed: 200, // ⚡ más rápido (coincide con tu transición CSS)
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: !isTouch,
    adaptiveHeight: !isTouch,
    cssEase: 'ease-out', // 👈 suaviza la salida
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    afterChange: (index: number) => setCurrentSlide(index),
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    pauseOnFocus: true,
  };


  const mediaMap: Record<string, Media[] | { url: string }[] | undefined> = {
    photos: filterFeatured(project.photos),
    drawings: filterFeatured(project.drawings),
    renders: filterFeatured(project.renders),
    videos: filterFeatured(project.videos),
    models3D: filterFeatured(project.models3D),
  };

  // Choose first available media when current type is empty
  useEffect(() => {
    const hasItems = (t: 'photos' | 'drawings' | 'renders' | 'videos' | 'models3D') =>
      Array.isArray(mediaMap[t]) && (mediaMap[t] as any[])?.length > 0;

    if (!hasItems(activeType)) {
      // Preferred fallback order prioritizing image-like content
      const order: Array<'photos' | 'renders' | 'drawings' | 'videos' | 'models3D'> = [
        'photos',
        'renders',
        'drawings',
        'videos',
        'models3D',
      ];
      const first = order.find((t) => hasItems(t));
      if (first && first !== activeType) setActiveType(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.photos, project.renders, project.drawings, project.videos, project.models3D]);

  const filteredMedia = mediaMap[activeType] || [];
  // Render-time safety: if current tab is empty, show the first available set
  const safeMedia = (Array.isArray(filteredMedia) && filteredMedia.length > 0)
    ? filteredMedia
    : (mediaMap['photos']?.length ? mediaMap['photos']
      : mediaMap['renders']?.length ? mediaMap['renders']
      : mediaMap['drawings']?.length ? mediaMap['drawings']
      : mediaMap['videos']?.length ? mediaMap['videos']
      : mediaMap['models3D'] || []);

  const mediaCount = Array.isArray(safeMedia) ? safeMedia.length : 0;
  const sliderSettings = {
    ...baseSettings,
    infinite: mediaCount > 1,
    arrows: mediaCount > 1,
    fade: !isTouch && mediaCount > 1,
    autoplay: mediaCount > 1,
    prevArrow: mediaCount > 1 ? <CustomPrevArrow /> : undefined,
    nextArrow: mediaCount > 1 ? <CustomNextArrow /> : undefined,
    afterChange: (index: number) => setCurrentSlide(index),
  };

  // Reset slider position when changing media type to avoid stale clones/positions
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeType]);

  // Filter a Lexical node tree by paragraph-level `textFormat` (0=ES, 1=EN)
  const filterLexicalByLang = (root: any, l: Language) => {
    if (!root?.root?.children && !root?.children) return null;
    const children = root.root?.children || root.children || [];
    const targetTF = l === 'EN' ? 1 : 0;

    const filterNodes = (nodes: any[]): any[] => {
      if (!Array.isArray(nodes)) return [];
      const out: any[] = [];
      for (const n of nodes) {
        if (!n) continue;
        const clone: any = { ...n };
        if (Array.isArray(n.children)) clone.children = filterNodes(n.children);
        const tf = (n as any).textFormat;
        const hasTF = typeof tf !== 'undefined';
        const keep = hasTF ? tf === targetTF : l === 'ES';
        if (keep) out.push(clone);
      }
      return out;
    };

    const filtered = filterNodes(children);
    return filtered.length
      ? { root: { ...(root.root || {}), children: filtered } }
      : null;
  };

  const getLocalizedRichText = (p: any, l: Language) => {
    const lower = l.toLowerCase();
    // 1) Prefer explicit localized fields from API (text_en / text_es)
    const direct = p[`text_${lower}`];
    if (direct?.root?.children?.length) return direct;
    // 2) If `text` contains both languages, filter by paragraph textFormat
    if (p.text?.root?.children?.length) {
      const filtered = filterLexicalByLang(p.text, l);
      if (filtered?.root?.children?.length) return filtered;
    }
    // 3) Fall back to whatever is available
    if (p.text?.root?.children?.length) return p.text;
    // 4) Last resort: try alternate code paths
    const candidates = [p.text?.[lower], p.text?.[l]];
    for (const c of candidates) {
      if (c?.root?.children?.length) return c;
    }
    return null;
  };

  const textNode = getLocalizedRichText(project, lang);
  const projectHasText = !!textNode?.root?.children?.length;
  const descriptionHTML = projectHasText ? richTextToHTML(textNode.root.children) : '';

  // Localize `detail` similarly if available
  const getLocalizedDetail = (p: any, l: Language) => {
    const lower = l.toLowerCase();
    const direct = p[`detail_${lower}`] ?? null;
    if (direct) return direct;
    if (p.detail) return p.detail;
    const alt = l === 'EN' ? p.detail_en ?? p.detail_es : p.detail_es ?? p.detail_en;
    return alt ?? null;
  };

  const detailNode = getLocalizedDetail(project, lang);
  const toPlainText = (nodes: any[]): string => {
    if (!Array.isArray(nodes)) return '';
    const collect = (n: any): string => {
      if (!n) return '';
      if (n.type === 'text') return n.text || '';
      if (Array.isArray(n.children)) return n.children.map(collect).join(' ');
      return '';
    };
    return nodes.map(collect).join(' ').replace(/\s+/g, ' ').trim();
  };
  const detailPlain =
    typeof detailNode === 'string'
      ? detailNode
      : detailNode?.root?.children
      ? toPlainText(detailNode.root.children)
      : '';
  const hasDetail = !!detailPlain;

  const getDetailLabel = (p: any, l: Language): string => {
    const lower = l.toLowerCase();
    const candidates = [
      p[`campoDetail_${lower}`],
      typeof p.campoDetail === 'object' ? p.campoDetail?.[lower] : undefined,
      typeof p.campoDetail === 'object' ? p.campoDetail?.[l] : undefined,
      p.campoDetail,
      p[`detailLabel_${lower}`],
      typeof p.detailLabel === 'object' ? p.detailLabel?.[lower] : undefined,
      typeof p.detailLabel === 'object' ? p.detailLabel?.[l] : undefined,
      p.detailLabel,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c.trim();
    }
    return l === 'EN' ? 'Detail' : 'Detalle';
  };
  const detailLabel = getDetailLabel(project, lang);

  // Coerce fields that may be Lexical-rich-text or strings into plain text
  const coerceRichToPlain = (value: any, l: Language): string => {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    const lower = l.toLowerCase();
    // Try localized variants if the value is a map
    if (typeof value === 'object') {
      const localized = value[lower] ?? value[l];
      if (localized) return coerceRichToPlain(localized, l);
      // Try Lexical shape
      const maybeRoot = value.root?.children ? value : value.root ? { root: value.root } : null;
      if (maybeRoot?.root?.children) {
        const filtered = filterLexicalByLang(maybeRoot, l) || maybeRoot;
        return toPlainText(filtered.root.children);
      }
      // Fallback: array of strings
      if (Array.isArray(value)) return value.filter(Boolean).join(' · ');
    }
    return '';
  };

  return (
    <section className={styles.container}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.year}>
            {project.date ? new Date(project.date).getFullYear() : 'Año'}
          </p>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.category}>
            {project.categories?.map((c) => c.name).join(', ') || 'Sin categoría'}
          </p>
          <p className={styles.subcategory}>
            {project.types?.map((t) => t.name).join(', ') || 'Sin tipo'}
          </p>
        </div>

        <div className={styles.details}>
          <div>
            {project.location && <p><strong>Location:</strong> {project.location}</p>}
            {project.client && <p><strong>Client:</strong> {project.client}</p>}
            {hasDetail && <p><strong>{detailLabel}:</strong> {detailPlain}</p>}
            {project.area && <p><strong>Built area:</strong> {project.area}</p>}
            {(() => {
              const agencyText = coerceRichToPlain(project.agency, lang);
              return agencyText ? <p><strong>Agency:</strong> {agencyText}</p> : null;
            })()}
            {project.awards && <p><strong>Premios:</strong> {project.awards}</p>}
          </div>

          {projectHasText && (
            <div className={styles.descriptionScroll}>
              <div
                className={`${styles.description} ${styles.open}`}
                dangerouslySetInnerHTML={{ __html: descriptionHTML }}
              />
            </div>
          )}

          <div className={styles.buttonTextContainer}>
            <div className={styles.langToggle} role="tablist" aria-label="language selector">
              <span
                className={`${styles.langSlider} ${lang === 'EN' ? styles.right : ''}`}
                aria-hidden="true"
              />
              <button
                type="button"
                role="tab"
                aria-selected={lang === 'ES'}
                className={`${styles.langOption} ${lang === 'ES' ? styles.selected : ''}`}
                onClick={() => setLang('ES')}
                onMouseEnter={(e) => { if (!isTouch) { show('', { variant: 'arrow' }); move(e.clientX, e.clientY); } }}
                onMouseMove={(e) => { if (!isTouch) move(e.clientX, e.clientY); }}
                onMouseLeave={() => { if (!isTouch) hide(); }}
                style={{ cursor: isTouch ? 'pointer' : 'none' }}
              >
                ES
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={lang === 'EN'}
                className={`${styles.langOption} ${lang === 'EN' ? styles.selected : ''}`}
                onClick={() => setLang('EN')}
                onMouseEnter={(e) => { if (!isTouch) { show('', { variant: 'arrow' }); move(e.clientX, e.clientY); } }}
                onMouseMove={(e) => { if (!isTouch) move(e.clientX, e.clientY); }}
                onMouseLeave={() => { if (!isTouch) hide(); }}
                style={{ cursor: isTouch ? 'pointer' : 'none' }}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className={styles.carouselSection}>
        <div className={styles.backButton}>
          <button
            type="button"
            onClick={handleBack}
            className={styles.backContent}
            aria-label="Back"
            onMouseEnter={(e) => {
              if (!isTouch) {
                show('', { variant: 'arrow' });
                move(e.clientX, e.clientY);
              }
            }}
            onMouseMove={(e) => { if (!isTouch) move(e.clientX, e.clientY); }}
            onMouseLeave={() => { if (!isTouch) hide(); }}
            style={{ cursor: isTouch ? 'pointer' : 'none' }}
          >
            <img src="/left-arrow.png" alt="Back" width={28} height={28} />
            <span>back</span>
          </button>
        </div>

        {(safeMedia as any[])?.length > 0 && (
          <Slider {...sliderSettings} className={styles.slider}>
            {(safeMedia as any[]).map((media: any, index: number) => (
              <div
                key={index}
                className={`${styles.slide} ${
                  (firstLoaded && currentSlide === index) ||
                  (!firstLoaded && index === 0)
                    ? styles.revealed
                    : ''
                }`}
                onMouseEnter={() => { if (!isTouch) show('WHAT\nIF', { align: 'right' }); }}
                onMouseLeave={() => hide()}
                onMouseMove={(e) => { if (!isTouch) move(e.clientX, e.clientY); }}
                style={{ cursor: isTouch ? undefined : 'none' }}
              >
                {'mimeType' in media && media.mimeType?.includes('video') ? (
                  <video
                    src={`${backendUrl}${media.url}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.media}
                    style={{ cursor: 'none' }}
                  />
                ) : 'url' in media && typeof media.url === 'string' && !('mimeType' in media) ? (
                  <iframe
                    src={media.url}
                    title={`3D model ${index + 1}`}
                    className={styles.media}
                    // Nota: no es posible ocultar el cursor dentro del contenido del iframe sin control interno
                  />
                ) : (
                  <img
                    src={`${backendUrl}${media.url}?width=1600&format=webp`}
                    alt={media.alt || project.title}
                    width={1600}
                    height={900}
                    className={styles.media}
                    style={{ objectFit: 'contain', cursor: 'none' }}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={() => {
                      if (index === 0) setFirstLoaded(true);
                    }}
                  />
                )}
              </div>
            ))}
          </Slider>
        )}

        <div className={styles.menuProject}>
          <ul>
            {(() => {
              // Keep this display order, but default selection is handled above
              const order = ['models3D', 'videos', 'drawings', 'renders', 'photos'] as const;
              const available = order.filter(
                (type) => mediaMap[type] && (mediaMap[type] as any[])?.length > 0
              );
              return available.map((type) => {
                const labelMap = {
                  photos: 'Photos',
                  videos: 'Videos',
                  drawings: 'Drawings',
                  renders: 'Renders',
                  models3D: '3D',
                } as Record<string, string>;
                return (
                  <li
                    key={type}
                    className={`${styles.menuItem} ${activeType === type ? styles.active : ''}`}
                    onClick={() => setActiveType(type)}
                    style={{ cursor: isTouch ? 'pointer' : 'none' }}
                    title={labelMap[type]}
                    onMouseEnter={(e) => { if (!isTouch) { show('', { variant: 'arrow' }); move(e.clientX, e.clientY); } }}
                    onMouseMove={(e) => { if (!isTouch) move(e.clientX, e.clientY); }}
                    onMouseLeave={() => { if (!isTouch) hide(); }}
                  >
                    <h3>{labelMap[type]}</h3>
                  </li>
                );
              });
            })()}
          </ul>
        </div>
      </div>
    </section>
  );
}
