import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { notes } from "../utils/atlasManagement";
import { noteSearch } from "../utils/general";

export default function Home({ notes }) {
  const [ search, setSearch ] = useState("");
  return (
    <main id="home" style={{width: "50%", margin: "auto"}}>
      <Head>
        <title>Le Atlas</title>
      </Head>
      <main>
        <h1>
          Welcome to Le Atlas!
        </h1>
        <p>Just a place to display my Digital Garden (notes) and stuff</p>
        <p>Built with Next.js and the UnifiedJS Parsing Ecosystem</p>
        <h2>Links</h2>
        <ul>
          <li>
            <h3>Graphs</h3>
            <ul>
              <li><Link href="/atlas/graph/2D">2D Graph (Not yet)</Link></li>
              <li><Link href="/atlas/graph/3D">3D Graph</Link></li>
            </ul>
          </li>
          <li>
            <h3>Notes</h3>
            <Link href="/atlas/">Go to the Atlas</Link>
          </li>
        </ul>
        <section>
          <h2>Search</h2>
          <p>
            This search is a bit special. It splits up your search into multiple
            RegExes and scores it based on the matching parts. Inspired by
            the <a
              href="https://github.com/oantolin/orderless"
              target="_blank" rel="noreferrer"
            >Orderless</a> Emacs plugin (Though not even close in implementation)
          </p>
          <input
            type="text"
            onChange={evt => setSearch(evt.target.value)}
            value={search}
            placeholder="Search for a Note"
          />
          <ul>
            {noteSearch(search, Object.entries(notes))
              .map(([slug, note]) =>
                <li key={slug}>
                  <Link href={`/atlas/?notes=${slug}`}>
                    {note.title}
                  </Link>
                </li>
              )}
          </ul>
        </section>
      </main>
      <footer>
        Made by KV Le
      </footer>
    </main>
  )
}

export const getStaticProps = async context => {
    return { props: { notes } };
};