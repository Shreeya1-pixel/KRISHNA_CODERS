export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="syra-modal-overlay" onClick={onClose}>
      <div className="syra-modal" onClick={(e) => e.stopPropagation()}>
        <div className="syra-modal-header">
          <h3>{title}</h3>
          <button type="button" className="syra-drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="syra-modal-body">{children}</div>
      </div>
    </div>
  );
}
