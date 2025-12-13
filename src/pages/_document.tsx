import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6442166008118008"
          crossOrigin="anonymous"></script>
      </Head>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.min.css" />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
