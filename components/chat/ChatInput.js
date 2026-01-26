import { useState } from "react";

export default function ChatInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="d-flex gap-2 p-3 bg-white border-top"
    >
      <input
        type="text"
        className="form-control border-0 bg-light"
        placeholder="Nhập tâm sự..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        style={{ borderRadius: "25px", paddingLeft: "20px" }}
      />
      <button
        type="submit"
        className="btn btn-primary-triam"
        disabled={disabled || !input.trim()}
        style={{
          width: "50px",
          height: "50px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ➤
      </button>
    </form>
  );
}
