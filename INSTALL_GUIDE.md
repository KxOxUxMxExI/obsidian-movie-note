# インストール・使い方ガイド

## インストール方法

### 手動インストール

1. このリポジトリから以下のファイルをダウンロード：
   - `main.js`
   - `manifest.json`
   - `styles.css`

2. Obsidianのvaultフォルダ内の `.obsidian/plugins/` ディレクトリに移動

3. `obsidian-movie-note` という名前のフォルダを作成

4. ダウンロードした3つのファイルを `obsidian-movie-note` フォルダに配置

5. Obsidianを再起動

6. 設定 → コミュニティプラグイン → インストール済みプラグイン で「Movie Note」を有効化

## 初期設定

### 1. TMDb APIキーの取得

1. [TMDb](https://www.themoviedb.org/) にアクセスしてアカウントを作成
2. [API設定ページ](https://www.themoviedb.org/settings/api) にアクセス
3. 「Request an API Key」をクリック
4. 用途を選択（Developer を選択）
5. 必要事項を入力：
   - **Application URL**: `https://github.com/KxOxUxMxExI/obsidian-movie-note`
   - **Application Summary**: `Personal Obsidian plugin to fetch movie metadata`
6. APIキーが発行されます

### 2. プラグイン設定

1. Obsidianの設定を開く
2. 「Movie Note」プラグインの設定を開く
3. 以下を設定：
   - **TMDb APIキー**: 取得したAPIキーを入力
   - **保存先フォルダ**: ノートを保存するフォルダ（デフォルト: `Movies`）
   - **言語**: メタデータの言語（デフォルト: 日本語）

## 使い方

### 方法1: リボンアイコンから

1. 左サイドバーの🎬アイコンをクリック
2. 映画タイトルを入力
3. 検索結果から映画を選択
4. 自動的にノートが作成されます

### 方法2: コマンドパレットから

1. `Ctrl/Cmd + P` でコマンドパレットを開く
2. 「Movie Note: Search Movie」を選択
3. 映画タイトルを入力
4. 検索結果から映画を選択
5. 自動的にノートが作成されます

## 作成されるノートの内容

ノートには以下の情報が含まれます：

- **ポスター画像**
- **基本情報**
  - タイトル（日本語・原題）
  - 公開日
  - 監督
  - 上映時間
  - ジャンル
  - 評価（TMDb スコア）
- **主要キャスト**（上位5名）
- **あらすじ**
- **メモ欄**（自由に感想を書けます）

## ノートのフロントマター

各ノートには以下のフロントマターが自動的に追加されます：

\`\`\`yaml
---
title: 映画タイトル
original_title: 原題
release_date: 公開日
director: 監督名
runtime: 上映時間
genres: ジャンル
rating: 評価
tmdb_id: TMDb ID
---
\`\`\`

これにより、Dataviewプラグインなどで映画ノートを検索・集計できます。

## トラブルシューティング

### 「TMDb APIキーが設定されていません」と表示される

→ 設定画面でAPIキーを入力してください

### 「映画の検索に失敗しました」と表示される

→ APIキーが正しいか確認してください
→ インターネット接続を確認してください

### ノートが作成されない

→ 保存先フォルダのパスが正しいか確認してください
→ 同名のファイルが既に存在していないか確認してください

## 開発者向け

### ビルド方法

\`\`\`bash
# 依存関係のインストール
npm install

# 開発モード（ファイル監視）
npm run dev

# プロダクションビルド
npm run build
\`\`\`

### 開発環境でのテスト

1. プロジェクトをクローン
2. `npm install` で依存関係をインストール
3. `npm run dev` で開発モードを起動
4. Obsidianのvaultの `.obsidian/plugins/obsidian-movie-note/` にシンボリックリンクを作成
5. Obsidianを再起動してプラグインを有効化

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照

## クレジット

このプラグインは [The Movie Database (TMDb)](https://www.themoviedb.org/) APIを使用しています。

![TMDb Logo](https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg)
