# TMDb API データリファレンス

このドキュメントでは、TMDb APIから取得できる全てのデータフィールドと、テンプレートで使用できる変数を説明します。

## 基本情報

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{title}}` | 映画タイトル（設定言語） | `インセプション` |
| `{{original_title}}` | 原題 | `Inception` |
| `{{tagline}}` | キャッチコピー | `Your mind is the scene of the crime` |
| `{{overview}}` | あらすじ | `夢の中に侵入し...` |
| `{{release_date}}` | 公開日 | `2010-07-16` |
| `{{year}}` | 公開年 | `2010` |
| `{{status}}` | ステータス | `Released`, `In Production`, `Post Production` |
| `{{runtime}}` | 上映時間（分） | `148` |
| `{{runtime_formatted}}` | 上映時間（フォーマット済み） | `2時間28分` |

## 評価・人気度

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{vote_average}}` | 平均評価（10点満点） | `8.4` |
| `{{vote_count}}` | 投票数 | `35420` |
| `{{popularity}}` | 人気度スコア | `142.567` |

## ジャンル

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{genres}}` | ジャンル一覧（カンマ区切り） | `アクション, SF, スリラー` |
| `{{genres_list}}` | ジャンル一覧（改行区切り） | `- アクション\n- SF\n- スリラー` |
| `{{genre_ids}}` | ジャンルID一覧 | `28, 878, 53` |

## 制作情報

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{budget}}` | 製作費（ドル） | `160000000` |
| `{{budget_formatted}}` | 製作費（フォーマット済み） | `$160,000,000` |
| `{{revenue}}` | 興行収入（ドル） | `829895144` |
| `{{revenue_formatted}}` | 興行収入（フォーマット済み） | `$829,895,144` |
| `{{production_companies}}` | 制作会社一覧 | `Warner Bros., Legendary Pictures` |
| `{{production_countries}}` | 制作国一覧 | `United States, United Kingdom` |
| `{{spoken_languages}}` | 使用言語一覧 | `English, Japanese, French` |

## キャスト・スタッフ

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{director}}` | 監督名 | `Christopher Nolan` |
| `{{directors}}` | 監督一覧（複数の場合） | `Christopher Nolan, James Cameron` |
| `{{writer}}` | 脚本家 | `Christopher Nolan` |
| `{{writers}}` | 脚本家一覧 | `Christopher Nolan, Jonathan Nolan` |
| `{{producer}}` | プロデューサー | `Emma Thomas` |
| `{{producers}}` | プロデューサー一覧 | `Emma Thomas, Christopher Nolan` |
| `{{cast_top5}}` | 主要キャスト（上位5名） | `Leonardo DiCaprio, Joseph Gordon-Levitt...` |
| `{{cast_top10}}` | 主要キャスト（上位10名） | `Leonardo DiCaprio, Joseph Gordon-Levitt...` |
| `{{cast_list}}` | キャスト一覧（役名付き） | `- Leonardo DiCaprio (Dom Cobb)\n- Joseph Gordon-Levitt (Arthur)` |

## 画像URL

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{poster_url}}` | ポスター画像URL（w500） | `https://image.tmdb.org/t/p/w500/...` |
| `{{poster_url_original}}` | ポスター画像URL（オリジナル） | `https://image.tmdb.org/t/p/original/...` |
| `{{backdrop_url}}` | 背景画像URL（w1280） | `https://image.tmdb.org/t/p/w1280/...` |
| `{{backdrop_url_original}}` | 背景画像URL（オリジナル） | `https://image.tmdb.org/t/p/original/...` |

## リンク・ID

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{tmdb_id}}` | TMDb ID | `27205` |
| `{{imdb_id}}` | IMDb ID | `tt1375666` |
| `{{tmdb_url}}` | TMDb URL | `https://www.themoviedb.org/movie/27205` |
| `{{imdb_url}}` | IMDb URL | `https://www.imdb.com/title/tt1375666` |
| `{{homepage}}` | 公式サイトURL | `https://www.inceptionmovie.com` |

## コレクション情報

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{collection_name}}` | コレクション名 | `The Matrix Collection` |
| `{{collection_id}}` | コレクションID | `2344` |

## その他

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{adult}}` | 成人向けフラグ | `false` |
| `{{video}}` | ビデオフラグ | `false` |
| `{{original_language}}` | 原語 | `en` |

## デフォルトテンプレート例

```markdown
---
title: {{title}}
original_title: {{original_title}}
release_date: {{release_date}}
director: {{director}}
runtime: {{runtime}}
genres: {{genres}}
rating: {{vote_average}}
tmdb_id: {{tmdb_id}}
imdb_id: {{imdb_id}}
---

# {{title}}

![ポスター]({{poster_url}})

## 基本情報

- **原題**: {{original_title}}
- **公開日**: {{release_date}}
- **監督**: {{director}}
- **上映時間**: {{runtime_formatted}}
- **ジャンル**: {{genres}}
- **評価**: ⭐ {{vote_average}}/10 ({{vote_count}}票)

## キャスト

{{cast_list}}

## あらすじ

{{overview}}

## メモ

<!-- ここに感想やメモを書いてください -->

---
*このノートは [TMDb]({{tmdb_url}}) から自動生成されました。*
```

## カスタムテンプレート例

### シンプル版
```markdown
# {{title}} ({{year}})

**監督**: {{director}}
**評価**: {{vote_average}}/10

{{overview}}

## 感想
```

### 詳細版
```markdown
---
title: {{title}}
year: {{year}}
director: {{director}}
rating: {{vote_average}}
status: 未視聴
---

# {{title}}

![]({{poster_url}})

## 📊 基本情報
- 原題: {{original_title}}
- 公開: {{release_date}}
- 時間: {{runtime_formatted}}
- ジャンル: {{genres}}
- 監督: {{director}}
- 脚本: {{writers}}

## 🎬 キャスト
{{cast_list}}

## 📝 あらすじ
{{overview}}

## 💰 興行成績
- 製作費: {{budget_formatted}}
- 興行収入: {{revenue_formatted}}

## ⭐ 評価
TMDb: {{vote_average}}/10 ({{vote_count}}票)

## 🔗 リンク
- [TMDb]({{tmdb_url}})
- [IMDb]({{imdb_url}})
- [公式サイト]({{homepage}})

## 📌 メモ
```

## 条件分岐（将来実装予定）

```markdown
{{#if imdb_id}}
- [IMDb]({{imdb_url}})
{{/if}}

{{#if homepage}}
- [公式サイト]({{homepage}})
{{/if}}

{{#if collection_name}}
## シリーズ
この映画は「{{collection_name}}」の一部です。
{{/if}}
```
