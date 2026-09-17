import { mkdir, writeFile } from "node:fs/promises";

const value = (name, fallback = "") => process.env[name]?.trim() || fallback;
const sourceUrl = value("PROMO_SOURCE_URL", value("PROMO_URL"));
if (!sourceUrl) throw new Error("PROMO_SOURCE_URL is required");

const response = await fetch(sourceUrl, { headers: { "user-agent": "social-promotion-drafts/1.1" } });
if (!response.ok) throw new Error("Could not fetch article: HTTP " + response.status);
const html = await response.text();

const decodeEntities = (text = "") => text
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">");
const clean = (text = "") => decodeEntities(text.replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ")).trim();
const meta = (key, attribute = "property") => {
  const escaped = key.replace(/[.*+?^()|[\\]\\\\]/g, "\\\\$&");
  const pattern = new RegExp("<meta[^>]+" + attribute + "=[\\\"']" + escaped + "[\\\"'][^>]*content=[\\\"']([^\\\"']+)", "i");
  return clean(html.match(pattern)?.[1] || "");
};
const titleTag = clean(html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i)?.[1] || "");
const heading = clean(html.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/i)?.[1] || "");
const description = meta("description", "name") || meta("og:description") || clean(html.match(/<meta[^>]+name=[\\\"']description[\\\"'][^>]*content=[\\\"']([^\\\"']+)/i)?.[1] || "");
const title = meta("og:title") || titleTag || heading || "空冷ワーゲンに関する記事";
const articleText = clean(html.match(/<article[^>]*>([\\s\\S]*?)<\\/article>/i)?.[1] || html);
const firstSentence = articleText.split(/(?<=[。！？.!?])\\s+/u)[0] || articleText;
const summary = description || firstSentence.slice(0, 180) || "空冷ワーゲンに関する記事を紹介します。";
const canonicalRaw = html.match(/<link[^>]+rel=[\\\"'][^\\\"']*canonical[^\\\"']*[\\\"'][^>]*href=[\\\"']([^\\\"']+)/i)?.[1] || "";
const finalUrl = new URL(canonicalRaw || sourceUrl, sourceUrl).href;

const tags = [];
const addTag = (tag) => { if (!tags.includes(tag)) tags.push(tag); };
addTag("空冷ワーゲン");
if (/(ビートル|Beetle|VW|ワーゲン)/i.test(title + " " + articleText)) addTag("VWビートル");
if (/(旧車|クラシック|classic)/i.test(title + " " + articleText)) addTag("旧車");
if (/(購入|選び|予算|維持|初心者)/.test(title + " " + articleText)) addTag("VW購入ガイド");
if (/(歴史|文化|イベント|ミーティング)/.test(title + " " + articleText)) addTag("VW文化");
if (/(部品|パーツ|構造|エンジン)/.test(title + " " + articleText)) addTag("VWパーツ");
addTag("空冷VW");

const tagText = tags.slice(0, 8).map(tag => "#" + tag).join(" ");
const xPrefix = [title, finalUrl, tagText].filter(Boolean).join("\\n\\n");
const remaining = Math.max(40, 280 - Array.from(xPrefix).length - 2);
const shortSummary = Array.from(summary).slice(0, remaining).join("").trim();
const xText = [title, shortSummary, finalUrl, tagText].filter(Boolean).join("\\n\\n");
const threadsText = ["空冷かずひろ", title, summary, finalUrl, tagText].filter(Boolean).join("\\n\\n");

const output = {
  generatedAt: new Date().toISOString(),
  source: { sourceUrl, title, summary, url: finalUrl, hashtags: tags.slice(0, 8) },
  x: { text: xText, characterCount: Array.from(xText).length },
  threads: { text: threadsText, characterCount: Array.from(threadsText).length }
};

await mkdir("out", { recursive: true });
await writeFile("out/social-drafts.json", JSON.stringify(output, null, 2) + "\\n");
const markdown = ["# SNS宣伝文ドラフト", "", "## 自動抽出情報", "", "- タイトル: " + title, "- 要約: " + summary, "- URL: " + finalUrl, "- ハッシュタグ: " + tagText, "", "## X", "", output.x.text, "", "## Threads", "", output.threads.text, ""].join("\\n");
await writeFile("out/social-drafts.md", markdown);
console.log(JSON.stringify({ generated: true, title, url: finalUrl, hashtags: tags.slice(0, 8), xCharacters: output.x.characterCount, threadsCharacters: output.threads.characterCount, files: ["out/social-drafts.json", "out/social-drafts.md"] }));
