import Head from "next/head";
import Link from "next/link";

export default function Home() {
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
      </main>

      <footer>
        Made by KV Le
      </footer>
    </main>
  )
}
