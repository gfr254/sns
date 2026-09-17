import { mkdir, writeFile } from "node:fs/promises";

const value = (name, fallback = "") => process.env[name]?.trim() || fallback;
const title = value("PROMO_TITLE");
const summary = value("PROMO_SUMMARY");
const url = value("PROMO_URL");
const tags = value("PROMO_HASHTAGS").split(/[ ,]+/).map(tag => tag.replace(/^#/, "")).filter(Boolean).slice(0, 8);

if (!title) throw new Error("PROMO_TITLE is required");
if (!summary) throw new Error("PROMO_SUMMARY is required");

const tagText = tags.map(tag => "#" + tag).join(" ");
const xPrefix = [title, url, tagText].filter(Boolean).join("\n\n");
const remaining = Math.max(40, 280 - Array.from(xPrefix).length - 2);
const shortSummary = Array.from(summary).slice(0, remaining).join("").trim();
const xText = [title, shortSummary, url, tagText].filter(Boolean).join("\n\n");
const threadsText = ["空冷かずひろ", title, summary, url, tagText].filter(Boolean).join("\n\n");

const output = {
  generatedAt: new Date().toISOString(),
  source: { title, summary, url, hashtags: tags },
  x: { text: xText, characterCount: Array.from(xText).length },
  threads: { text: threadsText, characterCount: Array.from(threadsText).length }
};

await mkdir("out", { recursive: true });
await writeFile("out/social-drafts.json", JSON.stringify(output, null, 2) + "\n");
const markdown = ["# SNS宣伝文ドラフト", "", "## X", "", output.x.text, "", "## Threads", "", output.threads.text, ""].join("\n");
await writeFile("out/social-drafts.md", markdown);
console.log(JSON.stringify({ generated: true, xCharacters: output.x.characterCount, threadsCharacters: output.threads.characterCount, files: ["out/social-drafts.json", "out/social-drafts.md"] }));