'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  const [sortState, setSortState] = useState<SortState>({
    column: 'date',
    direction: 'desc',
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });

  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch(`${backendUrl}/api/projects?depth=1`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setProjects(data.docs);
    }
    fetchProjects();
  }, [backendUrl]);

  useEffect(() => {
    let newFilteredProjects = selectedType
      ? projects.filter((p) =>
          p.types?.some((t) => t.slug === selectedType)
        )
      : [...projects];

    const sortedProjects = [...newFilteredProjects].sort((a, b) => {
      const { column, direction } = sortState;
      let aValue: any;
      let bValue: any;

      switch (column) {
        case 'date':
          aValue = a.date ? new Date(a.date).getFullYear() : 0;
          bValue = b.date ? new Date(b.date).getFullYear() : 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'types':
          aValue = a.types?.map((t) => t.name).join(', ').toLowerCase() || '';
          bValue = b.types?.map((t) => t.name).join(', ').toLowerCase() || '';
          break;
        case 'categories':
          aValue = a.categories?.map((c) => c.name).join(', ').toLowerCase() || '';
          bValue = b.categories?.map((c) => c.name).join(', ').toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFiltered(sortedProjects);
  }, [selectedType, projects, sortState]);

  const handleSort = (column: SortState['column']) => {
    setSortState((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIndicator = (column: SortState['column']) => {
    if (sortState.column === column) {
      return sortState.direction === 'asc' ? ' ↑' : '↓';
    }
    return '';
  };

  return (
    <main className={styles.container}>
      <FilterBar onFilterChange={setSelectedType} />

      {!isTabletOrMobile && (
        <div className={`${styles.row} ${styles.headerRow}`}>
          <div className={`${styles.col} ${styles.colYear}`}>
            <h4
              onClick={() => handleSort('date')}
              className={styles.sortableHeader}
              style={{ cursor: 'pointer' }}
            >
              year{getSortIndicator('date')}
            </h4>
          </div>
          <div className={`${styles.col} ${styles.colTitle}`}>
            <h4
              onClick={() => handleSort('title')}
              className={styles.sortableHeader}
              style={{ cursor: 'pointer' }}
            >
              name{getSortIndicator('title')}
            </h4>
          </div>
          <div className={`${styles.col} ${styles.colType}`}>
            <h4
              onClick={() => handleSort('types')}
              className={styles.sortableHeader}
              style={{ cursor: 'pointer' }}
            >
              type{getSortIndicator('types')}
            </h4>
          </div>
          <div className={`${styles.col} ${styles.colCategory}`}>
            <h4
              onClick={() => handleSort('categories')}
              className={styles.sortableHeader}
              style={{ cursor: 'pointer' }}
            >
              category{getSortIndicator('categories')}
            </h4>
          </div>
          <div className={`${styles.col} ${styles.colImg}`}></div>
        </div>
      )}

      {filtered.map((proj) =>
        isTabletOrMobile ? (
          <div key={proj.slug} className={styles.cardMobile}>
            <Link
              href={`/work/${proj.id}`}
              className={styles.cardImgMobile}
              style={{
                backgroundImage: proj.imagenDestacada?.url
                  ? `url(${backendUrl + proj.imagenDestacada.url})`
                  : 'none',
                position: 'relative',
                display: 'block',
              }}
              aria-label={`Ir al proyecto ${proj.title}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="58"
                height="58"
                viewBox="0 0 38 38"
                fill="none"
                className={styles.plusIcon}
              >
                <path d="M18.748 0V37.5" stroke="white" strokeWidth="2" />
                <path d="M37.5 18.7478L0 18.7478" stroke="white" strokeWidth="2" />
              </svg>
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
            <Link
              href={`/work/${proj.id}`}
              className={styles.rowOverlay}
              aria-label={`Ir al proyecto ${proj.title}`}
            />

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
            {proj.imagenDestacada?.url && (
              <div
                className={styles.colImg}
                style={{
                  backgroundImage: `url(${backendUrl + proj.imagenDestacada.url})`,
                }}
              />
            )}
          </div>
        )
      )}
    </main>
  );
}
