import { useState } from "react";

export default function MessageBubble({
  message,
  isMe,
  onReply,
  originalMessage,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Kiểm tra an toàn: Nếu không có message, không render gì cả
  if (!message) return null;

  // Style cho bong bóng chat
  const bubbleStyle = {
    backgroundColor: isMe ? "var(--triam-primary, #C9C3E6)" : "white",
    color: "var(--triam-text, #4B4289)",
    padding: "10px 15px",
    borderRadius: "18px",
    borderBottomRightRadius: isMe ? "4px" : "18px",
    borderBottomLeftRadius: isMe ? "18px" : "4px",
    position: "relative",
    wordWrap: "break-word",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    textAlign: "left",
    minWidth: "60px",
  };

  // Style cho phần trích dẫn
  const quoteStyle = {
    fontSize: "0.8rem",
    color: "rgba(0,0,0,0.6)",
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: "6px 10px",
    borderRadius: "10px",
    marginBottom: "6px",
    borderLeft: `3px solid ${isMe ? "#6B5486" : "#C9C3E6"}`,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  };

  // Hàm render nút Reply (Thay vì định nghĩa Component con)
  const renderReplyButton = () => (
    <button
      onClick={() => onReply && onReply(message)}
      className="btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
      style={{
        width: 30,
        height: 30,
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.2s ease",
        color: "#6c757d",
        cursor: isHovered ? "pointer" : "default",
        transform: isMe ? "scaleX(-1)" : "none",
        border: "none",
        background: "transparent",
      }}
      title="Trả lời"
      type="button" // Thêm type để tránh submit form ngoài ý muốn
    >
      <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>↩</span>
    </button>
  );

  return (
    <div
      className={`d-flex w-100 mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="d-flex align-items-center gap-2"
        style={{ maxWidth: "85%" }}
      >
        {/* Nút Reply bên trái (cho tin nhắn của User) */}
        {isMe && renderReplyButton()}

        <div style={bubbleStyle}>
          {/* Phần trích dẫn tin nhắn gốc */}
          {originalMessage && (
            <div style={quoteStyle}>
              <strong
                className="d-block"
                style={{ fontSize: "0.75rem", marginBottom: "2px" }}
              >
                {originalMessage.role === "user" ? "Người chia sẻ" : "Listener"}
                :
              </strong>
              {originalMessage.content}
            </div>
          )}
          {/* Nội dung tin nhắn chính */}
          {message.content}
        </div>

        {/* Nút Reply bên phải (cho tin nhắn của Listener) */}
        {!isMe && renderReplyButton()}
      </div>
    </div>
  );
}
