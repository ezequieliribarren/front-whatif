import './ui/global.css'
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ui/layout.module.css';



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className={styles.navbar}>
          <div>
            <Link href="/">  <img className={styles.logo} src="/logo.png" alt="Logo" /></Link>
          
          </div>
          <nav>
            <li>
               <Link className={styles.link} href="/work">WORK</Link>
            </li>
           <li>
              <Link  className={styles.link} href="/about">ABOUT</Link>
           </li>  
          </nav>
        </div>
        {children}
      </body>
    </html>
  );
}

