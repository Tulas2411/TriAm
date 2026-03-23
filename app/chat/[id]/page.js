"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Modal, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";

import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import TrashAnimation from "@/components/chat/TrashAnimation";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [messages, setMessages] = useState([]);
  const [myRole, setMyRole] = useState("user");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const endRef = useRef(null);

  // 1. Setup ban đầu
  useEffect(() => {
    const checkIdentity = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        if (user.user_metadata?.role === 'listener') {
          setMyRole("listener");
        } else {
          setMyRole("user"); // Keep "user" as the internal role name for sharers
        }
      } else {
        setMyRole("user");
      }
    };
    checkIdentity();

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

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

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [id, supabase]);

  // Scroll xuống cuối
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. Xử lý Gửi tin nhắn
  const handleSend = async (text) => {
    if (!text.trim()) return;

    const payload = {
      session_id: id,
      content: text,
      role: myRole,
      reply_to_id: replyingTo ? replyingTo.id : null,
    };

    await supabase.from("messages").insert([payload]);
    setReplyingTo(null);
  };

  // 3. Xử lý logic Nút Back
  const handleBack = () => {
    if (myRole === "listener") {
      router.push("/dashboard");
    } else {
      // Sharer bấm back về homepage không xóa ký ức
      router.push("/");
    }
  };

  // 4. Xóa ký ức
  const executeDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true);

    setTimeout(async () => {
      await supabase.from("messages").delete().eq("session_id", id);
      await supabase.from("sessions").delete().eq("id", id);
      router.push("/");
    }, 1500);
  };

  if (isDeleting) return <TrashAnimation />;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(180deg, #e8e3f3 0%, #d4c9e8 50%, #c9c3e6 100%)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="container h-100 py-md-3 py-0 d-flex flex-column flex-grow-1">
        <div
          className="card border-0 shadow-lg flex-grow-1 overflow-hidden d-flex flex-column"
          style={{
            borderRadius: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* HEADER */}
          <div className="card-header bg-white bg-opacity-75 border-bottom-0 p-3 d-flex align-items-center flex-shrink-0">
            {/* Nút Back */}
            <button
              onClick={handleBack}
              className="btn btn-light rounded-circle me-3 text-secondary shadow-sm"
              style={{ width: 40, height: 40 }}
            >
              ←
            </button>

            {/* Title */}
            <div className="flex-grow-1">
              <h5
                className="m-0 fw-bold"
                style={{ color: "var(--triam-text, #4B4289)" }}
              >
                {myRole === "listener" ? "🎧 Phòng Lắng Nghe" : "🌸 Góc Tâm Sự"}
              </h5>
            </div>

            {/* --- NÚT XÓA KÝ ỨC (Chỉ hiện cho User) --- */}
            {myRole === "user" && (
              <button
                className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold shadow-sm"
                onClick={() => setShowConfirm(true)}
              >
                Xóa ký ức
              </button>
            )}
            {/* ---------------------------------------- */}
          </div>

          {/* BODY CHAT */}
          <div
            className="card-body overflow-auto d-flex flex-column p-3"
            style={{ flex: 1, scrollBehavior: "smooth" }}
          >
            <AnimatePresence>
              {messages.map((msg) => {
                const isMe = msg.role === myRole;
                const originalMsg = msg.reply_to_id
                  ? messages.find((m) => m.id === msg.reply_to_id)
                  : null;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-100"
                  >
                    <MessageBubble
                      message={msg}
                      isMe={isMe}
                      onReply={(m) => setReplyingTo(m)}
                      originalMessage={originalMsg}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          {/* INPUT */}
          <div className="flex-shrink-0 bg-white">
            <ChatInput
              onSendMessage={handleSend}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </div>
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
            Rời đi & Xóa ký ức?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {myRole === "listener" ? (
            <p>Bạn muốn rời khỏi cuộc trò chuyện này?</p>
          ) : (
            <>
              <p>Bạn có chắc muốn kết thúc?</p>
              <div className="alert alert-warning small mb-0">
                ⚠️ Dữ liệu chat sẽ bị <strong>XÓA VĨNH VIỄN</strong> ngay lập
                tức.
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="light"
            className="rounded-pill px-4"
            onClick={() => setShowConfirm(false)}
          >
            Ở lại
          </Button>
          <Button
            variant="danger"
            className="rounded-pill px-4"
            onClick={
              myRole === "listener"
                ? () => router.push("/dashboard")
                : executeDelete
            }
          >
            {myRole === "listener" ? "Rời phòng" : "Xóa ký ức & Thoát"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
