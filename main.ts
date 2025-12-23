import { App, Plugin, PluginSettingTab, Setting, Notice, SuggestModal, requestUrl } from 'obsidian';

// プラグインの設定インターフェース
interface MovieNoteSettings {
    apiKey: string;
    outputFolder: string;
    language: string;
}

// デフォルト設定
const DEFAULT_SETTINGS: MovieNoteSettings = {
    apiKey: '',
    outputFolder: 'Movies',
    language: 'ja-JP'
}

// TMDb APIから取得する映画データの型定義
interface TMDbMovie {
    id: number;
    title: string;
    original_title: string;
    release_date: string;
    poster_path: string | null;
    overview: string;
    vote_average: number;
    runtime: number;
    genres: Array<{ id: number; name: string }>;
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

    // ノートの内容を生成
    generateNoteContent(movie: TMDbMovie): string {
        const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '';

        const director = movie.credits.crew.find(person => person.job === 'Director')?.name || '不明';
        const cast = movie.credits.cast
            .slice(0, 5)
            .map(person => person.name)
            .join(', ');

        const genres = movie.genres.map(g => g.name).join(', ');
        const runtime = movie.runtime ? `${movie.runtime}分` : '不明';

        return `---
title: ${movie.title}
original_title: ${movie.original_title}
release_date: ${movie.release_date}
director: ${director}
runtime: ${runtime}
genres: ${genres}
rating: ${movie.vote_average}
tmdb_id: ${movie.id}
---

# ${movie.title}

![ポスター](${posterUrl})

## 基本情報

- **原題**: ${movie.original_title}
- **公開日**: ${movie.release_date}
- **監督**: ${director}
- **上映時間**: ${runtime}
- **ジャンル**: ${genres}
- **評価**: ⭐ ${movie.vote_average}/10

## キャスト

${cast}

## あらすじ

${movie.overview || 'あらすじ情報がありません。'}

## メモ

<!-- ここに感想やメモを書いてください -->

---
*このノートは [TMDb](https://www.themoviedb.org/movie/${movie.id}) から自動生成されました。*
`;
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
    }
}
