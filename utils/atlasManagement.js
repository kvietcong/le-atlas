import fs from "fs";
import matter from "gray-matter";
import path from "path";
import rehypeExternalLinks from "rehype-external-links";
import rehypeFormat from "rehype-format";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeMeta from "rehype-meta";
import rehypeStringify from "rehype-stringify";
import toc from "rehype-toc";
import remarkFootnotes from "remark-footnotes";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSlug from "remark-slug";
import { unified } from "unified";
import { notesFolder, resourcesFolder, validNoteExtensions, validResourceExtensions } from "../atlas.config";

const root = process.cwd();

export const walk = (currentPath, dir) => {
    const pathToRead = path.join(currentPath, dir);
    const fileItems = fs.readdirSync(pathToRead, { withFileTypes: true });
    const allFiles = [];
    for (const fileItem of fileItems) {
        if (fileItem.isDirectory()) {
            allFiles.push(...walk(pathToRead, fileItem.name));
        } else {
            allFiles.push(path.join(pathToRead, fileItem.name));
        }
    }
    const files = allFiles.filter(file =>
        validResourceExtensions.concat(validNoteExtensions)
            .some(ext => path.extname(file) === ext));
    return files;
};

// Paths are truncated to be valid for direct insert. This is because
// we statically reference them rather than transform them like the notes.
export const resourcePaths = walk(root, "public", resourcesFolder)
    .filter(file => validResourceExtensions.includes(path.extname(file)))
    .map(resourcePath => resourcePath
        .replace(path.join(root, "public"), "").replaceAll("\\", "/")
    );

export const normalizeFileName = filename =>
    filename.replaceAll("%20", " ").replaceAll("_", " ");

const linkReducer = (current, fn) => fn(current);
export const linkifyNoteName = filename => [
    input => input.replaceAll("%20", "_"),
    input => input.replaceAll(" ", "_"),
    input => input.replace(".md", ""),
].reduce(linkReducer, filename);

export const readNote = filePath =>
    fs.readFileSync(path.resolve(filePath), "utf-8");

const processWikiLinks = (content, notes) =>  {
    const outlinks = new Set();
    const newContent = content.replace(/\[\[([^\]]+)\]\]/g,
        (_wholeMatch, wholeLink) => {
            const fileLink = wholeLink.replace(/\|([^\|]+)/, "")
            const description = wholeLink.replace(/([^\|]+)\|/, "")
            if (description.length === 0) description = wholeLink
            if (fileLink.length === 0) fileLink = wholeLink

            if (validResourceExtensions.includes(path.extname(fileLink))) {
                const resourceLink = resourcePaths.find(resource =>
                    path.basename(resource) === fileLink);
                return `[${description}](${encodeURI(resourceLink)})`;
            }

            let fileSubLink = null;
            let fileMainLink = fileLink;
            if (fileMainLink.includes("#")) {
                fileSubLink = fileMainLink.split("#")[1]
                    .toLowerCase().replace(" ", "-");
                fileMainLink = fileMainLink.split("#")[0];
            }
            fileMainLink = linkifyNoteName(fileMainLink);

            if (fileMainLink in notes) {
                outlinks.add(fileMainLink);
                return `[${description}](/atlas/page/${fileMainLink}${fileSubLink ? `#${fileSubLink}` : ""}/)`;
            }

            if (fileSubLink) {
                return `[${description}](#${fileSubLink})`;
            }

            return `[${description}](#)`;
        }
    )
    return { outlinks, newContent };
};

export const mdToHTML = (content, metadata) =>
    unified()
        .use(remarkParse)
        .use(remarkFootnotes, { inlineNotes: true })
        .use(remarkMath)
        .use(remarkSlug)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeExternalLinks)
        .use(rehypeFormat)
        .use(rehypeHighlight, { ignoreMissing: true })
        .use(rehypeMeta, metadata)
        .use(toc, { nav: false, headings: ["h2", "h3", "h4", "h5", "h6"] })
        .use(rehypeStringify)
        .processSync(content)
        .toString()
        // OKAY THIS IS SO JANK TO GET MERMAID XD
        .replaceAll(
            /<pre><code class="hljs language-mermaid">((.|\n)*)<\/code><\/pre>/g,
            (wholeMatch, match) => `<div class="mermaid">${match}</div></pre>`
        );

// These are full paths as these are generated a build time
export const notePaths = walk(root, notesFolder)
    .filter(file => validNoteExtensions.includes(path.extname(file)));

export const buildNoteDatabase = () => {
    const notes = {};
    for (const notePath of notePaths) {
        const { content, data } = matter(readNote(notePath));

        // Get Basic Data
        const note = {
            path: notePath,
            link: linkifyNoteName(path.basename(notePath)),
            content,
            metadata: data,
        };
        notes[note.link] = {...note};
        notes[note.link].title = normalizeFileName(notes[note.link].link);
    }

    // Deal with Wiki Links
    for (const note of Object.values(notes)) {
        const { outlinks, newContent } = processWikiLinks(note.content, notes)
        note.outlinks = outlinks;
        note.content = newContent;
        try {
            note.html = mdToHTML(note.content, note.metadata);
        } catch(error) {
            console.log(`ERROR WITH PARSING: ${error}`);
        }
    }

    // Get Inlinks for every note
    for (const note of Object.values(notes)) {
        note.inlinks = new Set();
        for (const otherNote of Object.values(notes)) {
            if (note !== otherNote && otherNote.outlinks.has(note.link)) {
                note.inlinks.add({link: otherNote.link, title: otherNote.title});
            }
        }
    }

    // Make note data serializable
    for (const note of Object.values(notes)) {
        note.inlinks = [...note.inlinks];
        note.outlinks = [...note.outlinks];
        note.metadata = JSON.stringify(note.metadata, null, 4);
    }

    return notes;
};

export const notes = buildNoteDatabase();

export const staticPaths = Object.values(notes).map(note =>
    ({params: { slug: note.link }}));

export const testInput = `
# Hi there
This is a test

\`\`\`mermaid
    graph TD;
        A ==> B
\`\`\`
`;

const remarkFixMermaid = options => {
    console.log("Is this even called?");
    console.log(options);
    return ast => {
        console.log("IS THIS EVEN CALLED");
        visit(ast, "code", node => {
            console.log("HIIIIIII YOU MADE IT", node)
            if (node.lang === "mermaid") {
                node.type = "mermaid";
            }
            return node;
        });
    }
}

export const test = unified()
        .use(remarkParse)
        .use(remarkFixMermaid, {test: "test"})
        // .use(remarkFootnotes, { inlineNotes: true })
        // .use(remarkMath)
        // .use(remarkSlug)
        // .use(remarkGfm)
        // .use(remarkRehype)
        // .use(rehypeKatex)
        // .use(rehypeExternalLinks)
        // .use(rehypeFormat)
        // .use(rehypeHighlight, { ignoreMissing: true })
        // .use(rehypeMeta, metadata)
        // .use(toc, { nav: false, headings: ["h2", "h3", "h4", "h5", "h6"] })
        // .use(rehypeStringify)
        .parse(testInput);