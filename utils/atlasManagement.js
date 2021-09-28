import fs from "fs";
import matter from "gray-matter";
import path from "path";
import slugify from "slugify";
import { notesFolder, resourcesFolder, validNoteExtensions, validResourceExtensions } from "../atlas.config";
import { markdownToHtmlAst } from "./parsing";

const root = process.cwd();

const walk = (currentPath, dir) => {
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
const resourcePaths = walk(root, "public", resourcesFolder)
    .filter(file => validResourceExtensions.includes(path.extname(file)))
    .map(resourcePath => resourcePath
        .replace(path.join(root, "public"), "").replaceAll("\\", "/")
    );

const normalizeFileName = filename =>
    filename.replaceAll("%20", " ").replaceAll("_", " ");

const linkReducer = (current, fn) => fn(current);
const linkifyNoteName = filename => [
    input => input.replaceAll("%20", "_"),
    input => input.replaceAll(" ", "_"),
    input => input.replace(".md", ""),
].reduce(linkReducer, filename);

const readNote = filePath =>
    fs.readFileSync(path.resolve(filePath), "utf-8");

const processWikiLinks = (content, notes) =>  {
    const outlinks = new Set();
    const newContent = content.replace(/\[\[([^\]]+)\]\]/g,
        (_wholeMatch, wholeLink) => {
            let [ fileLink, alias ] = wholeLink.split("|");
            if (!alias) alias = fileLink

            if (validResourceExtensions.includes(path.extname(fileLink))) {
                const resourceLink = resourcePaths.find(resource =>
                    path.basename(resource) === fileLink);
                return `[${alias}](${encodeURI(resourceLink)})`;
            }

            let [ file, heading ] = fileLink.split("#");
            if (heading) heading = slugify(heading, {lower: true});
            file = linkifyNoteName(file);
            if (file in notes) {
                outlinks.add(file);
                return `[${alias}](/atlas/page/${file}${heading ? `#${heading}` : ""}/)`;
            }

            if (heading) return `[${alias}](#${heading})`;

            return `[${alias}](#)`;
        }
    )
    return { outlinks, newContent };
};

// These are full paths as these are generated a build time
const notePaths = walk(root, notesFolder)
    .filter(file => validNoteExtensions.includes(path.extname(file)));

const buildNoteDatabase = () => {
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
        note.htmlAst = JSON.stringify(markdownToHtmlAst(note.content));
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