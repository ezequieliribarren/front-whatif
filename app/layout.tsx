'use client';

import './ui/global.css';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ui/layout.module.css';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import ContactModal from './components/contactModal';
import { CursorProvider, useCursor } from './components/CursorProvider';

// ✅ SEO – Metadatos globales (funcionan en App Router)
export const metadata = {
  title: 'WHAT IF Architecture',
  description:
    'Somos un estudio de arquitectura donde construimos imaginarios colectivos que configuran nuestro cotidiano.',
  openGraph: {
    title: 'WHAT IF Architecture',
    description:
      'Somos un estudio de arquitectura donde construimos imaginarios colectivos que configuran nuestro cotidiano.',
    type: 'website',
  },
};

function NavLinksWithCursor({ disableNavScroll, isScrollingDown }: { disableNavScroll: boolean; isScrollingDown: boolean }) {
  const { show, move, isTouch, hide } = useCursor();
  return (
    <nav className={`${styles.navLinks} ${!disableNavScroll && isScrollingDown ? styles.linksUp : styles.linksDown}`}>
      <li>
        <Link
          className={styles.link}
          href="/work"
          onMouseEnter={(e) => {
            if (!isTouch) {
              show('', { variant: 'arrow' });
              move((e as any).clientX, (e as any).clientY);
            }
          }}
          onMouseMove={(e) => { if (!isTouch) move((e as any).clientX, (e as any).clientY); }}
          onMouseLeave={() => { if (!isTouch) hide(); }}
          style={{ cursor: isTouch ? 'pointer' : 'none' }}
        >
          WORK
        </Link>
      </li>
      <li>
        <Link
          className={styles.link}
          href="/about"
          onMouseEnter={(e) => {
            if (!isTouch) {
              show('', { variant: 'arrow' });
              move((e as any).clientX, (e as any).clientY);
            }
          }}
          onMouseMove={(e) => { if (!isTouch) move((e as any).clientX, (e as any).clientY); }}
          onMouseLeave={() => { if (!isTouch) hide(); }}
          style={{ cursor: isTouch ? 'pointer' : 'none' }}
        >
          ABOUT
        </Link>
      </li>
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const disableNavScroll = false;

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const navRef = useRef<HTMLDivElement | null>(null);

  // Detecta mobile
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Calcula altura navbar
  useEffect(() => {
    const updateNavHeight = () => {
      const h = navRef.current?.getBoundingClientRect().height ?? 0;
      document.documentElement.style.setProperty('--nav-height', `${h}px`);
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, []);

  useEffect(() => {
    const h = navRef.current?.getBoundingClientRect().height ?? 0;
    document.documentElement.style.setProperty('--nav-height', `${h}px`);
  }, [disableNavScroll, isMobile]);

  // Scroll behavior
  useEffect(() => {
    if (disableNavScroll || isMobile) {
      setScrollY(0);
      setIsScrollingDown(false);
      return;
    }

    setScrollY(window.scrollY);
    setIsScrollingDown(window.scrollY > 5);

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > lastScrollY + 5) setIsScrollingDown(true);
          else if (currentScrollY < lastScrollY - 5) setIsScrollingDown(false);

          setScrollY(currentScrollY);
          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [disableNavScroll, isMobile]);

  return (
    <html lang="en">
      {/* ❗YA NO NECESITÁS <Head> → Next genera el SEO automáticamente */}
      <body className={disableNavScroll ? styles.noScrollNav : ''}>
        <CursorProvider>
          <div
            ref={navRef}
            className={`${styles.navbar} ${
              !disableNavScroll && scrollY > 5 ? styles.navbarScrolled : styles.navbarInitial
            }`}
          >
            <div className={`${styles.logoWrapper} ${!disableNavScroll && isScrollingDown ? styles.logoUp : ''}`}>
              <Link href="/">
                <img
                  className={`${styles.logo} ${isMobile ? styles.logoMobile : ''}`}
                  src={isMobile ? '/logo-simple.png' : '/logo.png'}
                  alt="Logo"
                />
              </Link>
            </div>

            {/* Nav Desktop */}
            <NavLinksWithCursor disableNavScroll={disableNavScroll} isScrollingDown={isScrollingDown} />

            {/* Icono hamburguesa */}
            {!menuOpen && (
              <div className={styles.menuIcon} onClick={() => setMenuOpen(true)}>
                <HiOutlineMenu size={40} />
              </div>
            )}
          </div>

          {/* Menú Mobile */}
          <div className={`${styles.mobileMenu} ${menuOpen ? styles.menuOpen : ''}`}>
            <button className={styles.closeButton} onClick={() => setMenuOpen(false)}>
              <HiOutlineX size={36} />
            </button>

            <ul>
              <li>
                <Link className={styles.link} href="/work" onClick={() => setMenuOpen(false)}>
                  WORK
                </Link>
              </li>
              <li>
                <Link className={styles.link} href="/about" onClick={() => setMenuOpen(false)}>
                  ABOUT
                </Link>
              </li>
              <li>
                <button
                  className={styles.link}
                  onClick={() => {
                    setContactModalOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  CONTACT
                </button>
              </li>
            </ul>
          </div>

          {children}

          <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
        </CursorProvider>
      </body>
    </html>
  );
}
