// インセプションのキャスト数を確認するテストスクリプト
// Node.jsで実行: node test-cast-count.js

const https = require('https');

// ここにあなたのTMDb APIキーを入力してください
const API_KEY = 'YOUR_API_KEY_HERE';

// インセプションのTMDb ID
const MOVIE_ID = 27205;

const url = `https://api.themoviedb.org/3/movie/${MOVIE_ID}?api_key=${API_KEY}&language=ja-JP&append_to_response=credits`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const movie = JSON.parse(data);
        const castCount = movie.credits.cast.length;

        console.log(`映画: ${movie.title}`);
        console.log(`キャスト総数: ${castCount}人`);
        console.log(`\n主要キャスト（上位10名）:`);

        movie.credits.cast.slice(0, 10).forEach((person, index) => {
            console.log(`${index + 1}. ${person.name} (${person.character})`);
        });

        console.log(`\n全キャストを表示すると${castCount}人分のリストになります。`);
    });
}).on('error', (err) => {
    console.error('エラー:', err.message);
});
