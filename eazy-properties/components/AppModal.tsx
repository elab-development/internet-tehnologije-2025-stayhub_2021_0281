type AppModalProps = {
  title: string;
  isOpen: boolean;
  children: React.ReactNode;
  onClose: () => void;
};

export default function AppModal({
  title,
  isOpen,
  children,
  onClose,
}: AppModalProps) {
  // Ako modal nije otvoren, ne prikazujemo ništa.
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Form window.</p>
            <h2>{title}</h2>
          </div>

          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}