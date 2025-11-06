'use client';

import { useEffect, useRef, useState } from 'react';
// Removed Next.js Image; using native <img>
import { useRouter } from 'next/navigation';
import styles from './ui/home.module.css';
import Link from 'next/link';
import aboutStyles from './ui/about.module.css';
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
  apagar?: boolean;
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

  // Sticky hero video state
  const [heroSrc, setHeroSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [viewportH, setViewportH] = useState<number>(typeof window !== 'undefined' ? window.innerHeight : 800);
  const [hRatio, setHRatio] = useState<number>(1);
  const [heroOpacity, setHeroOpacity] = useState<number>(1);
  const [trackH, setTrackH] = useState<number>(viewportH * 2.4);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const { show, hide, move, isTouch } = useCursor();

  useEffect(() => {
    async function fetchProjects() {
      const url = `${backendUrl}/api/projects?depth=1&limit=1000&locale=all&sort=order`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      const docs: Project[] = Array.isArray(data?.docs) ? data.docs : [];

      const isFeaturedTruthy = (val: any) => {
        if (val === true) return true;
        if (val === 1) return true;
        if (typeof val === 'string') return ['true', '1', 'on', 'yes'].includes(val.toLowerCase());
        return false;
      };

      // Keep only Featured and not apagado
      const featured = docs.filter((p: any) => isFeaturedTruthy((p as any).featured) && p?.apagar !== true);

      // Order by optional `order` field
      const sorted = featured.sort((a: any, b: any) => {
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
        if (!base) return;
        const res = await fetch(`${base}/api/globals/video-inicial`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const v = data?.video?.url ? `${base}${data.video.url}` : null;
        if (!aborted && v) setHeroSrc(v);
      } catch {
        // ignore
      }
    })();
    return () => { aborted = true; };
  }, []);

  // Track viewport height and mobile breakpoint
  useEffect(() => {
    const onResize = () => {
      setViewportH(window.innerHeight);
      setIsMobile(window.innerWidth <= 1024);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sticky hero animation: linear shrink to 20% then fade
  useEffect(() => {
    const minRatio = 0.2; // 20% of viewport
    const minH = Math.max(40, Math.round(viewportH * minRatio));
    const shrinkDist = Math.max(80, Math.round(viewportH * 0.22)); // quick dock to 20%
    const fadeRange = Math.round(viewportH * 0.45); // then fade to 0
    const totalDist = shrinkDist + fadeRange;
    setTrackH(viewportH + totalDist); // sticky track height so it stays pinned
    let ticking = false;
    const update = () => {
      const y = Math.max(0, Math.min(totalDist, window.scrollY));
      if (y <= shrinkDist) {
        const ratio = 1 - (y / Math.max(1, shrinkDist)) * (1 - minRatio);
        setHRatio(ratio);
        setHeroOpacity(1);
      } else {
        const prog = Math.min(1, (y - shrinkDist) / Math.max(1, fadeRange));
        const ratio = Math.max(0, minRatio * (1 - prog));
        setHRatio(ratio);
        setHeroOpacity(1 - prog);
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [viewportH, isMobile]);

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
    <div className={styles.homeWrapper} style={{ ['--maskH' as any]: `${Math.round(viewportH * hRatio)}px` }}>
      {heroSrc && (
        <div className={styles.heroTrack} style={{ height: `${trackH}px`, ['--maskH' as any]: `${Math.round(viewportH * hRatio)}px` }}>
          <section
            className={styles.stickyHero}
            style={{
              // Allow clicks to pass through when hero is gone
              pointerEvents: heroOpacity < 0.05 ? 'none' as const : 'auto',
              zIndex: heroOpacity < 0.05 ? 1 : 100001,
            }}
          >
            <div className={styles.heroInner}>
              <div
                className={styles.heroViewport}
                style={{ ['--maskH' as any]: `${Math.round(viewportH * hRatio)}px`, ['--heroOpacity' as any]: heroOpacity }}
              >
                {(() => {
                  const useContain = hRatio < 0.8; // when container starts shrinking, scale video instead of cropping
                  const videoClass = `${styles.stickyVideo} ${useContain ? styles.fitContain : ''}`;
                  return (
                    <video
                      ref={videoRef}
                      className={videoClass}
                      src={heroSrc}
                      muted
                      playsInline
                      autoPlay
                      loop
                      preload="auto"
                      crossOrigin="anonymous"
                    />
                  );
                })()}
                {heroOpacity > 0.95 && (
                  <button
                    className={styles.scrollCue}
                    aria-label="Scroll down"
                    title="Scroll"
                    onClick={() => window.scrollTo({ top: viewportH + 1, behavior: 'smooth' })}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      <main className={styles.projectList}>
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
        <section className="flex justify-center py-10">
          <Link
            href="/work"
            className={`flex items-center gap-2.5 px-4 py-1 border border-black text-black font-serif hover:bg-black hover:text-white transition-colors rounded ${aboutStyles.buttonSelected} ${aboutStyles.mobileOnly}`}
          >
            <span className="text-lg font-normal">Our Work</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
