import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { notes } from "../utils/atlasManagement";

export default function Home({ notes }) {
  const [ search, setSearch ] = useState("");
  return (
    <main>
      <Head>
        <title>Le Atlas</title>
      </Head>
      <main>
        <h1>
          Welcome to Le Atlas!
        </h1>
        <h2>Links</h2>
        <ul>
          <li>
            <h3>Graphs</h3>
            <ul>
              <li><Link href="/atlas/graph/2D">2D Graph</Link></li>
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
          <input
            type="text"
            onChange={evt => setSearch(evt.target.value)}
            value={search}
            placeholder="Search for a Note"
          />
          <ul>
            {Object.entries(notes)
              .filter(([_, note]) =>
                search.length === 0
                || note.title.toLowerCase().includes(search.toLowerCase())
              )
              .map(([slug, note]) =>
                <li key={slug}>
                  <Link href={`/atlas/?notes=${slug}`}>
                    {note.title}
                  </Link>
                </li>
              )
            }
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