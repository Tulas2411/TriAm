export default function MessageBubble({ content, role }) {
  const isUser = role === "user";

  const style = {
    alignSelf: isUser ? "flex-end" : "flex-start",
    backgroundColor: isUser ? "var(--primary-light)" : "white",
    color: "var(--text-main)",
    padding: "12px 18px",
    borderRadius: "18px",
    borderBottomRightRadius: isUser ? "4px" : "18px",
    borderBottomLeftRadius: isUser ? "18px" : "4px",
    maxWidth: "75%",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    marginBottom: "10px",
    wordWrap: "break-word",
  };

  return <div style={style}>{content}</div>;
}
