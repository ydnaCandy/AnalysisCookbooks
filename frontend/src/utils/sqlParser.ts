import { Parser } from 'node-sql-parser'

export interface ErData {
  tables: string[]
  joins: { from: string; to: string; on: string }[]
}

const parser = new Parser()

function columnRefToStr(ref: unknown): string {
  if (!ref || typeof ref !== 'object') return ''
  const r = ref as { type?: string; table?: string; column?: string }
  if (r.type === 'column_ref') {
    return r.table ? `${r.table}.${r.column}` : String(r.column)
  }
  return ''
}

function conditionToStr(on: unknown): string {
  if (!on || typeof on !== 'object') return ''
  const o = on as { type?: string; operator?: string; left?: unknown; right?: unknown }
  if (o.type === 'binary_expr' && o.operator === '=') {
    const left = columnRefToStr(o.left)
    const right = columnRefToStr(o.right)
    if (left && right) return `${left} = ${right}`
  }
  return ''
}

export function parseSqlForEr(sql: string): ErData | null {
  try {
    const ast = parser.astify(sql, { database: 'MySQL' })
    const stmts = Array.isArray(ast) ? ast : [ast]
    const tables = new Set<string>()
    const joins: ErData['joins'] = []

    for (const stmt of stmts) {
      const s = stmt as { from?: unknown[] } | null
      if (!s || !s.from) continue
      const fromRefs: unknown[] = Array.isArray(s.from) ? s.from : []
      const baseRef = fromRefs.find((r) => {
        const ref = r as { join?: string; table?: string }
        return !ref.join
      }) as { table?: string } | undefined
      const baseTable = baseRef?.table

      for (const ref of fromRefs) {
        const r = ref as { join?: string; on?: unknown; table?: string }
        if (r.table) tables.add(r.table)
        if (r.join && r.on && baseTable) {
          const onStr = conditionToStr(r.on)
          joins.push({ from: baseTable, to: r.table ?? '', on: onStr })
        }
      }
    }

    return { tables: Array.from(tables), joins }
  } catch {
    return null
  }
}

function extractFkColumn(on: string): string {
  // "orders.user_id = users.id" → "user_id"
  const match = on.match(/^[\w]+\.([\w]+)\s*=/)
  return match ? match[1] : on
}

function quoteMermaidNode(name: string): string {
  // 英数字・アンダースコア以外を含む場合はクォート
  return /^[a-zA-Z0-9_]+$/.test(name) ? name : `["${name}"]`
}

export function erDataToMermaid(data: ErData): string {
  const lines: string[] = ['flowchart LR']

  if (data.joins.length === 0) {
    // JOINなし：テーブルをノードとして列挙
    data.tables.forEach((t) => lines.push(`  ${quoteMermaidNode(t)}`))
  } else {
    data.joins.forEach((join) => {
      const label = extractFkColumn(join.on)
      const from = quoteMermaidNode(join.from)
      const to = quoteMermaidNode(join.to)
      lines.push(`  ${from} --> |${label}| ${to}`)
    })
  }

  return lines.join('\n')
}
