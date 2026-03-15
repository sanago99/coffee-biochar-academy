"use client";

interface Props {
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ message, confirmLabel = "Confirmar", danger = false, onConfirm, onCancel }: Props) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(12,10,7,0.82)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={onCancel}
    >
      <div
        className="card fade-up"
        style={{ maxWidth: "380px", width: "100%", padding: "28px 28px 24px" }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ fontSize: "15px", color: "var(--text-primary)", lineHeight: 1.65, marginBottom: "24px" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ cursor: "pointer" }}
            onClick={onCancel}
            autoFocus
          >
            Cancelar
          </button>
          <button
            className={`btn btn-sm ${danger ? "btn-primary" : "btn-primary"}`}
            style={{
              cursor: "pointer",
              background: danger ? "var(--rust)" : undefined,
              boxShadow: danger ? "0 4px 20px rgba(192,74,42,0.3)" : undefined,
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
