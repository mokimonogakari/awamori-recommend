# 泡盛レコメンド

あなたにぴったりの泡盛と料理の組み合わせを見つけるReactアプリケーション

## 概要

泡盛レコメンドは、ユーザーの好みや料理に合わせて最適な泡盛を提案するシングルページアプリケーション（SPA）です。味わいの好みや普段飲むお酒、合わせたい料理から、15種類の泡盛データベースの中から最適な銘柄を推薦します。

## 主な機能

### 1. 味わいで探す
4象限の味わいマップから好みを選択：
- **軽やか×キレ** - スッキリ爽快系（瑞泉、海人など）
- **軽やか×甘口** - フルーティー系（残波白、久米島の久米仙など）
- **濃厚×キレ** - 力強い伝統派（残波黒、松藤など）
- **濃厚×甘口** - 熟成・古酒系（暖流、菊之露VIPゴールドなど）

普段飲むお酒（任意）を選択することで、より精度の高いレコメンデーションを提供：
- ビール、日本酒、焼酎、ワイン、ウイスキー、カクテル、ハイボール、酎ハイ

### 2. 料理で探す
12種類の料理カテゴリーから選択：
- 煮込み料理、揚げ物、炒め物、鍋料理
- 海鮮・刺身、ステーキ・肉料理
- イタリアン、スパイシー料理
- チーズ・前菜、デザート
- 沖縄料理、居酒屋おつまみ

### 3. 詳細な泡盛情報
各泡盛の推薦結果には以下の情報を表示：
- 銘柄名と酒造所
- アルコール度数
- タイプ（一般酒、古酒、樽貯蔵など）
- 風味プロファイル
- おすすめの料理とペアリングのポイント
- おすすめの飲み方（ロック、水割り、炭酸割りなど）

## 技術仕様

### フロントエンド
- **フレームワーク**: React 19 + Vite 7
- **言語**: JavaScript (JSX)
- **デザイン**: レスポンシブデザイン（モバイルファースト）
- **UI/UX**: タブナビゲーション、インタラクティブなSVG味わいマップ
- **スタイル**: CSS変数を使用したカスタムデザインシステム
- **状態管理**: React Hooks (useState, useEffect)
- **ビルドツール**: Vite (高速開発サーバー、最適化されたビルド)

### データ管理
- **形式**: 外部JSONファイル（`public/awamori-data.json`）で15種類の泡盛データを管理
- **ファイル構成**:
  - `src/App.jsx`: メインアプリケーションコンポーネント
  - `src/App.css`: アプリケーションスタイル
  - `public/awamori-data.json`: 泡盛データ、料理カテゴリー、お酒マッピング
- **データ構造**:
  ```javascript
  {
    id: Number,
    name: String,
    brewery: String,
    degree: Number,
    type: String,
    taste: { richness: Number, sweetness: Number },
    quadrant: String,
    flavorProfile: String,
    pairings: Array<String>,
    pairingDescription: String,
    recommendedDrink: String,
    similarDrinks: Array<String>
  }
  ```

### レコメンデーションアルゴリズム

#### 味わいベースの検索
1. 選択された象限に一致する泡盛を抽出
2. 選択されたお酒の種類との類似度でスコアリング
3. スコアの高い順にソート
4. 該当がない場合は全泡盛から類似度の高いものを3つ推薦

#### 料理ベースの検索
1. 選択された料理カテゴリーとのマッチング数をカウント
2. マッチング数でスコアリング
3. スコアの高い順にソート
4. 該当がない場合はデフォルトで上位3つを表示

## デプロイ

### GitHub Pages
このアプリケーションはGitHub Pagesにデプロイされています。

### デプロイ手順
```bash
# ビルド＆デプロイ
npm run deploy
```

## 収録泡盛一覧

1. **残波（白）** - 比嘉酒造 / 25度 / 一般酒
2. **残波（黒）** - 比嘉酒造 / 30度 / 一般酒
3. **菊之露ブラウン** - 菊之露酒造 / 30度 / 一般酒
4. **瑞泉** - 瑞泉酒造 / 30度 / 一般酒
5. **久米島の久米仙** - 久米島の久米仙 / 30度 / 一般酒
6. **暖流** - 神村酒造 / 30度 / 樽貯蔵
7. **菊之露VIPゴールド** - 菊之露酒造 / 30度 / 古酒
8. **松藤（荒濾過）** - 崎山酒造廠 / 30度 / 一般酒
9. **海人** - まさひろ酒造 / 30度 / 一般酒
10. **琉球王朝** - 多良川 / 30度 / 古酒
11. **芳醇浪漫 守禮** - 神谷酒造所 / 35度 / 一般酒
12. **伊是名島 5年古酒** - 伊是名酒造所 / 30度 / 古酒
13. **まさひろオキナワジン** - まさひろ酒造 / 47度 / ジン（泡盛ベース）
14. **くら** - ヘリオス酒造 / 25度 / 樽貯蔵
15. **OKINAWA ISLAND BLUE** - 久米仙酒造 / 43度 / 古酒

## カラースキーム

```css
--primary: #1a3a5c (深い青)
--accent: #c5963a (ゴールド)
--accent-light: #f5e6c8 (明るいベージュ)
--bg: #faf8f5 (背景色)
--card-bg: #ffffff (カード背景)
--text: #2c2c2c (テキスト色)
--text-light: #6b6b6b (薄いテキスト色)
--border: #e0ddd8 (ボーダー色)
```

## ブラウザ対応

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）
- モバイルブラウザ（iOS Safari、Chrome Mobile）

## 開発情報

- **プロジェクト**: ハッカソン 2026 プロトタイプ
- **ライセンス**: 未指定
- **主な依存関係**:
  - React 19.2.0
  - Vite 7.3.1
  - gh-pages (デプロイ用)

## データの管理

### データファイルの編集
泡盛データは `public/awamori-data.json` で管理されています。新しい泡盛を追加する場合：

1. `public/awamori-data.json` を開く
2. `awamoriData` 配列に新しいオブジェクトを追加
3. 必須フィールド: `id`, `name`, `brewery`, `degree`, `type`, `taste`, `quadrant`, `flavorProfile`, `pairings`, `pairingDescription`, `recommendedDrink`, `similarDrinks`
4. ファイルを保存して開発サーバーで動作確認（`npm run dev`）

### データ構造の例
```json
{
  "id": 16,
  "name": "新しい泡盛",
  "brewery": "酒造所名",
  "degree": 30,
  "type": "一般酒",
  "taste": {
    "richness": 3,
    "sweetness": 3
  },
  "quadrant": "rich-sweet",
  "flavorProfile": "味わいの説明",
  "pairings": ["nikomi", "okinawa"],
  "pairingDescription": "料理との相性の説明",
  "recommendedDrink": "おすすめの飲み方",
  "similarDrinks": ["sake", "shochu"]
}
```

## ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/mokimonogakari/awamori-recommend.git

# ディレクトリに移動
cd awamori-recommend

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ブラウザでアクセス（通常 http://localhost:5173）
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

### デプロイ（GitHub Pages）

```bash
# 自動ビルド＆デプロイ
npm run deploy
```

## 今後の拡張可能性

- 泡盛データベースの拡充
- ユーザーレビュー機能
- お気に入り機能（LocalStorage活用）
- 購入リンクの追加
- 多言語対応（英語、中国語など）
- ソーシャルシェア機能
- 詳細な絞り込みフィルター（価格帯、酒造所など）
- バックエンドAPI連携

## お問い合わせ

このプロジェクトについてのフィードバックや提案は、GitHubのIssuesにてお願いします。
