'use client';

import styles from '../ui/filter.module.css';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetchFromPayload<{ docs: ProjectType[] }>('/projectTypes').then(data => {
      setTypes(data.docs);
    });
  }, []);

  const handleFilterClick = (slug: string | null) => {
    // Si clickeo el filtro activo, vuelvo a 'all' (null)
    const newSlug = slug === activeSlug ? null : slug;
    setActiveSlug(newSlug);
    onFilterChange(newSlug);
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterList}>
        {/* Filtro ALL */}
        <div
          key="all"
          className={`${styles.filterItem} ${activeSlug === null ? styles.active : ''}`}
          onClick={() => handleFilterClick(null)}
        >
          <h4>All</h4>
        </div>

        {/* Filtros por tipo */}
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
