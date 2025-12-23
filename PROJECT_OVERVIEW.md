# プロジェクト概要: Obsidian Movie Metadata Plugin (TMDb版)

## 1. 目的
FilmarksやTMDbなどの外部データベースから映画のメタデータ（ポスター、主演、監督、公開年等）を取得し、Obsidian内の指定された場所にテンプレートに従ってノートを自動生成するプラグイン。

## 2. ワークフロー（設計）
1.  **起動**: リボンアイコンまたはコマンドパレットからプラグインを実行。
2.  **検索**: モーダルウィンドウが表示され、映画タイトルを入力。
3.  **選択**: TMDb APIから取得した候補リストを表示。ユーザーが対象の映画を選択。
4.  **生成**: 取得したデータを基に、設定されたテンプレートに従って新しいノート（.md）を作成。

## 3. 使用するデータソースobsi
- **API**: The Movie Database (TMDb) API v3
- **言語**: 日本語 (`ja-JP`)
- **取得項目**:
    - タイトル、原題、公開日、上映時間、ジャンル、あらすじ、評価
    - ポスター画像URL（`https://image.tmdb.org/t/p/w500/` + path）
    - 監督（Crewから "Director" を抽出）
    - 主演（Castの先頭数名）

## 4. 設定項目 (Settings Tab)
- TMDb APIキー (apiKey)
- 保存先フォルダパス (outputFolder)
- 言語設定 (language: デフォルト ja-JP)

## 5. 技術スタック
- TypeScript / Obsidian API
- `requestUrl` (CORS回避用)
- `SuggestModal` (検索・選択UI)

## 6. データ取得テストコード

以下のコードは、TMDb APIから映画データを取得してコンソールに出力するテスト用の関数です。
プラグインの `onload` 内や、適当なコマンドの実行部分に入れて試してください。

```typescript
async testFetchMovie(movieTitle: string) {
    const { apiKey, language } = this.plugin.settings;
    
    if (!apiKey) {
        console.error("APIキーが設定されていません。");
        return;
    }

    try {
        // 1. 映画タイトルのキーワードで検索し、IDを取得
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movieTitle)}&language=${language}`;
        const searchRes = await requestUrl(searchUrl);
        
        if (searchRes.json.results.length === 0) {
            console.log("映画が見つかりませんでした。");
            return;
        }

        const firstResult = searchRes.json.results[0];
        const movieId = firstResult.id;

        // 2. 映画のIDを使って詳細情報（クレジット込み）を取得
        // append_to_response=credits をつけることで、一度に監督やキャストも取得可能
        const detailUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=${language}&append_to_response=credits`;
        const detailRes = await requestUrl(detailUrl);
        const data = detailRes.json;

        // 3. コンソールに取得結果を表示（中身を確認！）
        console.log("--- TMDb Raw Data ---", data);

        // データの抽出例
        const director = data.credits.crew.find((person: any) => person.job === "Director")?.name;
        const castNames = data.credits.cast.slice(0, 3).map((person: any) => person.name).join(", ");
        const posterUrl = `https://image.tmdb.org/t/p/w500${data.poster_path}`;

        console.log("抽出結果:");
        console.log(`タイトル: ${data.title}`);
        console.log(`監督: ${director}`);
        console.log(`主な出演者: ${castNames}`);
        console.log(`公開日: ${data.release_date}`);
        console.log(`ポスターURL: ${posterUrl}`);

    } catch (error) {
        console.error("API取得エラー:", error);
    }
}
```

## 7. 実行方法の目安
1. Obsidianで `Ctrl + Shift + I` を押してデベロッパーツール（コンソール）を開きます。
2. 上記の関数を実行すると、`--- TMDb Raw Data ---` の横にある矢印を展開することで、取得できるすべての項目（JSON）をブラウザ上で詳しく調査できます。

## 8. 次のステップ
この概要とテストコードをベースに、`SuggestModal` を実装してユーザーが映画を検索・選択できるUIを構築します。
