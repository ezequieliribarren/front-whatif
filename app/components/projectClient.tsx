'use client';
import { useState } from 'react';
import Slider from 'react-slick';
import { useRouter } from 'next/navigation';
import styles from '../ui/project.module.css';
import richTextToHTML from '../lib/richTextToHTML';

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
  categories?: { name: string }[];
  types?: { name: string }[];
  location?: string;
  client?: string;
  detail?: any;
  detail_en?: any;
  detail_es?: any;
  area?: string;
  agency?: string;
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
  return (
    <div
      className={`${className} ${styles.customArrow} ${styles.leftArrow}`}
      style={{ ...style }}
      onClick={onClick}
    >
      <img src="/left-arrow.png" alt="Previous" />
    </div>
  );
};

const CustomNextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${styles.customArrow} ${styles.rightArrow}`}
      style={{ ...style }}
      onClick={onClick}
    >
      <img src="/right-arrow.png" alt="Next" />
    </div>
  );
};

export default function ProjectClient({ project }: Props) {
  const router = useRouter();
  const [activeType, setActiveType] = useState<'photos' | 'drawings' | 'renders' | 'videos' | 'models3D'>('photos');
  type Language = 'ES' | 'EN';
  const [lang, setLang] = useState<Language>('ES');
  const [currentSlide, setCurrentSlide] = useState(0);
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/work');
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    afterChange: (index: number) => setCurrentSlide(index),
  };

  const mediaMap: Record<string, Media[] | { url: string }[] | undefined> = {
    photos: project.photos,
    drawings: project.drawings,
    renders: project.renders,
    videos: project.videos,
    models3D: project.models3D,
  };

  const filteredMedia = mediaMap[activeType] || [];

  // i18n strings and description selection
  const t = {
    ES: {
      back: 'atrás',
      location: 'Ubicación',
      client: 'Cliente',
      builtArea: 'Área construida',
      agency: 'Agencia',
      awards: 'Premios',
      yearFallback: 'Año',
      noCategory: 'Sin categoría',
      noType: 'Sin tipo',
      menu: {
        photos: 'Fotos',
        videos: 'Videos',
        drawings: 'Planos',
        renders: 'Renders',
        models3D: '3D',
      },
    },
    EN: {
      back: 'back',
      location: 'Location',
      client: 'Client',
      builtArea: 'Built area',
      agency: 'Agency',
      awards: 'Awards',
      yearFallback: 'Year',
      noCategory: 'No category',
      noType: 'No type',
      menu: {
        photos: 'Photos',
        videos: 'Videos',
        drawings: 'Drawings',
        renders: 'Renders',
        models3D: '3D',
      },
    },
  } as const;

  const getLocalizedRichText = (p: any, l: Language) => {
    const lower = l.toLowerCase();
    const candidates = [
      p[`text_${lower}`],
      p.text?.[lower],
      p.text?.[l],
      p.text,
    ];
    for (const c of candidates) {
      if (c?.root?.children?.length) return c;
    }
    return null;
  };

  const textNode = getLocalizedRichText(project, lang);
  const projectHasText = !!textNode?.root?.children?.length;
  const descriptionHTML = projectHasText ? richTextToHTML(textNode.root.children) : '';

  // no-op: logo overlay remains static (no animation)

  // Detail block (one-line). Prefer ES, then default, then EN. Render as plain text.
  const detailNode = (project as any).detail_es ?? project.detail ?? (project as any).detail_en;
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
  const detailPlain = typeof detailNode === 'string'
    ? detailNode
    : (detailNode?.root?.children ? toPlainText(detailNode.root.children) : '');
  const hasDetail = !!detailPlain;

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
            {hasDetail && (
              <p><strong>Detail:</strong> {detailPlain}</p>
            )}
            {project.area && <p><strong>Built area:</strong> {project.area}</p>}
            {project.agency && <p><strong>Agencia:</strong> {project.agency}</p>}
            {project.awards && <p><strong>Premios:</strong> {project.awards}</p>}
          </div>

          {/* Solo el rich text es scrolleable */}
          {projectHasText && (
            <div className={styles.descriptionScroll}>
              <div
                className={`${styles.description} ${styles.open}`}
                dangerouslySetInnerHTML={{ __html: descriptionHTML }}
              />
            </div>
          )}

          {/* Toggle EN/ES fijo debajo del texto */}
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
              >
                ES
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={lang === 'EN'}
                className={`${styles.langOption} ${lang === 'EN' ? styles.selected : ''}`}
                onClick={() => setLang('EN')}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Dentro del div .carouselSection */}
      <div className={styles.carouselSection}>
        {/* Botón Back */}
        <div className={styles.backButton}>
          <button type="button" onClick={handleBack} className={styles.backContent} aria-label="Back">
            <img src="/left-arrow.png" alt="Back" />
            <span>back</span>
          </button>
        </div>

        {/* Slider */}
        {filteredMedia.length > 0 && (
          <Slider {...settings} className={styles.slider}>
            {filteredMedia.map((media: any, index: number) => (
              <div key={index} className={`${styles.slide} ${currentSlide === index ? styles.revealed : ''}`}>
                {'mimeType' in media && media.mimeType?.includes('video') ? (
                  <video
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${media.url}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.media}
                  />
                ) : 'url' in media && typeof media.url === 'string' && !('mimeType' in media) ? (
                  <iframe
                    src={media.url}
                    title={`3D model ${index + 1}`}
                    className={styles.media}
                  />
                ) : (
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${media.url}`}
                    alt={media.alt || project.title}
                    className={styles.media}
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </div>
            ))}
          </Slider>
        )}

        <div className={styles.menuProject}>
          <ul>
            {(() => {
              const order = ['models3D', 'videos', 'drawings', 'renders', 'photos'] as const;
              const available = order.filter((type) => (mediaMap[type] && (mediaMap[type] as any[])?.length > 0));
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
                    style={{ cursor: 'pointer' }}
                    title={labelMap[type]}
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
