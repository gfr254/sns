# 空冷かずひろ SNS宣伝ドラフト

XとThreads向けの宣伝文を、記事URLひとつから自動生成するリポジトリです。

## 自動生成するもの

記事ページを読み取り、ページタイトル、要約、canonical URL、記事内容に応じたハッシュタグ、X向け短文、Threads向け紹介文を自動生成します。

## 使い方

1. workflow-template/generate-social-drafts.yml の内容をコピーする
2. GitHub上で .github/workflows/generate-social-drafts.yml として保存する
3. Actions → Generate X and Threads promotion drafts → Run workflow を開く
4. 記事URLだけを入力する
5. Artifactまたは out/social-drafts.md を確認する

GitHubのAPI制限により、ワークフローファイルだけはテンプレートとして保存しています。コードとREADMEは反映済みです。

短縮URLやリダイレクトURLを入力した場合、ページ内のcanonical URLを採用します。公開記事URLを完全に推測することはできないため、URLだけは記事ページまたはブログ側ワークフローから渡してください。

この仕組みは誤投稿を避けるため、現時点ではSNSへ直接投稿せず、投稿用の文章を生成します。記事本文にない所有・運転・修理経験は生成しません。

## 後から追加できるもの

- ブログ側ワークフローからの repository_dispatch 連携
- X APIによる予約・自動投稿
- Threads API連携
- Instagram用画像キャプションと画像添付
- TikTok用動画説明文と投稿管理
