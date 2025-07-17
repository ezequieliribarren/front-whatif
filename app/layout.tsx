'use client';

import './ui/global.css';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ui/layout.module.css';
import { useEffect, useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [scrollY, setScrollY] = useState(0);

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
        <div
          className={`${styles.navbar} ${scrollY > 5 ? styles.navbarScrolled : styles.navbarInitial
            }`}
        >
          <div
            className={`${styles.logoWrapper} ${isScrollingDown ? styles.logoUp : ''
              }`}
          >
            <Link href="/">
              <img className={styles.logo} src="/logo.png" alt="Logo" />
            </Link>
          </div>

          <nav
            className={`${styles.navLinks} ${isScrollingDown ? styles.linksUp : styles.linksDown
              }`}
          >
            <li>
              <Link className={styles.link} href="/work">
                WORK
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/about">
                ABOUT
              </Link>
            </li>
          </nav>
        </div>
        {children}
      </body>
    </html>
  );
}
