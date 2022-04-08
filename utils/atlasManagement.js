import fs from "fs";
import matter from "gray-matter";
import path from "path";
import slugify from "slugify";
import { noteFolders, recursiveSearching, resourcesFolder, validNoteExtensions, validResourceExtensions } from "../atlas.config";

const root = process.cwd();

const walk = (currentPath, dir, isRecursive = true) => {
    const pathToRead = path.join(currentPath, dir);
    const fileItems = fs.readdirSync(pathToRead, { withFileTypes: true });
    const allFiles = [];
    for (const fileItem of fileItems) {
        if (fileItem.isDirectory()) {
            if (isRecursive) {
                allFiles.push(...walk(pathToRead, fileItem.name));
            }
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
        .replace(path.join(root, "public"), "")
        .replace(/\\/g, "/"));

const titleToSlug = filename => [
    input => input.replace(/%20/g, "_"),
    input => input.replace(/ /g, "_"),
    input => input.replace(/\.md/g, ""),
].reduce((newName, fn) => fn(newName), filename);

const readNote = filePath =>
    fs.readFileSync(path.resolve(filePath), "utf-8");

// Probably the worst way to do this XD
const processWikiLinks = (content, notes) => {
    const outlinks = new Set();
    const newContent = content.replace(/\[\[([^\]]+)\]\]/g,
        (_wholeMatch, wholeLink) => {
            const [ fileLink, possibleAlias ] = wholeLink.split("|");
            const alias = possibleAlias ?? fileLink;

            if (validResourceExtensions.includes(path.extname(fileLink))) {
                const resourceLink = resourcePaths.find(resource =>
                    path.basename(resource) === fileLink);
                return `[${alias}](${encodeURI(resourceLink)})`;
            }

            const [ title, heading ] = fileLink.split("#");
            const fileSlug = titleToSlug(title);
            const headingSlug = heading ? slugify(heading, { lower: true}) : null;

            if (fileSlug in notes) {
                outlinks.add(fileSlug);
                return `[${alias}](/atlas/${fileSlug}/)`;
            }
            if (headingSlug) return `[${alias}](#${headingSlug})`;

            return `[${alias}](#)`;
        }
    );

    return { outlinks, newContent };
};

// These are full paths as these are generated a build time
const notePaths = noteFolders.map(folder =>
    walk(root, folder, recursiveSearching)
        .filter(file => validNoteExtensions.includes(path.extname(file)))
).reduce((a, b) => a.concat(b), []);

const buildNoteDatabase = () => {
    const noteDatabase = {};
    for (const notePath of notePaths) {
        const { content, data: metadata } = matter(readNote(notePath));
        const title = path.basename(notePath, ".md");
        const slug = titleToSlug(title);
        const aliases = metadata.aliases ?? [];

        // Get Basic Data
        noteDatabase[slug] = {
            path: notePath, slug, title, aliases, content, metadata,
        };
    }

    // Deal with Wiki Links
    for (const noteInfo of Object.values(noteDatabase)) {
        const { outlinks, newContent } = processWikiLinks(noteInfo.content, noteDatabase);
        noteInfo.outlinks = outlinks;
        noteInfo.content = newContent;
    }

    // Get Inlinks for every note
    for (const noteInfo of Object.values(noteDatabase)) {
        noteInfo.inlinks = new Set();
        for (const otherNoteInfo of Object.values(noteDatabase)) {
            if (noteInfo !== otherNoteInfo && otherNoteInfo.outlinks.has(noteInfo.slug)) {
                noteInfo.inlinks.add(otherNoteInfo.slug);
            }
        }
    }

    // Make note data serializable
    for (const note of Object.values(noteDatabase)) {
        note.inlinks = [...note.inlinks];
        note.outlinks = [...note.outlinks];
        note.metadata = JSON.stringify(note.metadata, null, 4);
    }

    return noteDatabase;
};

export const noteDatabase = buildNoteDatabase();