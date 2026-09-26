# 空冷かずひろ SNS宣伝ドラフト

WordPressの最新公開記事から、X・Threads向けの宣伝文とTikTok用の動画下書きを生成します。

## 自動化の流れ

1. WordPress REST APIから最新公開記事のURLを取得
2. 記事ページからタイトル・概要を抽出
3. canonical URLと記事内容に合うハッシュタグを取得
4. X向け短文、Threads向け紹介文、TikTok用25秒台本・テロップ・キャプション・ハッシュタグを生成
5. GitHub Actions Artifactにドラフトを保存

対象WordPressサイトは https://kazuhiro-beetle.com です。特定の記事を使う場合は、PROMO_SOURCE_URLを指定してローカルで実行できます。

## TikTok下書きの取得

現在は既存のGitHub Actions「Generate X and Threads promotion drafts」を実行すると、TikTok用ファイルもArtifactに含まれます。

1. GitHubのActionsから「Generate X and Threads promotion drafts」を実行します。
2. 完了した実行のArtifactをダウンロードします。
3. tiktok-draft.mdを確認し、内容・映像素材・プロフィールのブログリンクを整えてから手動で投稿します。

Artifact内のTikTokファイルはtiktok-draft.mdとtiktok-draft.jsonです。Artifactは30日間保存されます。

## 公開範囲と注意点

- TikTokへは自動投稿しません。動画・文章を確認してから手動で投稿してください。
- 既存ActionはTikTok下書きに加えてX・Threads用ドラフトも生成し、その2ファイルをリポジトリにコミットします。TikTokの下書きファイル自体はArtifactだけに保存されます。
- 記事本文にない所有・運転・修理経験は生成しません。

## 後から追加できるもの

- Hatena、Livedoor、Steemit、noteの公開URL連携
- ブログ側ワークフローからのrepository_dispatch連携
- X APIによる予約・自動投稿
- Threads API連携
- Instagram用画像キャプションと画像添付
- TikTok API連携による予約・直接投稿（現在は下書き生成のみ）
