export type MessageState = { text: string; type: "success" | "error" } | null;

export default function Message({ message }: { message: MessageState }) {
  if (!message) return null;

  const isSuccess = message.type === "success";

  return (
    <div
      style={{
        padding: "10px 16px",
        borderRadius: "6px",
        marginTop: "12px",
        background: isSuccess ? "#1b3a1e" : "#3a1b1b",
        color: isSuccess ? "#4CAF50" : "#f44336",
        border: `1px solid ${isSuccess ? "#4CAF50" : "#f44336"}`,
      }}
    >
      {message.text}
    </div>
  );
}
