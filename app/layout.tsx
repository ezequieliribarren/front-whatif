'use client';

import './ui/global.css';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ui/layout.module.css';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import ContactModal from './components/contactModal'; // Importa el componente ContactModal

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const disableNavScroll = pathname?.startsWith('/work/') === true;
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkIsMobile();

    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Expose navbar height as a CSS variable so pages can offset content
  useEffect(() => {
    const updateNavHeight = () => {
      const h = navRef.current?.getBoundingClientRect().height ?? 0;
      document.documentElement.style.setProperty('--nav-height', `${h}px`);
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, []);

  // Recompute when layout-affecting states change
  useEffect(() => {
    const h = navRef.current?.getBoundingClientRect().height ?? 0;
    document.documentElement.style.setProperty('--nav-height', `${h}px`);
  }, [disableNavScroll, isMobile]);

  useEffect(() => {
    if (disableNavScroll) {
      setScrollY(0);
      setIsScrollingDown(false);
      return; // Do not attach scroll listeners on project pages
    }

    setScrollY(window.scrollY);
    setIsScrollingDown(window.scrollY > 5);

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > lastScrollY + 5) {
            setIsScrollingDown(true);
          } else if (currentScrollY < lastScrollY - 5) {
            setIsScrollingDown(false);
          }

          setScrollY(currentScrollY);
          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [disableNavScroll]);

  return (
    <html lang="en">
      <body className={disableNavScroll ? styles.noScrollNav : ''}>
        <div ref={navRef} className={`${styles.navbar} ${!disableNavScroll && scrollY > 5 ? styles.navbarScrolled : styles.navbarInitial}`}>
          <div className={`${styles.logoWrapper} ${!disableNavScroll && isScrollingDown ? styles.logoUp : ''}`}>
            <Link href="/">
              <img
                className={`${styles.logo} ${isMobile ? styles.logoMobile : ''}`}
                src={isMobile ? '/logo-simple.png' : '/logo.png'}
                alt="Logo"
              />
            </Link>
          </div>

          {/* Nav desktop */}
          <nav className={`${styles.navLinks} ${!disableNavScroll && isScrollingDown ? styles.linksUp : styles.linksDown}`}>
            <li><Link className={styles.link} href="/work">WORK</Link></li>
            <li><Link className={styles.link} href="/about">ABOUT</Link></li>
          </nav>

          {/* Icono hamburguesa */}
          <div className={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <HiOutlineX size={40} /> : <HiOutlineMenu size={40} />}
          </div>
        </div>

        {/* Menú lateral mobile */}
        <div className={`${styles.mobileMenu} ${menuOpen ? styles.menuOpen : ''}`}>
          <button className={styles.closeButton} onClick={() => setMenuOpen(false)}>
            <HiOutlineX size={36} />
          </button>

          <ul>
            <li><Link className={styles.link} href="/work" onClick={() => setMenuOpen(false)}>WORK</Link></li>
            <li><Link className={styles.link} href="/about" onClick={() => setMenuOpen(false)}>ABOUT</Link></li>
            <li>
              <button className={styles.link} onClick={() => { setContactModalOpen(true); setMenuOpen(false); }}>
                CONTACT
              </button>
            </li>
          </ul>
        </div>

        {children}

        <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
      </body>
    </html>
  );
}
