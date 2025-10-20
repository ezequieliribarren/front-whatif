export default function Head() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://69.62.110.55:3000';
  const origin = base.replace(/^(https?:\/\/[^\/]+).*/, '$1');
  return (
    <>
      <link rel="preconnect" href={origin} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={origin} />
    </>
  );
}

