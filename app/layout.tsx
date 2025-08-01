'use client';

import './ui/global.css';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ui/layout.module.css';
import { useEffect, useState } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkIsMobile = () => setIsMobile(window.innerWidth <= 1024);
  checkIsMobile();

  window.addEventListener('resize', checkIsMobile);
  return () => window.removeEventListener('resize', checkIsMobile);
}, []);

  useEffect(() => {
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
  }, []);

  return (
    <html lang="en">
      <body>
        <div className={`${styles.navbar} ${scrollY > 5 ? styles.navbarScrolled : styles.navbarInitial}`}>
          <div className={`${styles.logoWrapper} ${isScrollingDown ? styles.logoUp : ''}`}>
            <Link href="/">
           <img
 className={`${styles.logo} ${isMobile ? styles.logoMobile : ''}`}
  src={isMobile ? '/logo-simple.png' : '/logo.png'}
  alt="Logo"
/>
            </Link>
          </div>

          {/* Nav desktop */}
          <nav className={`${styles.navLinks} ${isScrollingDown ? styles.linksUp : styles.linksDown}`}>
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
        <li><Link className={styles.link} href="/" onClick={() => setMenuOpen(false)}>CONTACT</Link></li>
  </ul>
</div>

        {children}
      </body>
    </html>
  );
}
