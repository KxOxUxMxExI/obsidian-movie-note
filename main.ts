import { App, Plugin, PluginSettingTab, Setting, Notice, SuggestModal, requestUrl } from 'obsidian';

// プラグインの設定インターフェース
interface MovieNoteSettings {
    apiKey: string;
    outputFolder: string;
    language: string;
    noteTemplate: string;
}

// デフォルト設定
const DEFAULT_TEMPLATE = `---
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
`;

const DEFAULT_SETTINGS: MovieNoteSettings = {
    apiKey: '',
    outputFolder: 'Movies',
    language: 'ja-JP',
    noteTemplate: DEFAULT_TEMPLATE
}

// TMDb APIから取得する映画データの型定義
interface TMDbMovie {
    id: number;
    title: string;
    original_title: string;
    release_date: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    tagline: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    runtime: number;
    budget: number;
    revenue: number;
    status: string;
    adult: boolean;
    video: boolean;
    original_language: string;
    homepage: string;
    imdb_id: string;
    genres: Array<{ id: number; name: string }>;
    production_companies: Array<{ id: number; name: string }>;
    production_countries: Array<{ iso_3166_1: string; name: string }>;
    spoken_languages: Array<{ iso_639_1: string; name: string }>;
    belongs_to_collection: { id: number; name: string } | null;
    credits: {
        cast: Array<{ name: string; character: string; order: number }>;
        crew: Array<{ name: string; job: string }>;
    };
}

// 検索結果の型定義
interface TMDbSearchResult {
    id: number;
    title: string;
    original_title: string;
    release_date: string;
    overview: string;
}

export default class MovieNotePlugin extends Plugin {
    settings: MovieNoteSettings;

    async onload() {
        await this.loadSettings();

        // リボンアイコンを追加
        this.addRibbonIcon('film', 'Movie Note', () => {
            this.openMovieSearch();
        });

        // コマンドパレットにコマンドを追加
        this.addCommand({
            id: 'search-movie',
            name: 'Search Movie',
            callback: () => {
                this.openMovieSearch();
            }
        });

        // 設定タブを追加
        this.addSettingTab(new MovieNoteSettingTab(this.app, this));
    }

    onunload() {
        // クリーンアップ処理
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // 映画検索モーダルを開く
    openMovieSearch() {
        if (!this.settings.apiKey) {
            new Notice('TMDb APIキーが設定されていません。設定から入力してください。');
            return;
        }
        new MovieSearchModal(this.app, this).open();
    }

    // TMDb APIで映画を検索
    async searchMovies(query: string): Promise<TMDbSearchResult[]> {
        const { apiKey, language } = this.settings;
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=${language}`;

        try {
            const response = await requestUrl(searchUrl);
            return response.json.results || [];
        } catch (error) {
            console.error('映画検索エラー:', error);
            new Notice('映画の検索に失敗しました。');
            return [];
        }
    }

    // 映画の詳細情報を取得
    async getMovieDetails(movieId: number): Promise<TMDbMovie | null> {
        const { apiKey, language } = this.settings;
        const detailUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=${language}&append_to_response=credits`;

        try {
            const response = await requestUrl(detailUrl);
            return response.json;
        } catch (error) {
            console.error('映画詳細取得エラー:', error);
            new Notice('映画の詳細情報の取得に失敗しました。');
            return null;
        }
    }

    // 映画ノートを作成
    async createMovieNote(movie: TMDbMovie) {
        const { outputFolder } = this.settings;

        // ファイル名を生成（タイトル + 公開年）
        const year = movie.release_date ? movie.release_date.split('-')[0] : 'Unknown';
        const fileName = `${movie.title} (${year}).md`;
        const filePath = `${outputFolder}/${fileName}`;

        // フォルダが存在しない場合は作成
        const folder = this.app.vault.getAbstractFileByPath(outputFolder);
        if (!folder) {
            await this.app.vault.createFolder(outputFolder);
        }

        // ノートの内容を生成
        const content = this.generateNoteContent(movie);

        // ファイルが既に存在するかチェック
        const existingFile = this.app.vault.getAbstractFileByPath(filePath);
        if (existingFile) {
            new Notice(`ノート「${fileName}」は既に存在します。`);
            return;
        }

        // ノートを作成
        try {
            await this.app.vault.create(filePath, content);
            new Notice(`ノート「${fileName}」を作成しました！`);

            // 作成したノートを開く
            const file = this.app.vault.getAbstractFileByPath(filePath);
            if (file) {
                await this.app.workspace.getLeaf().openFile(file as any);
            }
        } catch (error) {
            console.error('ノート作成エラー:', error);
            new Notice('ノートの作成に失敗しました。');
        }
    }

    // ノートの内容を生成（テンプレート変数を置換）
    generateNoteContent(movie: TMDbMovie): string {
        const template = this.settings.noteTemplate;

        // テンプレート変数のマップを作成
        const variables = this.createTemplateVariables(movie);

        // テンプレート内の変数を置換
        let content = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, value);
        }

        return content;
    }

    // テンプレート変数を作成
    createTemplateVariables(movie: TMDbMovie): Record<string, string> {
        // 基本情報
        const year = movie.release_date ? movie.release_date.split('-')[0] : '';
        const runtime = movie.runtime || 0;
        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;
        const runtimeFormatted = runtime ? `${hours}時間${minutes}分` : '不明';

        // スタッフ情報
        const directors = movie.credits.crew.filter(p => p.job === 'Director').map(p => p.name);
        const writers = movie.credits.crew.filter(p => p.job === 'Screenplay' || p.job === 'Writer').map(p => p.name);
        const producers = movie.credits.crew.filter(p => p.job === 'Producer').map(p => p.name);

        // キャスト情報
        const castTop5 = movie.credits.cast.slice(0, 5).map(p => p.name).join(', ');
        const castTop10 = movie.credits.cast.slice(0, 10).map(p => p.name).join(', ');
        const castList = movie.credits.cast.slice(0, 10)
            .map(p => `- ${p.name} (${p.character})`)
            .join('\n');

        // ジャンル
        const genres = movie.genres.map(g => g.name).join(', ');
        const genresList = movie.genres.map(g => `- ${g.name}`).join('\n');
        const genreIds = movie.genres.map(g => g.id).join(', ');

        // 制作情報
        const productionCompanies = movie.production_companies.map(c => c.name).join(', ');
        const productionCountries = movie.production_countries.map(c => c.name).join(', ');
        const spokenLanguages = movie.spoken_languages.map(l => l.name).join(', ');

        // 金額フォーマット
        const budgetFormatted = movie.budget ? `$${movie.budget.toLocaleString()}` : '不明';
        const revenueFormatted = movie.revenue ? `$${movie.revenue.toLocaleString()}` : '不明';

        // 画像URL
        const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
        const posterUrlOriginal = movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : '';
        const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : '';
        const backdropUrlOriginal = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';

        // リンク
        const tmdbUrl = `https://www.themoviedb.org/movie/${movie.id}`;
        const imdbUrl = movie.imdb_id ? `https://www.imdb.com/title/${movie.imdb_id}` : '';

        // コレクション
        const collectionName = movie.belongs_to_collection?.name || '';
        const collectionId = movie.belongs_to_collection?.id.toString() || '';

        return {
            // 基本情報
            'title': movie.title || '',
            'original_title': movie.original_title || '',
            'tagline': movie.tagline || '',
            'overview': movie.overview || 'あらすじ情報がありません。',
            'release_date': movie.release_date || '',
            'year': year,
            'status': movie.status || '',
            'runtime': runtime.toString(),
            'runtime_formatted': runtimeFormatted,

            // 評価・人気度
            'vote_average': movie.vote_average?.toString() || '0',
            'vote_count': movie.vote_count?.toString() || '0',
            'popularity': movie.popularity?.toString() || '0',

            // ジャンル
            'genres': genres,
            'genres_list': genresList,
            'genre_ids': genreIds,

            // 制作情報
            'budget': movie.budget?.toString() || '0',
            'budget_formatted': budgetFormatted,
            'revenue': movie.revenue?.toString() || '0',
            'revenue_formatted': revenueFormatted,
            'production_companies': productionCompanies,
            'production_countries': productionCountries,
            'spoken_languages': spokenLanguages,

            // スタッフ
            'director': directors[0] || '不明',
            'directors': directors.join(', '),
            'writer': writers[0] || '',
            'writers': writers.join(', '),
            'producer': producers[0] || '',
            'producers': producers.join(', '),

            // キャスト
            'cast_top5': castTop5,
            'cast_top10': castTop10,
            'cast_list': castList,

            // 画像
            'poster_url': posterUrl,
            'poster_url_original': posterUrlOriginal,
            'backdrop_url': backdropUrl,
            'backdrop_url_original': backdropUrlOriginal,

            // リンク・ID
            'tmdb_id': movie.id.toString(),
            'imdb_id': movie.imdb_id || '',
            'tmdb_url': tmdbUrl,
            'imdb_url': imdbUrl,
            'homepage': movie.homepage || '',

            // コレクション
            'collection_name': collectionName,
            'collection_id': collectionId,

            // その他
            'adult': movie.adult ? 'true' : 'false',
            'video': movie.video ? 'true' : 'false',
            'original_language': movie.original_language || ''
        };
    }
}

// 映画検索用のSuggestModal
class MovieSearchModal extends SuggestModal<TMDbSearchResult> {
    plugin: MovieNotePlugin;

    constructor(app: App, plugin: MovieNotePlugin) {
        super(app);
        this.plugin = plugin;
        this.setPlaceholder('映画タイトルを入力してください...');
    }

    // 入力に基づいて候補を取得
    async getSuggestions(query: string): Promise<TMDbSearchResult[]> {
        if (query.length < 2) {
            return [];
        }
        return await this.plugin.searchMovies(query);
    }

    // 候補の表示内容をカスタマイズ
    renderSuggestion(movie: TMDbSearchResult, el: HTMLElement) {
        el.createEl('div', { text: movie.title, cls: 'movie-title' });

        const details = el.createEl('div', { cls: 'movie-details' });
        if (movie.original_title !== movie.title) {
            details.createEl('span', { text: movie.original_title, cls: 'movie-original-title' });
        }
        if (movie.release_date) {
            const year = movie.release_date.split('-')[0];
            details.createEl('span', { text: ` (${year})`, cls: 'movie-year' });
        }

        if (movie.overview) {
            el.createEl('div', {
                text: movie.overview.substring(0, 100) + '...',
                cls: 'movie-overview'
            });
        }
    }

    // 選択時の処理
    async onChooseSuggestion(movie: TMDbSearchResult, evt: MouseEvent | KeyboardEvent) {
        new Notice(`「${movie.title}」の情報を取得中...`);

        const movieDetails = await this.plugin.getMovieDetails(movie.id);
        if (movieDetails) {
            await this.plugin.createMovieNote(movieDetails);
        }
    }
}

// 設定タブ
class MovieNoteSettingTab extends PluginSettingTab {
    plugin: MovieNotePlugin;

    constructor(app: App, plugin: MovieNotePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Movie Note Plugin 設定' });

        // APIキー設定
        new Setting(containerEl)
            .setName('TMDb APIキー')
            .setDesc('TMDbから取得したAPIキーを入力してください。')
            .addText(text => text
                .setPlaceholder('APIキーを入力')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        // APIキー取得リンク
        containerEl.createEl('a', {
            text: 'TMDb APIキーを取得する',
            href: 'https://www.themoviedb.org/settings/api'
        });

        // 保存先フォルダ設定
        new Setting(containerEl)
            .setName('保存先フォルダ')
            .setDesc('映画ノートを保存するフォルダパスを指定してください。')
            .addText(text => text
                .setPlaceholder('Movies')
                .setValue(this.plugin.settings.outputFolder)
                .onChange(async (value) => {
                    this.plugin.settings.outputFolder = value;
                    await this.plugin.saveSettings();
                }));

        // 言語設定
        new Setting(containerEl)
            .setName('言語')
            .setDesc('メタデータの言語を設定してください。')
            .addDropdown(dropdown => dropdown
                .addOption('ja-JP', '日本語')
                .addOption('en-US', 'English')
                .addOption('ko-KR', '한국어')
                .addOption('zh-CN', '中文（简体）')
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings();
                }));

        // テンプレート設定セクション
        containerEl.createEl('h3', { text: 'ノートテンプレート' });

        containerEl.createEl('p', {
            text: '利用可能な変数の一覧は ',
            cls: 'setting-item-description'
        }).createEl('a', {
            text: 'TMDB_DATA_REFERENCE.md',
            href: 'https://github.com/KxOxUxMxExI/obsidian-movie-note/blob/main/TMDB_DATA_REFERENCE.md'
        });

        // テンプレートエディタ
        new Setting(containerEl)
            .setName('カスタムテンプレート')
            .setDesc('{{変数名}} の形式で変数を使用できます。')
            .addTextArea(text => {
                text
                    .setPlaceholder('テンプレートを入力...')
                    .setValue(this.plugin.settings.noteTemplate)
                    .onChange(async (value) => {
                        this.plugin.settings.noteTemplate = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 20;
                text.inputEl.cols = 60;
                text.inputEl.style.fontFamily = 'monospace';
                text.inputEl.style.fontSize = '12px';
            });

        // デフォルトに戻すボタン
        new Setting(containerEl)
            .setName('テンプレートをリセット')
            .setDesc('テンプレートをデフォルトに戻します。')
            .addButton(button => button
                .setButtonText('デフォルトに戻す')
                .onClick(async () => {
                    this.plugin.settings.noteTemplate = DEFAULT_TEMPLATE;
                    await this.plugin.saveSettings();
                    this.display(); // 設定画面を再描画
                    new Notice('テンプレートをデフォルトに戻しました。');
                }));
    }
}
