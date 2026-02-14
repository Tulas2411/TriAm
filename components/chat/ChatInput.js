import { useState } from "react";

export default function ChatInput({
  onSendMessage,
  replyingTo,
  onCancelReply,
}) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="bg-white border-top">
      {/* Thanh hiển thị đang Reply */}
      {replyingTo && (
        <div className="d-flex justify-content-between align-items-center px-3 py-2 bg-light border-bottom">
          <div
            className="small text-muted text-truncate"
            style={{ maxWidth: "90%" }}
          >
            Đang trả lời{" "}
            <strong>
              {replyingTo.role === "user" ? "Người chia sẻ" : "Listener"}
            </strong>
            : {replyingTo.content}
          </div>
          <button
            onClick={onCancelReply}
            className="btn-close btn-close-sm"
          ></button>
        </div>
      )}

      {/* Form nhập liệu */}
      <form onSubmit={handleSubmit} className="d-flex gap-2 p-3">
        <input
          type="text"
          className="form-control border-0 bg-light"
          placeholder={replyingTo ? "Nhập câu trả lời..." : "Nhập tâm sự..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ borderRadius: "25px", paddingLeft: "20px" }}
        />
        <button
          type="submit"
          className="btn text-white fw-bold rounded-circle shadow-sm"
          style={{
            width: "50px",
            height: "50px",
            background: "linear-gradient(135deg, #6b5486 0%, #9b7ebd 100%)",
          }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
