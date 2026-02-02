export default function MessageBubble({ content, role, isMe }) {
  // Nếu là tin nhắn của "Tôi" (dù là User hay Listener) -> Nằm bên phải, màu đậm
  // Nếu là tin nhắn của "Người kia" -> Nằm bên trái, màu trắng

  const style = {
    alignSelf: isMe ? "flex-end" : "flex-start",
    backgroundColor: isMe ? "var(--primary-light)" : "white",
    color: "var(--text-main)",
    padding: "12px 18px",
    borderRadius: "18px",
    borderBottomRightRadius: isMe ? "4px" : "18px",
    borderBottomLeftRadius: isMe ? "18px" : "4px",
    maxWidth: "75%",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    marginBottom: "10px",
    wordWrap: "break-word",
  };

  return (
    <div style={style}>
      {/* Hiển thị role nhỏ xíu để phân biệt nếu cần */}
      <small
        style={{
          fontSize: "0.6rem",
          opacity: 0.5,
          display: "block",
          marginBottom: "2px",
        }}
      >
        {role === "user" ? "Người chia sẻ" : "Người lắng nghe"}
      </small>
      {content}
    </div>
  );
}
