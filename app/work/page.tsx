'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch(`${backendUrl}/api/projects?depth=1`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setProjects(data.docs);
      setFiltered(data.docs);
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedType) {
      setFiltered(
        projects.filter((p) =>
          p.types?.some((t) => t.slug === selectedType)
        )
      );
    } else {
      setFiltered(projects);
    }
  }, [selectedType, projects]);

  return (
    <main className={styles.container}>
      <FilterBar onFilterChange={setSelectedType} />

      {/* Cabecera */}
      <div className={`${styles.row} ${styles.headerRow}`}>
        <div className={`${styles.col} ${styles.colYear}`}><h4>year</h4></div>
        <div className={`${styles.col} ${styles.colTitle}`}><h4>name</h4></div>
        <div className={`${styles.col} ${styles.colType}`}><h4>type</h4></div>
        <div className={`${styles.col} ${styles.colCategory}`}><h4>category</h4></div>
        <div className={`${styles.col} ${styles.colImg}`}></div>
      </div>

      {/* Proyectos filtrados */}
      {filtered.map((proj) => (
        <div key={proj.slug} className={styles.row}>
          {/* Capa clickeable */}
          <Link
            href={`/work/${proj.id}`}
            className={styles.rowOverlay}
            aria-label={`Ir al proyecto ${proj.title}`}
          />

          <div className={`${styles.col} ${styles.colYear}`}>
            <h3>{proj.date ? new Date(proj.date).getFullYear() : '—'}</h3>
          </div>
          <div className={`${styles.col} ${styles.colTitle}`}>
            <h2 className={styles.titleLink}>{proj.title}</h2>
          </div>
          <div className={`${styles.col} ${styles.colType}`}>
            <h3>{proj.types?.map((t) => t.name).join(', ') || '—'}</h3>
          </div>
          <div className={`${styles.col} ${styles.colCategory}`}>
            <h3>{proj.categories?.map((c) => c.name).join(', ') || '—'}</h3>
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
      ))}
    </main>
  );
}
