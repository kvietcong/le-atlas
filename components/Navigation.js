import Link from "next/link";
import { useContext } from "react";
import { AtlasContext } from "../pages/_app";

export default function Navigation({ notePanes, reset }) {
    const { isDarkMode, setIsDarkMode } = useContext(AtlasContext);

    return <nav>
        <button><Link href="/">Go Home 🏘️</Link></button>
        <button onClick={() => document.getElementById(notePanes[0])
            .scrollIntoView({ behavior: "smooth" })}
        >
            Go to first note
        </button>
        <button onClick={() => document.getElementById(notePanes.slice(-1)[0])
            .scrollIntoView({ behavior: "smooth" })}
        >
            Go to last note
        </button>
        <button onClick={() => {
            navigator.clipboard.writeText(
                document.location.origin +
                "/atlas/?notes="
                + decodeURIComponent(notePanes.join(";")));
        }}>
            Copy URL of current pages
        </button>
        <button onClick={() => setIsDarkMode(!isDarkMode)}>
            {`Switch to ${isDarkMode ? "Light" : "Dark"} Mode`}
        </button>
        <button onClick={reset}>Clear Pages</button>
    </nav>;
};