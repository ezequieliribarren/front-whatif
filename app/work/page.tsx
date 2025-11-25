'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
// Removed Next.js Image; using native <img>
import { useMediaQuery } from 'react-responsive';
import styles from '../ui/work.module.css';
import { useCursor } from '../components/CursorProvider';
import FilterBar from '../components/filterBar';

type Media = {
  url: string;
  alt?: string;
};

type CategoryOrType = {
  name: string;
  slug: string;
};

type Project = {
  id: string;
  title: string;
  slug: string;
  date?: string;
  apagar?: boolean;
  categories?: CategoryOrType[];
  types?: CategoryOrType[];
  imagenDestacada?: Media;
};

type SortState = {
  column: 'date' | 'title' | 'types' | 'categories';
  direction: 'asc' | 'desc';
};

export default function Page() {
  const { show, hide, move, isTouch } = useCursor();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortState, setSortState] = useState<SortState>({ column: 'date', direction: 'desc' });
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  // Normaliza URL de imagen y genera versión optimizada (webp)
  const buildImageUrl = (u?: string | null, width = 800) => {
    if (!u) return null;
    const base = backendUrl.replace(/\/$/, '');
    const path = u.startsWith('/') ? u : `/${u}`;
    return `${base}${path}?width=${width}&format=webp`;
  };

  // Cargar proyectos desde Payload (vía proxy interno para evitar CORS)
  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch('/api/payload/projects?depth=1&limit=1000', {
        cache: 'no-store',
      });
      const data = await res.json();
      const docs: Project[] = Array.isArray(data?.docs) ? data.docs : [];
      // Exclude projects explicitly marked to hide (apagar === true)
      const visible = docs.filter((p: any) => p?.apagar !== true);
      setProjects(visible);
    }
    fetchProjects();
  }, []);

  // Filtrar y ordenar proyectos
  useEffect(() => {
    let filteredProjects = selectedType
      ? projects.filter((p) => p.types?.some((t) => t.slug === selectedType))
      : [...projects];

    const sorted = [...filteredProjects].sort((a, b) => {
      const { column, direction } = sortState;
      const dir = direction === 'asc' ? 1 : -1;
      const val = (p: Project) => {
        switch (column) {
          case 'date': {
            // Ordenar por fecha completa (más preciso que por año)
            return p.date ? new Date(p.date).getTime() : Number.NEGATIVE_INFINITY;
          }
          case 'title':
            return p.title.toLowerCase();
          case 'types':
            return p.types?.map((t) => t.name).join(',').toLowerCase() || '';
          case 'categories':
            return p.categories?.map((c) => c.name).join(',').toLowerCase() || '';
          default:
            return '';
        }
      };
      return val(a) < val(b) ? -dir : val(a) > val(b) ? dir : 0;
    });

    setFiltered(sorted);
    setVisibleCount(10);
  }, [projects, selectedType, sortState]);

  // Scroll infinito
  useEffect(() => {
    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filtered.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((p) => Math.min(p + 10, filtered.length));
            setIsLoadingMore(false);
          }, 200);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filtered, visibleCount]);

  const getSortIndicator = (column: SortState['column']) =>
    sortState.column === column ? (sortState.direction === 'asc' ? ' ^' : ' v') : '';

  const visibleProjects = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  return (
    <main className={styles.container}>
      <FilterBar onFilterChange={setSelectedType} />

      {!isTabletOrMobile && (
        <div className={`${styles.row} ${styles.headerRow}`}>
          <div className={`${styles.col} ${styles.colYear}`}>
            <h4
              onClick={() =>
                setSortState((p) => ({
                  column: 'date',
                  direction: p.column === 'date' && p.direction === 'asc' ? 'desc' : 'asc',
                }))
              }
              className={styles.sortableHeader}
              data-cursor-clickable="true"
              onMouseEnter={(e) => {
                if (!isTouch) {
                  show('', { variant: 'arrow' });
                  move(e.clientX, e.clientY);
                }
              }}
              onMouseMove={(e) => {
                if (!isTouch) move(e.clientX, e.clientY);
              }}
              onMouseLeave={() => {
                if (!isTouch) hide();
              }}
              style={{ cursor: isTouch ? 'pointer' : 'none' }}
            >
              date{getSortIndicator('date')}
            </h4>
          </div>
          <div className={`${styles.col} ${styles.colTitle}`}>
            <h4
              onClick={() =>
                setSortState((p) => ({
                  column: 'title',
                  direction: p.column === 'title' && p.direction === 'asc' ? 'desc' : 'asc',
                }))
              }
              className={styles.sortableHeader}
              data-cursor-clickable="true"
              onMouseEnter={(e) => {
                if (!isTouch) {
                  show('', { variant: 'arrow' });
                  move(e.clientX, e.clientY);
                }
              }}
              onMouseMove={(e) => {
                if (!isTouch) move(e.clientX, e.clientY);
              }}
              onMouseLeave={() => {
                if (!isTouch) hide();
              }}
              style={{ cursor: isTouch ? 'pointer' : 'none' }}
            >
              title{getSortIndicator('title')}
            </h4>
          </div>
          <div className={`${styles.col} ${styles.colType}`}>
            <h4
              onClick={() =>
                setSortState((p) => ({
                  column: 'types',
                  direction: p.column === 'types' && p.direction === 'asc' ? 'desc' : 'asc',
                }))
              }
              className={styles.sortableHeader}
              data-cursor-clickable="true"
              onMouseEnter={(e) => {
                if (!isTouch) {
                  show('', { variant: 'arrow' });
                  move(e.clientX, e.clientY);
                }
              }}
              onMouseMove={(e) => {
                if (!isTouch) move(e.clientX, e.clientY);
              }}
              onMouseLeave={() => {
                if (!isTouch) hide();
              }}
              style={{ cursor: isTouch ? 'pointer' : 'none' }}
            >
              types{getSortIndicator('types')}
            </h4>
          </div>
          <div className={`${styles.col} ${styles.colCategory}`}>
            <h4
              onClick={() =>
                setSortState((p) => ({
                  column: 'categories',
                  direction: p.column === 'categories' && p.direction === 'asc' ? 'desc' : 'asc',
                }))
              }
              className={styles.sortableHeader}
              data-cursor-clickable="true"
              onMouseEnter={(e) => {
                if (!isTouch) {
                  show('', { variant: 'arrow' });
                  move(e.clientX, e.clientY);
                }
              }}
              onMouseMove={(e) => {
                if (!isTouch) move(e.clientX, e.clientY);
              }}
              onMouseLeave={() => {
                if (!isTouch) hide();
              }}
              style={{ cursor: isTouch ? 'pointer' : 'none' }}
            >
              categories{getSortIndicator('categories')}
            </h4>
          </div>
          <div className={`${styles.col} ${styles.colImg}`} />
        </div>
      )}

      {visibleProjects.map((proj) => {
        const imgSmall = buildImageUrl(proj.imagenDestacada?.url, 600);
        const imgLarge = buildImageUrl(proj.imagenDestacada?.url, 1400);

        return isTabletOrMobile ? (
          <div key={proj.slug} className={styles.cardMobile}>
            <Link href={`/work/${proj.id}`} className={styles.cardImgMobile} aria-label={proj.title}>
              {imgSmall && (
                <img
                  src={imgSmall}
                  alt={proj.imagenDestacada?.alt || proj.title}
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                />
              )}
            </Link>
            <div className={styles.cardInfoMobile}>
              <h2 className={styles.titleLink}>{proj.title}</h2>
              <div className={styles.cardMetaMobile}>
                <span>{proj.date ? new Date(proj.date).getFullYear() : ''}</span>
                <span>{proj.types?.map((t) => t.name).join(', ') || ''}</span>
                <span className={styles.category}>
                  {proj.categories?.map((c) => c.name).join(', ') || ''}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div key={proj.slug} className={styles.row}>
            <Link href={`/work/${proj.id}`} className={styles.rowOverlay} aria-label={proj.title} />

            <div className={`${styles.col} ${styles.colYear}`}>
              <h3>{proj.date ? new Date(proj.date).getFullYear() : ''}</h3>
            </div>
            <div className={`${styles.col} ${styles.colTitle}`}>
              <h2 className={styles.titleLink}>{proj.title}</h2>
            </div>
            <div className={`${styles.col} ${styles.colType}`}>
              <h3>{proj.types?.map((t) => t.name).join(', ') || ''}</h3>
            </div>
            <div className={`${styles.col} ${styles.colCategory}`}>
              <h3>{proj.categories?.map((c) => c.name).join(', ') || ''}</h3>
            </div>

            {imgLarge && (
              <div className={styles.colImg}>
                <img
                  src={imgLarge}
                  alt={proj.imagenDestacada?.alt || proj.title}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  style={{
                    objectFit: 'cover',
                    transition: 'opacity 0.5s ease',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      <div id="infinite-scroll-sentinel" style={{ height: 1 }} />
      {isLoadingMore && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <span>cargando más...</span>
        </div>
      )}
    </main>
  );
}
