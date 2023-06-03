import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="preload"
          href="/font/SourceSansProL.ttf"
          as="font"
          type="font/ttf"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/font/SourceSansProR.ttf"
          as="font"
          type="font/ttf"
          crossOrigin=""
        />
        <link rel="preload" href="/img/s2.jpg" as="image" />
        <link
          rel="preload"
          href="/font/fa-regular-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/font/fa-solid-900.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
