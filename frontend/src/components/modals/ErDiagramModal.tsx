interface Props { sqlText: string; onClose: () => void }
export default function ErDiagramModal({ onClose }: Props) {
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}} onClick={onClose}><div>ErDiagramModal（実装中）</div></div>
}
