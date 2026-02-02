"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Modal, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";

// Import các component con
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import TrashAnimation from "@/components/chat/TrashAnimation";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient(); // Khởi tạo Supabase Client mới

  const [messages, setMessages] = useState([]);
  const [myRole, setMyRole] = useState("user"); // Mặc định là 'user' (người lạ)
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const endRef = useRef(null);

  // 1. Kiểm tra danh tính & Lấy tin nhắn
  useEffect(() => {
    // A. Kiểm tra xem người dùng hiện tại có phải là Listener (đã login) không
    const checkIdentity = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setMyRole("listener"); // Nếu đã đăng nhập -> Role là Listener
      } else {
        setMyRole("user"); // Nếu chưa đăng nhập -> Role là User
      }
    };
    checkIdentity();

    // B. Lấy danh sách tin nhắn cũ
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", id)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    };
    fetchMessages();

    // C. Bắt sự kiện Realtime (Tin nhắn mới đến)
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
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        },
      )
      .subscribe();

    // Cleanup khi thoát trang
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase]);

  // 2. Auto Scroll xuống cuối khi có tin mới
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Gửi tin nhắn
  const handleSend = async (text) => {
    if (!text.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        session_id: id,
        content: text,
        role: myRole, // Gửi với role hiện tại (user hoặc listener)
      },
    ]);

    if (error) {
      console.error("Lỗi gửi tin:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
  };

  // 4. Xử lý "Xóa ký ức"
  const executeDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true); // Kích hoạt animation màn hình chờ

    // Đợi 1.5s cho animation chạy rồi mới xóa dữ liệu
    setTimeout(async () => {
      // Xóa messages trước
      await supabase.from("messages").delete().eq("session_id", id);
      // Xóa session sau
      await supabase.from("sessions").delete().eq("id", id);

      // Điều hướng sau khi xóa
      if (myRole === "listener") {
        router.push("/dashboard"); // Listener về dashboard
        router.refresh();
      } else {
        router.push("/"); // User về trang chủ
      }
    }, 1500);
  };

  // --- RENDER ---

  // Nếu đang trong trạng thái xóa -> Hiển thị Animation thùng rác
  if (isDeleting) return <TrashAnimation />;

  return (
    <div
      className="container py-3 h-100"
      style={{ height: "100vh", maxHeight: "100vh" }}
    >
      <div
        className="card border-0 shadow-lg h-100 overflow-hidden"
        style={{ borderRadius: "20px" }}
      >
        {/* HEADER */}
        <div className="card-header bg-white border-bottom-0 p-3 d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: "1.5rem" }}>
                {myRole === "listener" ? "🎧" : "🌸"}
              </span>
              <h5
                className="m-0 fw-bold"
                style={{ color: "var(--triam-text, #4B4289)" }}
              >
                {myRole === "listener" ? "Phòng Lắng Nghe" : "Góc Tâm Sự"}
              </h5>
            </div>
            <small className="text-muted ms-1">
              {myRole === "listener"
                ? "Bạn đang là Người lắng nghe"
                : "Danh tính của bạn được ẩn"}
            </small>
          </div>

          <button
            className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
            onClick={() => setShowConfirm(true)}
          >
            Kết thúc
          </button>
        </div>

        {/* BODY CHAT */}
        <div
          className="card-body bg-light overflow-auto d-flex flex-column"
          style={{ flex: 1 }}
        >
          {messages.length === 0 && (
            <div className="text-center mt-5 text-muted">
              <p className="mb-1" style={{ fontSize: "3rem" }}>
                🍃
              </p>
              <p>Chưa có tin nhắn nào.</p>
              <p className="small">Hãy bắt đầu câu chuyện...</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg) => {
              // Logic xác định tin nhắn của "Tôi" hay "Người kia"
              // Nếu msg.role trùng với myRole -> Là của tôi (isMe = true)
              const isMe = msg.role === myRole;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="d-flex flex-column"
                >
                  <MessageBubble
                    content={msg.content}
                    role={msg.role}
                    isMe={isMe}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* INPUT */}
        <div className="bg-white">
          <ChatInput onSendMessage={handleSend} />
        </div>
      </div>

      {/* MODAL XÁC NHẬN */}
      <Modal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        centered
        contentClassName="border-0 rounded-4 shadow"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger">
            Xác nhận kết thúc
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc muốn xóa vĩnh viễn cuộc trò chuyện này?</p>
          <div className="alert alert-warning small mb-0">
            ⚠️ Hành động này không thể hoàn tác. Mọi tin nhắn sẽ biến mất mãi
            mãi.
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="light"
            className="rounded-pill px-4"
            onClick={() => setShowConfirm(false)}
          >
            Quay lại
          </Button>
          <Button
            variant="danger"
            className="rounded-pill px-4"
            onClick={executeDelete}
          >
            🗑️ Xóa ký ức
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
