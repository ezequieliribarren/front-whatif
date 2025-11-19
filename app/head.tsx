export default function Head() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://69.62.110.55:3000';
  const origin = base.replace(/^(https?:\/\/[^\/]+).*/, '$1');
  return (
    <>
      <title>WHAT IF ARCHITECTURE</title>
      <meta
        name="description"
        content="WHAT IF ARCHITECTURE — Architecture and design studio."
      />
      <link rel="icon" href="/favicon.ico" />
      <link rel="preconnect" href={origin} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={origin} />
    </>
  );
}
