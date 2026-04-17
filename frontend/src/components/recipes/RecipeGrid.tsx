import type { Domain, Tag, Recipe } from '../../types'
import RecipeCard from './RecipeCard'

interface RecipeGridProps {
  recipes: Recipe[]
  domains: Domain[]
  tags: Tag[]
  selectedDomainId: number | null
  selectedTagId: number | null
  onSelectDomain: (id: number | null) => void
  onSelectTag: (id: number | null) => void
  onClickRecipe: (recipe: Recipe) => void
  onClickNew: () => void
}

const btnStyle: React.CSSProperties = {
  background: '#2ecc71',
  color: '#fff',
  border: '2px solid #333',
  boxShadow: '3px 3px 0 #1a8a4a',
  padding: '5px 10px',
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 8,
  cursor: 'pointer',
  letterSpacing: 1,
}

const selectStyle: React.CSSProperties = {
  background: '#ECECEC',
  border: '2px solid #333',
  boxShadow: '2px 2px 0 #525252',
  padding: '4px 8px',
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 8,
  color: '#333',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 7,
  color: '#525252',
  letterSpacing: 1,
}

export default function RecipeGrid({
  recipes,
  domains,
  tags,
  selectedDomainId,
  selectedTagId,
  onSelectDomain,
  onSelectTag,
  onClickRecipe,
  onClickNew,
}: RecipeGridProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ツールバー */}
      <div
        style={{
          background: '#C0C0C0',
          padding: '8px 12px',
          borderBottom: '3px solid #525252',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <span style={labelStyle}>DOMAIN</span>
        <select
          style={selectStyle}
          value={selectedDomainId ?? ''}
          onChange={(e) => onSelectDomain(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">ALL</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <span style={labelStyle}>TAG</span>
        <select
          style={selectStyle}
          value={selectedTagId ?? ''}
          onChange={(e) => onSelectTag(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">ALL</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div style={{ flex: 1 }} />
        <button style={btnStyle} onClick={onClickNew}>
          [ + NEW RECIPE ]
        </button>
      </div>

      {/* カードグリッド */}
      <div
        style={{
          flex: 1,
          padding: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
          alignContent: 'start',
          overflowY: 'auto',
        }}
      >
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onClickRecipe(recipe)} />
        ))}
        {recipes.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 10,
              color: '#A0A0A0',
              padding: 40,
            }}
          >
            NO RECIPES FOUND
          </div>
        )}
      </div>
    </div>
  )
}
