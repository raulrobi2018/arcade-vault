import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname, relative, resolve, sep } from "node:path";

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const DOC_EXT = new Set([".md"]);
const IGNORED_DIRS = ["node_modules", ".next", "references"];

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let filePath;
try {
    filePath = JSON.parse(raw)?.tool_input?.file_path;
} catch {
    process.exit(0);
}
if (!filePath) process.exit(0);

const root = process.cwd();
const abs = resolve(root, filePath);
const rel = relative(root, abs);
const ext = extname(abs).toLowerCase();

if (!existsSync(abs)) process.exit(0);
if (rel.startsWith("..")) process.exit(0);
if (rel.split(sep).some((part) => IGNORED_DIRS.includes(part))) process.exit(0);
if (!CODE_EXT.has(ext) && !DOC_EXT.has(ext)) process.exit(0);

const run = (bin, args) =>
    spawnSync("npx", ["--no-install", bin, ...args], {
        cwd: root,
        encoding: "utf8",
        shell: true,
    });

const prettier = run("prettier", ["--write", `"${abs}"`]);
if (prettier.status !== 0) {
    console.error(`Prettier failed on ${rel}:\n${prettier.stderr}${prettier.stdout}`);
    process.exit(2);
}

if (CODE_EXT.has(ext)) {
    const eslint = run("eslint", ["--fix", `"${abs}"`]);
    if (eslint.status !== 0) {
        console.error(`ESLint errors in ${rel}:\n${eslint.stdout}${eslint.stderr}`);
        process.exit(2);
    }
}
