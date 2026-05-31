import type { Recipe } from '../types'

export function generateExportFilename(recipe: Recipe): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const safeName = recipe.title.replace(/\s+/g, '_').replace(/[/\\:*?"<>|]/g, '') || 'untitled'
  return `${yyyy}${mm}${dd}_${safeName}.md`
}

export function generateMarkdownContent(recipe: Recipe): string {
  const tags = recipe.tags.length > 0 ? recipe.tags.map((t) => t.name).join(', ') : 'なし'
  const domain = recipe.domain?.name ?? '未設定'
  const description = recipe.description?.trim() || 'なし'
  const createdBy = recipe.created_by_user?.username ?? '不明'

  const createdAt = new Date(recipe.created_at)
  const jst = new Date(createdAt.getTime() + 9 * 60 * 60 * 1000)
  const dateStr = jst.toISOString().slice(0, 16).replace('T', ' ')

  return `# ${recipe.title}

## 説明
${description}

## ドメイン
${domain}

## タグ
${tags}

## 作成者
${createdBy} / ${dateStr}

## SQL
\`\`\`sql
${recipe.sql_text}
\`\`\`
`
}

export function exportRecipeAsMarkdown(recipe: Recipe): void {
  const content = generateMarkdownContent(recipe)
  const filename = generateExportFilename(recipe)
  const blob = new Blob([content], { type: 'text/markdown; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
