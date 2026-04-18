# テーマ切り替え機能 設計書

## 概要

アプリのカラーパレットとフォントを3種類のテーマから選択して切り替えられる機能を追加する。
テーマ選択はサイドバー最下部のボタンで操作し、選択結果はlocalStorageに保存してリロード後も維持する。

## 変更範囲

- 色とフォントのみ切り替える
- レイアウト・フォントサイズは変更しない

## テーマ一覧

### Retro（現行）

RPGピクセルアートスタイル。

| 変数 | 値 |
|------|-----|
| `--theme-bg-base` | `#D8D8D8` |
| `--theme-bg-surface` | `#ECECEC` |
| `--theme-bg-sunken` | `#C0C0C0` |
| `--theme-border` | `#A0A0A0` |
| `--theme-shadow` | `#525252` |
| `--theme-text` | `#333333` |
| `--theme-text-muted` | `#666666` |
| `--theme-header-bg` | `#333333` |
| `--theme-header-text` | `#f9ca24` |
| `--theme-sidebar-bg` | `#C0C0C0` |
| `--theme-accent` | `#525252` |
| `--theme-accent-text` | `#ffffff` |
| `--theme-tag-bg` | `#A0A0A0` |
| `--theme-tag-text` | `#333333` |
| `--theme-font` | `monospace` |
| `--theme-font-display` | `'Press Start 2P', monospace` |

### Modern

クリーン・ミニマルスタイル。Noto Sans JPベース。

| 変数 | 値 |
|------|-----|
| `--theme-bg-base` | `#F5F5F5` |
| `--theme-bg-surface` | `#FFFFFF` |
| `--theme-bg-sunken` | `#EFEFEF` |
| `--theme-border` | `#E0E0E0` |
| `--theme-shadow` | `#BDBDBD` |
| `--theme-text` | `#1A1A1A` |
| `--theme-text-muted` | `#757575` |
| `--theme-header-bg` | `#1A1A1A` |
| `--theme-header-text` | `#FFFFFF` |
| `--theme-sidebar-bg` | `#EFEFEF` |
| `--theme-accent` | `#2563EB` |
| `--theme-accent-text` | `#FFFFFF` |
| `--theme-tag-bg` | `#DBEAFE` |
| `--theme-tag-text` | `#1D4ED8` |
| `--theme-font` | `'Noto Sans JP', sans-serif` |
| `--theme-font-display` | `'Noto Sans JP', sans-serif` |

### Italian

高級感・イタリアンレストランスタイル。Playfair Display + Noto Sans JP。

| 変数 | 値 |
|------|-----|
| `--theme-bg-base` | `#FAFAF8` |
| `--theme-bg-surface` | `#FFFFFF` |
| `--theme-bg-sunken` | `#F2F0EB` |
| `--theme-border` | `#D4C5B0` |
| `--theme-shadow` | `#B8A898` |
| `--theme-text` | `#3A3A3A` |
| `--theme-text-muted` | `#7A7A7A` |
| `--theme-header-bg` | `#2D6A4F` |
| `--theme-header-text` | `#FFFFFF` |
| `--theme-sidebar-bg` | `#2D6A4F` |
| `--theme-accent` | `#C0392B` |
| `--theme-accent-text` | `#FFFFFF` |
| `--theme-tag-bg` | `#FDECEA` |
| `--theme-tag-text` | `#C0392B` |
| `--theme-font` | `'Noto Sans JP', sans-serif` |
| `--theme-font-display` | `'Playfair Display', serif` |

## アーキテクチャ

### CSS変数

`index.css`の`:root`にデフォルト（Retro）のCSS変数を定義する。
ThemeContextがテーマ切り替え時に`document.documentElement.style.setProperty()`で上書きする。

### ThemeContext

`src/contexts/ThemeContext.tsx`を新規作成。

- `ThemeName`: `'retro' | 'modern' | 'italian'`
- `useTheme()`: 現在のテーマ名と`setTheme(name)`を返すフック
- localStorageキー: `'theme'`
- 初期化時にlocalStorageから読み込み、CSS変数を適用

### コンポーネント変更

全コンポーネントのインラインスタイル内のハードコード色・フォント値を`var(--theme-xxx)`に置き換える。

対象ファイル：
- `src/index.css`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/StatusBar.tsx`
- `src/components/recipes/RecipeCard.tsx`
- `src/components/recipes/RecipeGrid.tsx`
- `src/components/modals/RecipeModal.tsx`
- `src/components/modals/AdminModal.tsx`
- `src/components/modals/ErDiagramModal.tsx`
- `src/components/modals/CommentThread.tsx`
- `src/pages/LoginPage.tsx`

### テーマ切り替えUI

`src/components/layout/Sidebar.tsx`の最下部に追加。

- 3つのボタン（Retro / Modern / Italian）を横並びで表示
- 現在のテーマをハイライト（アクティブ状態）
- ラベルは短縮形で表示（「RPG」「MOD」「ITA」など）

## フォント読み込み

`index.css`の`@import`にNoto Sans JPとPlayfair Displayを追加する。

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Noto+Sans+JP:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap');
```

## 永続化

- 保存先: `localStorage`
- キー: `'theme'`
- 保存タイミング: `setTheme()`呼び出し時
- 読み込みタイミング: `ThemeContext`の初期化時（アプリ起動時）
