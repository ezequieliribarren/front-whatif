'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
// Removed Next.js Image; using native <img>
import { useMediaQuery } from 'react-responsive';
import styles from '../ui/work.module.css';
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
  categories?: CategoryOrType[];
  types?: CategoryOrType[];
  imagenDestacada?: Media;
};

type SortState = {
  column: 'date' | 'title' | 'types' | 'categories';
  direction: 'asc' | 'desc';
};

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortState, setSortState] = useState<SortState>({ column: 'date', direction: 'desc' });
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });

  // 🧠 Normaliza URL de imagen + genera versión optimizada (webp)
  const buildImageUrl = (u?: string | null, width = 800) => {
    if (!u) return null;
    const base = (backendUrl || '').replace(/\/$/, '');
    const path = u.startsWith('/') ? u : `/${u}`;
    return `${base}${path}?width=${width}&format=webp`;
  };

  // 🔹 Cargar proyectos desde Payload
  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch(`${backendUrl}/api/projects?depth=1&limit=1000`, { cache: 'no-store' });
      const data = await res.json();
      setProjects(data.docs || []);
    }
    if (backendUrl) fetchProjects();
  }, [backendUrl]);

  // 🔹 Filtrar y ordenar proyectos
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
          case 'title': return p.title.toLowerCase();
          case 'types': return p.types?.map((t) => t.name).join(',').toLowerCase() || '';
          case 'categories': return p.categories?.map((c) => c.name).join(',').toLowerCase() || '';
          default: return '';
        }
      };
      return val(a) < val(b) ? -dir : val(a) > val(b) ? dir : 0;
    });

    setFiltered(sorted);
    setVisibleCount(10);
  }, [projects, selectedType, sortState]);

  // 🔁 Scroll infinito
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
    sortState.column === column ? (sortState.direction === 'asc' ? ' ↑' : ' ↓') : '';

  const visibleProjects = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  return (
    <main className={styles.container}>
      <FilterBar onFilterChange={setSelectedType} />

      {!isTabletOrMobile && (
        <div className={`${styles.row} ${styles.headerRow}`}>
          {['date', 'title', 'types', 'categories'].map((col) => (
            <div
              key={col}
              className={`${styles.col} ${styles[`col${col.charAt(0).toUpperCase() + col.slice(1)}`]}`}
            >
              <h4
                onClick={() =>
                  setSortState((p) => ({
                    column: col as SortState['column'],
                    direction: p.column === col && p.direction === 'asc' ? 'desc' : 'asc',
                  }))
                }
                className={styles.sortableHeader}
              >
                {col}
                {getSortIndicator(col as SortState['column'])}
              </h4>
            </div>
          ))}
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
