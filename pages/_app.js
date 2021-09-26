import Head from "next/head";
import "../styles/globals.css";

const MyApp = ({ Component, pageProps }) => <>
    <Head>
      <meta name="description" content="Le Atlas: KV's Digital Garden" />
      <link rel="icon" href="/favicon.ico" />

      {/* Latex using Katex */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.css" integrity="sha384-zTROYFVGOfTw7JV7KUu8udsvW2fx4lWOsCEDqhBreBwlHI4ioVRtmIvEThzJHGET" crossOrigin="anonymous"/>
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.js" integrity="sha384-GxNFqL3r9uRJQhR+47eDxuPoNE7yLftQM8LcxzgS4HT73tp970WS/wV5p8UzCOmb" crossOrigin="anonymous"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/contrib/auto-render.min.js" integrity="sha384-vZTG03m+2yp6N6BNi5iM4rW4oIwk5DfcNdFfxkk9ZWpDriOkXX8voJBFrAO7MpVl" crossOrigin="anonymous"
          onLoad="renderMathInElement(document.body);"></script>

    {/* Mermaid */}
    <script defer src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  </Head>
  <Component {...pageProps} />
</>;

export default MyApp;
