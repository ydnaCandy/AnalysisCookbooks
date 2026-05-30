# レシピMarkdownエクスポート 設計ドキュメント

作成日: 2026-05-30

## 概要

レシピ詳細モーダルにMarkdownダウンロードボタンを追加する。
AIエージェントとの分析作業でレシピ内容をそのまま貼り付けて使えることが目的。

## 実装方針

フロントエンド完結。バックエンドへの変更なし。
レシピカードはすでに `Recipe` 型のデータを保持しているため、追加APIコールは不要。

## 出力フォーマット

ファイル名: `{タイトル（スペース→アンダースコア）}.md`

```markdown
# {タイトル}

## 説明
{description。未設定の場合は "なし"}

## ドメイン
{domain.name。未設定の場合は "未設定"}

## タグ
{tag1}, {tag2}, ...（タグなしの場合は "なし"）

## 作成者
{created_by_user.username} / {created_at（JST, YYYY-MM-DD HH:mm形式）}

## SQL
\`\`\`sql
{sql_text}
\`\`\`
```

## 実装内容

### 追加ファイル

- `frontend/src/utils/exportMarkdown.ts`
  - `exportRecipeAsMarkdown(recipe: Recipe): void`
  - Markdownテキスト生成
  - `<a>` タグ + `Blob` 経由でダウンロードトリガー

### 変更ファイル

- `frontend/src/components/modals/RecipeModal.tsx`
  - 左カラムのボタン群（保存・削除・ER図）にMarkdownダウンロードボタンを追加
  - 新規作成モード時はボタンを非表示（保存前はidが存在しないため）

## UIデザイン

ボタンラベル: `MD出力`
配置: レシピ詳細モーダルの左カラム、既存ボタン群（保存・削除・ER図）と同列
表示条件: 編集モード（既存レシピ）のみ表示。新規作成モードでは非表示。
