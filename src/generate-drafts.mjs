import { mkdir, writeFile } from "node:fs/promises";

const value = (name, fallback = "") => process.env[name]?.trim() || fallback;
const configuredSourceUrl = value("PROMO_SOURCE_URL", value("PROMO_URL"));
const wordpressBaseUrl = value("PROMO_WORDPRESS_URL", "https://kazuhiro-beetle.com");
const discoverWordPressUrl = async () => {
  if (configuredSourceUrl) return configuredSourceUrl;
  const endpoint = new URL("/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc&_fields=link", wordpressBaseUrl);
  const latestResponse = await fetch(endpoint, { headers: { "user-agent": "social-promotion-drafts/1.1" } });
  if (!latestResponse.ok) throw new Error("Could not discover latest WordPress article: HTTP " + latestResponse.status);
  const posts = await latestResponse.json();
  const latestUrl = posts?.[0]?.link;
  if (!latestUrl) throw new Error("No published WordPress article was found");
  return latestUrl;
};
const sourceUrl = await discoverWordPressUrl();

const response = await fetch(sourceUrl, { headers: { "user-agent": "social-promotion-drafts/1.1" } });
if (!response.ok) throw new Error("Could not fetch article: HTTP " + response.status);
const html = await response.text();

const decodeEntities = (text = "") => text
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
const clean = (text = "") => decodeEntities(text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
const meta = (key, attribute = "property") => {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const keyMatch = tag.match(new RegExp(attribute + "=[\"']([^\"']+)", "i"));
    const contentMatch = tag.match(/content=[\"']([^\"']+)[\"']/i);
    if (keyMatch?.[1]?.toLowerCase() === key.toLowerCase() && contentMatch) return clean(contentMatch[1]);
  }
  return "";
};
const titleTag = clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
const heading = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
const description = meta("description", "name") || meta("og:description");
const title = meta("og:title") || titleTag || heading || "空冷ワーゲンに関する記事";
const visibleHtml = html.replace(/<(script|style|noscript|svg|head)\b[\s\S]*?<\/\1>/gi, " ");
const articleText = clean(visibleHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] || visibleHtml);
const firstSentence = articleText.split(/(?<=[。！？.!?])\s+/u)[0] || articleText;
const summary = description || firstSentence.slice(0, 180) || "空冷ワーゲンに関する記事を紹介します。";
const canonicalRaw = html.match(/<link[^>]+rel=[\"'][^\"']*canonical[^\"']*[\"'][^>]*href=[\"']([^\"']+)/i)?.[1] || "";
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
const xPrefix = [title, finalUrl, tagText].filter(Boolean).join("\n\n");
const remaining = Math.max(40, 280 - Array.from(xPrefix).length - 2);
const shortSummary = Array.from(summary).slice(0, remaining).join("").trim();
const xText = [title, shortSummary, finalUrl, tagText].filter(Boolean).join("\n\n");
const threadsText = ["空冷かずひろ", title, summary, finalUrl, tagText].filter(Boolean).join("\n\n");

const truncateForVideo = (text, limit = 110) => {
  const sentences = text.match(/[^。！？]+[。！？]?/gu) || [text];
  let result = "";
  for (const sentence of sentences) {
    const candidate = (result + sentence).trim();
    if (Array.from(candidate).length > limit) break;
    result = candidate;
  }
  if (result) return result;
  return Array.from(text).slice(0, limit - 1).join("") + "…";
};
const shortTitle = Array.from(title).slice(0, 36).join("").trim() + (Array.from(title).length > 36 ? "…" : "");
const tiktokHook = /用語|意味|購入|販売ページ/.test(title)
  ? "販売ページの用語、意味を知っていますか？"
  : /点検|車検|安全/.test(title)
    ? "空冷ビートルの安全確認、どこを見ていますか？"
    : /違い|比較/.test(title)
      ? "空冷ビートルの違い、知っていますか？"
      : "空冷ビートルの「" + shortTitle + "」を紹介します。";
const quotedTerms = Array.from(articleText.matchAll(/「([^」]{1,28})」/g), match => match[1]);
const inspectionTerms = ["エンジンコード", "シャシーナンバー"].filter(term => articleText.includes(term));
const tiktokSummary = /用語|販売ページ/.test(title) && quotedTerms.length
  ? "販売ページの用語「" + quotedTerms.slice(0, 3).join("」「") + "」を解説。" + (inspectionTerms.length ? inspectionTerms.join("・") + "は年式や仕様を確認する手がかりです。" : "")
  : truncateForVideo(summary);
const tiktokHashtags = tags.slice(0, 5);
const tiktokTagText = tiktokHashtags.map(tag => "#" + tag).join(" ");
const tiktokScenes = [
  { time: "0–3秒", onScreenText: tiktokHook, narration: tiktokHook, visualSuggestion: "記事テーマが伝わる実車・部品・写真、または大きなタイトルテロップ" },
  { time: "3–18秒", onScreenText: "この記事のポイント", narration: tiktokSummary, visualSuggestion: "記事の内容に沿った実物・資料・テロップを使用" },
  { time: "18–25秒", onScreenText: "続きはプロフィールへ", narration: "詳しくはプロフィール欄のブログリンクから。", visualSuggestion: "プロフィールへの誘導テロップ" }
];
const tiktokCaption = ["空冷かずひろ｜空冷ビートルのある暮らし", title, tiktokSummary, "記事の続きはプロフィール欄のブログリンクへ。", tiktokTagText].filter(Boolean).join("\n\n");
const tiktokDraft = {
  generatedAt: new Date().toISOString(),
  source: { title, url: finalUrl },
  durationSeconds: 25,
  scenes: tiktokScenes,
  caption: tiktokCaption,
  hashtags: tiktokHashtags
};

const output = {
  generatedAt: new Date().toISOString(),
  source: { sourceUrl, title, summary, url: finalUrl, hashtags: tags.slice(0, 8) },
  x: { text: xText, characterCount: Array.from(xText).length },
  threads: { text: threadsText, characterCount: Array.from(threadsText).length }
};

await mkdir("out", { recursive: true });
await writeFile("out/social-drafts.json", JSON.stringify(output, null, 2) + "\n");
const markdown = ["# SNS宣伝文ドラフト", "", "## 自動抽出情報", "", "- タイトル: " + title, "- 要約: " + summary, "- URL: " + finalUrl, "- ハッシュタグ: " + tagText, "", "## X", "", output.x.text, "", "## Threads", "", output.threads.text, ""].join("\n");
await writeFile("out/social-drafts.md", markdown);
const tiktokMarkdown = [
  "# TikTok動画用下書き",
  "",
  "> 下書きです。記事内容・使用素材・プロフィールのリンク先を確認してから手動投稿してください。TikTokへの自動投稿は行いません。",
  "",
  "## 元記事",
  "",
  "- タイトル: " + title,
  "- URL: " + finalUrl,
  "",
  "## 25秒の構成",
  "",
  ...tiktokScenes.flatMap(scene => [
    "### " + scene.time + "｜" + scene.onScreenText,
    "- ナレーション: " + scene.narration,
    "- 映像案: " + scene.visualSuggestion,
    ""
  ]),
  "## キャプション",
  "",
  tiktokCaption,
  "",
  "## ハッシュタグ",
  "",
  tiktokTagText,
  ""
].join("\n");
await writeFile("out/tiktok-draft.json", JSON.stringify(tiktokDraft, null, 2) + "\n");
await writeFile("out/tiktok-draft.md", tiktokMarkdown);
console.log(JSON.stringify({ generated: true, title, url: finalUrl, hashtags: tags.slice(0, 8), xCharacters: output.x.characterCount, threadsCharacters: output.threads.characterCount, tiktokDurationSeconds: tiktokDraft.durationSeconds, files: ["out/social-drafts.json", "out/social-drafts.md", "out/tiktok-draft.json", "out/tiktok-draft.md"] }));
