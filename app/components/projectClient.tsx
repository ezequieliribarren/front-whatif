'use client';
import '@google/model-viewer';
import { useState } from 'react';
import Slider from 'react-slick';
import Link from 'next/link';
import styles from '../ui/project.module.css';

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
  area?: string;
  agency?: string;
  awards?: string;
  photos?: Media[];
  drawings?: Media[];
  renders?: Media[];
  videos?: Media[];
  models3D?: { url: string }[];
  text?: any;
};

type Props = {
  project: Project;
};

function extractPlainText(lexicalData: any): string {
  if (!lexicalData?.root?.children) return '';
  const nodes = lexicalData.root.children;

  const extract = (nodes: any[]): string => {
    return nodes
      .map((node) => {
        if (node.text) return node.text;
        if (node.children) return extract(node.children);
        return '';
      })
      .join(' ');
  };

  return extract(nodes);
}

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
  const [activeType, setActiveType] = useState<'photos' | 'drawings' | 'renders' | 'videos' | 'models3D'>('photos');
  const [showDescription, setShowDescription] = useState(false);

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
  };

  const mediaMap: Record<string, Media[] | { url: string }[] | undefined> = {
    photos: project.photos,
    drawings: project.drawings,
    renders: project.renders,
    videos: project.videos,
    models3D: project.models3D,
  };

  const filteredMedia = mediaMap[activeType] || [];

  const projectHasText = !!project.text?.root?.children?.length;
  const descriptionText = extractPlainText(project.text);

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
            {project.area && <p><strong>Built area:</strong> {project.area}</p>}
            {project.agency && <p><strong>Agencia:</strong> {project.agency}</p>}
            {project.awards && <p><strong>Premios:</strong> {project.awards}</p>}
          </div>

          {/* Descripción por encima del botón */}
          {projectHasText && (
            <div className={`${styles.description} ${showDescription ? styles.open : ''}`}>
              <p>{descriptionText}</p>
            </div>
          )}

          <div className={styles.buttonTextContainer}>
            <button
              onClick={() => projectHasText && setShowDescription(!showDescription)}
              disabled={!projectHasText}
              className={`${styles.buttonText} ${!projectHasText ? styles.disabledButton : ''}`}
            >
              <h3>{showDescription ? 'x' : 'text'}</h3>
            </button>
          </div>
        </div>
      </aside>

      {/* Dentro del div .carouselSection */}
      <div className={styles.carouselSection}>
        {/* Botón Back */}
        <div className={styles.backButton}>
          <Link href="/work" scroll={false}>
            <div className={styles.backContent}>
              <img src="/left-arrow.png" alt="Back" />
              <span>back</span>
            </div>
          </Link>
        </div>

        {/* Slider */}
        {filteredMedia.length > 0 && (
          <Slider {...settings} className={styles.slider}>
            {filteredMedia.map((media: any, index: number) => (
              <div key={index} className={styles.slide}>
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
            {(['models3D', 'videos', 'drawings', 'renders', 'photos'] as const).map((type) => {
              const labelMap = {
                photos: 'Photos',
                videos: 'Videos',
                drawings: 'Drawings',
                renders: 'Renders',
                models3D: '3D',
              };

              const hasContent = mediaMap[type] && mediaMap[type]?.length > 0;

              return (
                <li
                  key={type}
                  className={`${styles.menuItem} ${activeType === type ? styles.active : ''} ${!hasContent ? styles.disabled : ''}`}
                  onClick={() => hasContent && setActiveType(type)}
                  style={{ cursor: hasContent ? 'pointer' : 'default', opacity: hasContent ? 1 : 0.4 }}
                  title={hasContent ? labelMap[type] : 'No disponible'}
                >
                  <h3>{labelMap[type]}</h3>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
