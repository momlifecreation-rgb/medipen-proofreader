# medi-p.net サーバー設置メモ

## 1. ビルド
```bash
npm install
npm run build
```

## 2. アップロードするもの
`dist` フォルダの中身をすべてアップロードします。

例:

- `dist/index.html`
- `dist/assets/...`
- `dist/medipen-logo.png`
- `dist/medipenロゴ.png`

## 3. 設置先
サーバー上で次のディレクトリに配置します。

```text
/tools/kousei/
```

公開URL:

```text
https://medi-p.net/tools/kousei/
```

## 4. WordPress 側
WordPress の固定ページにはツール本体を置かず、上記URLへのリンクを配置して利用します。
