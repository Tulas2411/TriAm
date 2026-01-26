import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function TrashAnimation() {
  const router = useRouter();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 position-relative overflow-hidden">
      {/* Giấy vo tròn bay vào thùng rác */}
      <motion.div
        initial={{ scale: 1, x: 0, y: -400, opacity: 1 }}
        animate={{
          scale: [1, 0.5, 0],
          x: [0, 20, 0],
          y: [-400, 0, 200],
          rotate: 720,
          opacity: [1, 1, 0],
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{
          width: "80px",
          height: "80px",
          background: "white",
          borderRadius: "50%",
          position: "absolute",
          zIndex: 10,
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        }}
      />

      {/* Thùng rác rung lắc */}
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{ fontSize: "6rem", zIndex: 5 }}
      >
        🗑️
      </motion.div>

      {/* Thông báo cuối cùng */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="text-center mt-5"
      >
        <h3 style={{ color: "var(--primary-dark)" }}>Đã xóa hoàn toàn</h3>
        <p className="text-muted">Mọi tin nhắn đã biến mất vĩnh viễn.</p>
        <button
          className="btn btn-outline-secondary mt-3"
          onClick={() => router.push("/")}
        >
          Về trang chủ
        </button>
      </motion.div>
    </div>
  );
}
