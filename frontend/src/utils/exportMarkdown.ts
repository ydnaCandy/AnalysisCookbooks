import type { Recipe, Comment } from '../types'

export function generateExportFilename(recipe: Recipe): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const safeName = recipe.title.replace(/\s+/g, '_').replace(/[/\\:*?"<>|]/g, '') || 'untitled'
  return `${yyyy}${mm}${dd}_${safeName}.md`
}

export function generateMarkdownContent(recipe: Recipe, comments?: Comment[]): string {
  const tags = recipe.tags.length > 0 ? recipe.tags.map((t) => t.name).join(', ') : 'なし'
  const domain = recipe.domain?.name ?? '未設定'
  const description = recipe.description?.trim() || 'なし'

  let content = `# ${recipe.title}

## 説明
${description}

## ドメイン
${domain}

## タグ
${tags}

## SQL
\`\`\`sql
${recipe.sql_text}
\`\`\`
`

  if (comments && comments.length > 0) {
    const commentLines = comments.map((c) => {
      const createdAt = new Date(c.created_at)
      const jst = new Date(createdAt.getTime() + 9 * 60 * 60 * 1000)
      const dateStr = jst.toISOString().slice(0, 16).replace('T', ' ')
      return `- **${c.user?.username ?? '不明'}** (${dateStr})\n  ${c.content}`
    })
    content += `\n## コメント\n${commentLines.join('\n')}\n`
  }

  return content
}

export function exportRecipeAsMarkdown(recipe: Recipe, comments?: Comment[]): void {
  const content = generateMarkdownContent(recipe, comments)
  const filename = generateExportFilename(recipe)
  const blob = new Blob([content], { type: 'text/markdown; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
