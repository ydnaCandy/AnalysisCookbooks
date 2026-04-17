import type { Recipe } from '../../types'

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
}

const DOMAIN_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  営業: { bg: '#f9ca24', border: '#c9a010', text: '#333' },
  製造: { bg: '#2ecc71', border: '#1a8a4a', text: '#fff' },
  経営: { bg: '#0984e3', border: '#055a9a', text: '#fff' },
}

const TAG_COLORS = ['#0984e3', '#2ecc71', '#d63031', '#f9ca24']

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const domainColor = recipe.domain
    ? DOMAIN_COLORS[recipe.domain.name] ?? { bg: '#525252', border: '#333', text: '#fff' }
    : { bg: '#525252', border: '#333', text: '#fff' }

  return (
    <div
      onClick={onClick}
      style={{
        background: '#ECECEC',
        border: '3px solid #333',
        boxShadow: '4px 4px 0 #525252',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.05s, box-shadow 0.05s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px, -2px)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 0 #525252'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translate(0, 0)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0 #525252'
      }}
    >
      {/* カードヘッダー */}
      <div
        style={{
          background: '#333',
          padding: '5px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 18,
            color: '#fff',
            letterSpacing: 1,
          }}
        >
          {recipe.title}
        </span>
        {recipe.domain && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 11,
              padding: '3px 7px',
              background: domainColor.bg,
              color: domainColor.text,
              border: `1px solid ${domainColor.border}`,
            }}
          >
            {recipe.domain.name}
          </span>
        )}
      </div>

      {/* カードボディ */}
      <div style={{ padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
        {recipe.description && (
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 15,
              color: '#525252',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {recipe.description}
          </div>
        )}
        {/* タグ */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {recipe.tags.map((tag, i) => (
            <span
              key={tag.id}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 11,
                padding: '3px 7px',
                background: TAG_COLORS[i % TAG_COLORS.length],
                color: i === 3 ? '#333' : '#fff',
                border: '2px solid #333',
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* カードフッター */}
      <div
        style={{
          background: '#C0C0C0',
          borderTop: '2px solid #A0A0A0',
          padding: '4px 8px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 11,
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          by {recipe.created_by_user?.username ?? '?'}
        </span>
        <span style={{ flexShrink: 0, marginLeft: 4 }}>{recipe.updated_at.slice(0, 10)}</span>
      </div>
    </div>
  )
}
