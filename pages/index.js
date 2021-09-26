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
          Welcome to <Link href="atlas/page/-_Index_-">Le Atlas!</Link>
        </h1>
        <h2>Links</h2>
        <ul>
          <li>
            <h3>Graphs</h3>
            <ul>
              <li><Link href="atlas/graph/2D">2D Graph</Link></li>
              <li><Link href="atlas/graph/3D">3D Graph</Link></li>
            </ul>
          </li>
          <li>
            <h3>Notes</h3>
            <ul>
              <li><Link href="atlas/page/-_Index_-">Index</Link></li>
              <li><Link href="atlas/page/My_Note_System">My Note System</Link></li>
            </ul>
          </li>
        </ul>
      </main>

      <footer>
        Made by KV Le
      </footer>
    </main>
  )
}
