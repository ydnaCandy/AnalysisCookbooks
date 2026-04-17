import type { Domain, Tag, Recipe } from '../../types'

interface Props { recipe: Recipe | null; domains: Domain[]; tags: Tag[]; onClose: () => void }
export default function RecipeModal({ onClose }: Props) {
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}} onClick={onClose}><div>RecipeModal（実装中）</div></div>
}
