'use client';

import { useEffect, useRef, useState } from 'react';
// Removed Next.js Image; using native <img>
import { useRouter } from 'next/navigation';
import styles from './ui/home.module.css';
import { useCursor } from './components/CursorProvider';

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

  const [heroSrc, setHeroSrc] = useState<string | null>(null);
  const [showHero, setShowHero] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const { show, hide, move, isTouch } = useCursor();

  useEffect(() => {
    async function fetchProjects() {
      const url = `${backendUrl}/api/projects?depth=1&limit=1000&where[featured][equals]=true&sort=order`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      const docs: Project[] = Array.isArray(data?.docs) ? data.docs : [];
      const sorted = [...docs].sort((a: any, b: any) => {
        const ao = typeof a.order === 'number' ? a.order : 1e9;
        const bo = typeof b.order === 'number' ? b.order : 1e9;
        return ao - bo;
      });

      setProjects(sorted);
      setFiltered(sorted);
    }
    fetchProjects();
  }, [backendUrl]);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const head = await fetch('/cache/hero.mp4', { method: 'HEAD', cache: 'no-store' });
        if (!aborted && head.ok) {
          setHeroSrc('/cache/hero.mp4');
          fetch('/api/cache-hero').catch(() => {});
          return;
        }

        await fetch('/api/cache-hero', { cache: 'no-store' });
        if (aborted) return;

        const head2 = await fetch('/cache/hero.mp4', { method: 'HEAD', cache: 'no-store' });
        if (!aborted && head2.ok) {
          setHeroSrc('/cache/hero.mp4');
          return;
        }

        const base =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          (process.env.PAYLOAD_API_URL ? process.env.PAYLOAD_API_URL.replace(/\/api$/, '') : undefined);
        if (!base) {
          setShowHero(false);
          return;
        }
        const res = await fetch(`${base}/api/globals/video-inicial`, { cache: 'no-store' });
        if (!res.ok) {
          setShowHero(false);
          return;
        }
        const data = await res.json();
        const v = data?.video?.url ? `${base}${data.video.url}` : null;
        if (!aborted) {
          if (v) setHeroSrc(v);
          else setShowHero(false);
        }
      } catch {
        if (!aborted) setShowHero(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  useEffect(() => {
    if (showHero) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showHero]);

  useEffect(() => {
    if (showHero && !hideTimerRef.current) {
      hideTimerRef.current = setTimeout(() => {
        setShowHero(false);
      }, 3000);
    }
    return () => {
      clearHideTimer();
    };
  }, [showHero]);

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.PAYLOAD_API_URL ? process.env.PAYLOAD_API_URL.replace(/\/api$/, '') : undefined);
    if (!base) return;
    const origin = base.replace(/^(https?:\/\/[^\/]+).*/, '$1');
    const mk = (rel: string, href: string) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      return link;
    };
    const l1 = mk('preconnect', origin);
    const l2 = mk('dns-prefetch', origin);
    return () => {
      l1 && document.head.removeChild(l1);
      l2 && document.head.removeChild(l2);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const images = Array.from(document.querySelectorAll<HTMLDivElement>('.fade-img'));
    if (images.length === 0) return;

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    );

    images.forEach((img) => io.observe(img));
    return () => io.disconnect();
  }, [filtered]);

  useEffect(() => {
    if (selectedType) {
      setFiltered(projects.filter((p) => p.types?.some((t) => t.slug === selectedType)));
    } else {
      setFiltered(projects);
    }
  }, [selectedType, projects]);

  useEffect(() => {
    setVisibleProjects([]);
    filtered.forEach((project, i) => {
      setTimeout(() => {
        setVisibleProjects((prev) => [...prev, project.slug]);
      }, i * 150);
    });
  }, [filtered]);

  const goToProject = (id: string) => {
    router.push(`/work/${id}`);
  };

  return (
    <>
      {showHero && (
        <section className={styles.heroSection}>
          <div className={styles.heroVideoWrapper}>
            {heroSrc && (
              <video
                ref={videoRef}
                className={styles.heroVideo}
                src={heroSrc}
                muted
                playsInline
                autoPlay
                preload="auto"
                style={{ opacity: videoReady ? 1 : 0, transition: 'opacity 120ms linear' }}
                onLoadedData={() => setVideoReady(true)}
                onEnded={() => {
                  clearHideTimer();
                  setShowHero(false);
                }}
                onError={() => {
                  clearHideTimer();
                  setShowHero(false);
                }}
                crossOrigin="anonymous"
              />
            )}
          </div>
        </section>
      )}

      <main className={styles.projectList} style={{ display: showHero ? 'none' : 'block' }}>
        {filtered.map((project, index) => {
          const rawUrl = project.imagenDestacada?.url || '';
          const cleanUrl = rawUrl.replace(/\?.*$/, '').replace(/ /g, '%20');
          const isUrlClean = !/\?.+/.test(rawUrl);

          return (
            <section key={project.id}>
              <div
                className={`${styles.projectCard} ${
                  index % 2 === 0 ? styles.leftImage : styles.rightImage
                } ${visibleProjects.includes(project.slug) ? styles.show : ''}`}
              >
                {cleanUrl && (
                  <div>
                    <div
                      className={`${styles.imageContainer} fade-img`}
                      style={{ cursor: isTouch ? 'pointer' : 'none' }}
                      onMouseEnter={() => {
                        if (!isTouch) show('SEE\nPROJECT', { align: 'right' });
                      }}
                      onMouseLeave={() => hide()}
                      onMouseMove={(e) => {
                        if (!isTouch) move(e.clientX, e.clientY);
                      }}
                      onClick={() => goToProject(project.id)}
                      title={`${project.title}`}
                    >
                      <div className={styles.overlay}>
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
                      </div>

                      <img
                        src={`${backendUrl}${cleanUrl}`}
                        alt={project.imagenDestacada?.alt || project.title}
                        className={styles.projectCardImage}
                        loading={index < 2 ? 'eager' : 'lazy'}
                        width={project.imagenDestacada?.width || 1400}
                        height={project.imagenDestacada?.height || 900}
                        style={{
                          objectFit: 'cover',
                          transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
                          width: '100%',
                          height: 'auto',
                        }}
                        decoding="async"
                      />
                    </div>

                    <div className={styles.projectInfoRow}>
                      <div>
                        <h2 className={styles.h2Home}>{project.title}</h2>
                      </div>

                      <div className={styles.projectDetails}>
                        <div className={styles.projectDate}>
                          <h3>{new Date().getFullYear()}</h3>
                        </div>
                        <div className={styles.projectCategory}>
                          <h3 className={styles.h3Category}>
                            {project.categories && project.categories.length > 0
                              ? project.categories.map((t) => t.name).join(', ')
                              : 'Sin Categoría'}
                          </h3>
                        </div>
                        <div className={styles.projectType}>
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
          );
        })}
      </main>
    </>
  );
}
