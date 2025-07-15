'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import styles from '../ui/project.module.css';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

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
  content?: string;
  galeria?: Media[];
  categories?: { name: string }[];
  types?: { name: string }[];
  location?: string;
  client?: string;
  area?: string;
  agency?: string;
  awards?: string;
};

type Props = {
  project: Project;
};

export default function ProjectClient({ project }: Props) {
  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <main className={styles.container}>
      <aside className={styles.sidebar}>
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

        <div className={styles.details}>
          <p><strong>Location:</strong> {project.location || 'No especificado'}</p>
          <p><strong>Client:</strong> {project.client || 'No especificado'}</p>
          <p><strong>Built area:</strong> {project.area || 'No especificado'}</p>
          <p><strong>Agencia:</strong> {project.agency || 'No especificado'}</p>
          <p><strong>Premios:</strong> {project.awards || 'No especificado'}</p>
        </div>

        <button className={styles.textToggle}>↑ text</button>
      </aside>

      <section className={styles.carouselSection}>
        {project.galeria && project.galeria.length > 0 && (
          <Slider {...settings} className={styles.slider}>
            {project.galeria.map((media, index) => (
              <div key={index} className={styles.slide}>
                {media.mimeType?.includes('video') ? (
                  <video
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${media.url}`}
                    controls
                    className={styles.media}
                  />
                ) : (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${media.url}`}
                    alt={media.alt || project.title}
                    width={media.width || 1200}
                    height={media.height || 800}
                    className={styles.media}
                  />
                )}
              </div>
            ))}
          </Slider>
        )}

        <div className={styles.tabs}>
          <span>3D</span>
          <span>video</span>
          <span>drawings</span>
          <span>renders</span>
          <span className={styles.activeTab}>photos</span>
        </div>
      </section>
    </main>
  );
}
