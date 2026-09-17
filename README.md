# 空冷かずひろ SNS宣伝ドラフト

XとThreads向けの宣伝文を、GitHub Actionsで生成するリポジトリです。

## 対応媒体

- **X**：短いタイトル・要約・リンク・ハッシュタグを生成
- **Threads**：Xより長い紹介文を生成

InstagramとTikTokは、画像・動画素材、各サービスのAPI設定、投稿確認の設計が必要になるため、第二段階で追加します。

## 使い方

1. GitHubの **Actions** を開く
2. **Generate X and Threads promotion drafts** を選ぶ
3. **Run workflow** を押す
4. 記事タイトル、要約、URL、ハッシュタグを入力する
5. 実行後にArtifactまたは`out/social-drafts.md`を確認する

この仕組みは誤投稿を避けるため、現時点ではSNSへ直接投稿せず、投稿用の文章を生成します。

## 後から追加できるもの

- ブログ側ワークフローからの`repository_dispatch`連携
- X APIによる予約・自動投稿
- Threads API連携
- Instagram用画像キャプションと画像添付
- TikTok用動画説明文と投稿管理
