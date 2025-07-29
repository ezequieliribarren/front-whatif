'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ui/home.module.css';
import FilterBar from './components/filterBar';

type ProjectCategory = {
  id: string;
  name: string;
  slug: string;
};

type ProjectType = {
  id: string;
  name: string;
  slug: string;
};

type Project = {
  id: string;
  title: string;
  slug: string;
  featured?: boolean;
  categories?: ProjectCategory[];
  types?: ProjectType[];
  imagenDestacada?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [visibleProjects, setVisibleProjects] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects?&depth=1`,
        { cache: 'no-store' }
      );
      const data = await res.json();

      setProjects(data.docs);
      setFiltered(data.docs.filter((p: Project) => p.featured));
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedType) {
      setFiltered(
        projects.filter(
          (p) => p.featured && p.types?.some((t) => t.slug === selectedType)
        )
      );
    } else {
      setFiltered(projects.filter((p) => p.featured));
    }
  }, [selectedType, projects]);

  // Animar entrada con fade-in escalonado cuando cambia filtered
  useEffect(() => {
    setVisibleProjects([]);
    filtered.forEach((project, i) => {
      setTimeout(() => {
        setVisibleProjects((prev) => [...prev, project.slug]);
      }, i * 150);
    });
  }, [filtered]);

  // Navegar a detalle usando el id en la URL
  const goToProject = (id: string) => {
    router.push(`/work/${id}`);
  };

  return (
    <main className={styles.projectList}> 
    
      <FilterBar onFilterChange={setSelectedType} />

     {filtered.map((project, index) => (
  <section key={project.id}> 
        <div
          key={project.id}
          className={`${styles.projectCard} ${index % 2 === 0 ? styles.leftImage : styles.rightImage
            } ${visibleProjects.includes(project.slug) ? styles.show : ''}`}
        >
          {project.imagenDestacada?.url && (
            <div>
              <div
                className={styles.imageContainer}
                style={{ cursor: 'pointer' }}
                onClick={() => goToProject(project.id)}
                title={`${project.title}`}
              >
                <div className={styles.overlay}>
                  <span className={styles.plusIcon}>+</span>
                </div>
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${project.imagenDestacada.url}`}
                  alt={project.imagenDestacada.alt || project.title}
                  className={styles.projectCardImage}
                />
              </div>
              <div className={styles.projectInfoRow}>
                <div>
                  <h2 className={styles.h2Home}>{project.title}</h2>
                </div>

                <div className={styles.projectDetails}>
                  <div>
                    <h3>{new Date().getFullYear()}</h3>
                  </div>
                  <div>
                    <h3 className={styles.h3Category}>
                      {project.categories && project.categories.length > 0
                        ? project.categories.map((t) => t.name).join(', ')
                        : 'Sin Categoría'}
                    </h3>
                  </div>
                  <div>
                    <h3>
                      {project.types && project.types.length > 0
                        ? project.types.map((t) => t.name).join(', ')
                        : 'Sin tipo'}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.emptyHalf}></div>
        </div>
       </section>
      ))}
    </main>
  );
}
