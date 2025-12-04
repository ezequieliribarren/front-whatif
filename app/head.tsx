export default function Head() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://69.62.110.55:3000';
  const origin = base.replace(/^(https?:\/\/[^\/]+).*/, '$1');
  const metaTitle = 'WHAT IF Architecture';
  const metaDescription =
    'Somos un estudio de arquitectura donde construimos imaginarios colectivos que configuran nuestro cotidiano.';
  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="preconnect" href={origin} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={origin} />
    </>
  );
}
