export default function Drawer({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="syra-drawer-overlay" onClick={onClose}>
      <div className="syra-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="syra-drawer-header">
          <h3>{title}</h3>
          <button type="button" className="syra-drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="syra-drawer-body">{children}</div>
      </div>
    </div>
  );
}
