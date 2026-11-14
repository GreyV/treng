#!/usr/bin/env node
// Builds src/data/oxford.json from the Oxford 3000 and 5000 word lists.
//
//   npm run import:oxford               # download the list page
//   npm run import:oxford -- page.html  # or read a saved copy of it
//
// Each entry is one headword with one part of speech and its CEFR level (A1–C1).
// The lists belong to Oxford University Press: fine for a prototype, but get
// permission (or switch to an open list) before publishing the app.
import { readFile, writeFile } from "node:fs/promises";

const URL = "https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000";
const OUT = new globalThis.URL("../src/data/oxford.json", import.meta.url);
const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1"]);

async function loadPage(file) {
  if (file) return readFile(file, "utf8");
  const res = await fetch(URL, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`GET ${URL}: ${res.status} ${res.statusText}`);
  return res.text();
}

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function parse(html) {
  const words = [];
  for (const [, body] of html.matchAll(/<li data-hw="[^"]*"[^>]*>(.*?)<\/li>/gs)) {
    const link = body.match(/<a href="\/definition\/english\/([^"]+)">([^<]+)<\/a>/);
    const pos = body.match(/<span class="pos">([^<]+)<\/span>/);
    const level = body.match(/<span class="belong-to">([^<]+)<\/span>/);
    if (!link || !pos || !level) throw new Error(`Unexpected entry: ${body.slice(0, 200)}`);

    const entry = {
      // One dictionary entry can cover several parts of speech (each: determiner,
      // pronoun, adverb), and one word can have several entries (lie_1, lie_2).
      id: `${link[1]}-${pos[1].replace(/ /g, "-")}`,
      text: decode(link[2]).trim(),
      pos: pos[1],
      level: level[1].toUpperCase(),
    };
    if (!LEVELS.has(entry.level)) throw new Error(`Unknown level "${level[1]}" for "${entry.text}"`);
    words.push(entry);
  }
  return words;
}

const words = parse(await loadPage(process.argv[2]));
if (words.length < 5000) throw new Error(`Only ${words.length} words found; did the page change?`);

const ids = new Set();
for (const { id } of words) {
  if (ids.has(id)) throw new Error(`Duplicate id: ${id}`);
  ids.add(id);
}

// One word per line keeps diffs readable when the list is updated.
await writeFile(OUT, `[\n${words.map((w) => JSON.stringify(w)).join(",\n")}\n]\n`);

const byLevel = {};
for (const { level } of words) byLevel[level] = (byLevel[level] ?? 0) + 1;
console.log(`Wrote ${words.length} words to src/data/oxford.json`, byLevel);
