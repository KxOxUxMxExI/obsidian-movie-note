# Obsidian Movie Note Plugin

TMDb APIを使用して映画のメタデータを取得し、Obsidian内に自動的にノートを作成するプラグインです。

## 機能

- 🎬 映画タイトルで検索
- 📝 TMDbから詳細情報を自動取得
- 🖼️ ポスター画像の自動ダウンロード
- 👥 監督・キャスト情報の取得
- 📅 公開日・上映時間・ジャンルなどのメタデータ取得

## 必要なもの

- [TMDb API Key](https://www.themoviedb.org/settings/api) （無料で取得可能）

## インストール方法

（開発中）

## 使い方

1. コマンドパレット（Ctrl/Cmd + P）を開く
2. "Movie Note: Search Movie" を選択
3. 映画タイトルを入力して検索
4. 候補から映画を選択
5. 自動的にノートが作成されます

## 設定

- **TMDb API Key**: TMDbから取得したAPIキーを入力
- **保存先フォルダ**: ノートを保存するフォルダパス（デフォルト: `Movies/`）
- **言語**: メタデータの言語（デフォルト: `ja-JP`）

## 開発

```bash
# 依存関係のインストール
npm install

# 開発モードでビルド
npm run dev

# プロダクションビルド
npm run build
```

## ライセンス

MIT

## クレジット

このプラグインは [The Movie Database (TMDb)](https://www.themoviedb.org/) APIを使用しています。

![TMDb Logo](https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg)
