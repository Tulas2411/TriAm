"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Modal, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";

// Import các components con đã tách
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import TrashAnimation from "@/components/chat/TrashAnimation";

export default function ChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false); // Modal xác nhận xóa
  const [isDeleting, setIsDeleting] = useState(false); // Trạng thái đang chạy animation xóa
  const endRef = useRef(null);

  // 1. Lấy tin nhắn và lắng nghe Realtime
  useEffect(() => {
    const fetchMsg = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", id)
        .order("created_at");
      if (data) setMessages(data);
    };
    fetchMsg();

    const channel = supabase
      .channel("chat_room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${id}`,
        },
        (payload) => setMessages((prev) => [...prev, payload.new]),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id]);

  // Scroll xuống cuối khi có tin mới
  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages],
  );

  // 2. Gửi tin nhắn
  const handleSend = async (text) => {
    await supabase
      .from("messages")
      .insert([{ session_id: id, content: text, role: "user" }]);
  };

  // 3. Xử lý logic xóa
  const executeDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true); // Kích hoạt UI TrashAnimation

    // Đợi animation chạy 1 chút rồi xóa DB ngầm
    setTimeout(async () => {
      await supabase.from("messages").delete().eq("session_id", id);
      await supabase.from("sessions").delete().eq("id", id);
    }, 1000);
  };

  // --- RENDER ---

  // Nếu đang xóa -> Hiện TrashAnimation
  if (isDeleting) return <TrashAnimation />;

  return (
    <div className="container py-3 h-100">
      <div
        className="card border-0 shadow-lg h-100 overflow-hidden"
        style={{ borderRadius: "20px" }}
      >
        {/* Header */}
        <div className="card-header bg-white border-bottom-0 p-3 d-flex justify-content-between align-items-center">
          <h5 className="m-0" style={{ color: "var(--primary-dark)" }}>
            🌸 Phòng Tâm Sự
          </h5>
          <button
            className="btn btn-outline-danger btn-sm rounded-pill px-3"
            onClick={() => setShowConfirm(true)}
          >
            Kết thúc
          </button>
        </div>

        {/* List tin nhắn */}
        <div
          className="card-body bg-light overflow-auto d-flex flex-column"
          style={{ height: "70vh" }}
        >
          {messages.length === 0 && (
            <p className="text-center text-muted mt-5">
              Không gian này là của bạn.
              <br />
              Hãy nói gì đó...
            </p>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="d-flex flex-column"
              >
                <MessageBubble content={msg.content} role={msg.role} />
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* Input */}
        <ChatInput onSendMessage={handleSend} />
      </div>

      {/* Modal xác nhận xóa */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn muốn kết thúc và xóa vĩnh viễn đoạn chat này?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Không
          </Button>
          <Button variant="danger" onClick={executeDelete}>
            Xóa ký ức
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
