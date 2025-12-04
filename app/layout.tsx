import './ui/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { ReactNode } from 'react';
import NavbarClient from './NavbarClient';
import Providers from './Providers';

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavbarClient />
          {children}
        </Providers>
      </body>
    </html>
  );
}
