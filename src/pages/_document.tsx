import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"/>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.min.css"/>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
