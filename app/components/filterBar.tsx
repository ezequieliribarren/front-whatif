'use client';

import styles from '../ui/filter.module.css';
import { useEffect, useState, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import { fetchFromPayload } from '../lib/fetchFromPayload';

type ProjectType = {
  id: string;
  name: string;
  slug: string;
};

type FilterBarProps = {
  onFilterChange: (slug: string | null) => void;
};

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFromPayload<{ docs: ProjectType[] }>('/projectTypes')
      .then(data => {
        setTypes(data.docs);
      })
      .catch((err) => {
        console.error('Error cargando tipos de proyecto', err);
        setTypes([]); // evita romper el render; solo muestra "All"
      });
  }, []);

  const handleFilterClick = (slug: string | null) => {
    const newSlug = slug === activeSlug ? null : slug;
    setActiveSlug(newSlug);
    onFilterChange(newSlug);
    if (isTabletOrMobile) setOpen(false);
  };

  // Cierra el menú si se hace click fuera
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (isTabletOrMobile) {
    return (
      <div className={styles.filterContainer} ref={containerRef}>
        {/* Botón Filters */}
        <div
          className={`${styles.filterToggle}`}
          onClick={() => setOpen((prev) => !prev)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <h4 className={styles.filterTitle}>
         <span><img src={open ? '/down.png' : '/up.png'} alt="toggle icon" /></span> Filters
          </h4>
        </div>
        {/* Menú flotante de filtros */}
        {open && (
          <div className={styles.filterMenu}>
            <div
              key="all"
              className={`${styles.filterItem} ${activeSlug === null ? styles.active : ''}`}
              onClick={() => handleFilterClick(null)}
            >
              <h4>All</h4>
            </div>
            {types.map((type) => (
              <div
                key={type.id}
                className={`${styles.filterItem} ${activeSlug === type.slug ? styles.active : ''}`}
                onClick={() => handleFilterClick(type.slug)}
              >
                <h4>{type.name}</h4>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterList}>
        <div
          key="all"
          className={`${styles.filterItem} ${activeSlug === null ? styles.active : ''}`}
          onClick={() => handleFilterClick(null)}
        >
          <h4>All</h4>
        </div>
        {types.map((type) => (
          <div
            key={type.id}
            className={`${styles.filterItem} ${activeSlug === type.slug ? styles.active : ''}`}
            onClick={() => handleFilterClick(type.slug)}
          >
            <h4>{type.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
