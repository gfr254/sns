# 空冷かずひろ SNS宣伝ドラフト

WordPressの最新公開記事を自動で見つけ、XとThreads向けの宣伝文を生成するリポジトリです。

## 自動化の流れ

1. WordPress REST APIから最新公開記事のURLを取得
2. 記事ページからタイトルまたはOGPタイトルを抽出
3. meta descriptionや本文冒頭から要約を作成
4. canonical URLと記事内容に合うハッシュタグを取得
5. X向け短文とThreads向け紹介文を生成
6. Artifactとリポジトリの out/ に保存

対象WordPressサイトは https://kazuhiro-beetle.com です。特定の記事を使いたい場合は、後から repository_dispatch の source_url または url にURLを渡せます。

## 使い方

1. workflow-template/generate-social-drafts.yml の内容をコピーする
2. GitHub上で .github/workflows/generate-social-drafts.yml として保存する
3. Actions → Generate X and Threads promotion drafts → Run workflow を開く
4. 入力項目なしで実行する
5. Artifactまたは out/social-drafts.md を確認する

GitHubのAPI制限により、ワークフローファイルだけはテンプレートとして保存しています。コードとREADMEは反映済みです。

この仕組みは誤投稿を避けるため、現時点ではSNSへ直接投稿せず、投稿用の文章を生成します。記事本文にない所有・運転・修理経験は生成しません。

## 後から追加できるもの

- Hatena、Livedoor、Steemit、noteの公開URL連携
- ブログ側ワークフローからの repository_dispatch 連携
- X APIによる予約・自動投稿
- Threads API連携
- Instagram用画像キャプションと画像添付
- TikTok用動画説明文と投稿管理
