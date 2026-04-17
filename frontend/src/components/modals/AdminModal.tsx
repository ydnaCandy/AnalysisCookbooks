interface Props { onClose: () => void }
export default function AdminModal({ onClose }: Props) {
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}} onClick={onClose}><div>AdminModal（実装中）</div></div>
}
