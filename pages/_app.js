import Head from "next/head";
import { createContext, useEffect, useState } from "react";
import "../styles/globals.css";

export const AtlasContext = createContext();
const AtlasProvider = props => {
  const [ isDarkMode, setIsDarkMode ] = useState(true);
  useEffect(() => {
    const localIsDarkMode = localStorage.getItem("isDarkMode");
    setIsDarkMode(localIsDarkMode === "true");
  }, []);
  useEffect(() => {
    const toAdd = isDarkMode ? "dark-mode" : "light-mode";
    const toRemove = isDarkMode ? "light-mode" : "dark-mode";
    const body = document.querySelector("body");
    body.classList.remove(toRemove);
    body.classList.add(toAdd);
    localStorage.setItem("isDarkMode", isDarkMode);
  }, [ isDarkMode ]);

  return <AtlasContext.Provider value={{ isDarkMode, setIsDarkMode }}>
    {props.children}
  </AtlasContext.Provider>;
};

const MyApp = ({ Component, pageProps }) => {
  return <>
    <Head>
      <meta name="description" content="Le Atlas: KV's Digital Garden" />
      <link rel="icon" href="/favicon.ico" />

      {/* Latex using Katex */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.css" integrity="sha384-zTROYFVGOfTw7JV7KUu8udsvW2fx4lWOsCEDqhBreBwlHI4ioVRtmIvEThzJHGET" crossOrigin="anonymous"/>
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.js" integrity="sha384-GxNFqL3r9uRJQhR+47eDxuPoNE7yLftQM8LcxzgS4HT73tp970WS/wV5p8UzCOmb" crossOrigin="anonymous"/>
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/contrib/auto-render.min.js" integrity="sha384-vZTG03m+2yp6N6BNi5iM4rW4oIwk5DfcNdFfxkk9ZWpDriOkXX8voJBFrAO7MpVl" crossOrigin="anonymous" onLoad="renderMathInElement(document.body);"/>

      {/* Mermaid */}
      <script defer src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    </Head>
    <AtlasProvider>
      <Component {...pageProps} />
    </AtlasProvider>
  </>
};

export default MyApp;
