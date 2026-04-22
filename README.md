# medipen 校正ツール

React + Vite で作成した、メディペン向けの独立型校正ツールです。

## 開発時
```bash
npm install
npm run dev
```

## サーバー設置用ビルド
```bash
npm run build
```

ビルド後は `dist` フォルダが作成されます。`dist` の中身をそのままサーバーの設置先へアップロードしてください。

想定設置先:

```text
https://medi-p.net/tools/kousei/
```

このプロジェクトは `vite.config.js` の `base: "./"` により、サブディレクトリ配下でも相対パスで動作するようにしてあります。

## GitHub Pages で確認する場合
GitHub 上で動作確認したい場合は、`main` ブランチへ push すると GitHub Actions が自動でビルドして Pages に公開します。

GitHub のリポジトリ設定では、`Settings` → `Pages` → `Build and deployment` の `Source` を `GitHub Actions` にしてください。
