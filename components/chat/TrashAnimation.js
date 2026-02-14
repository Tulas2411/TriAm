"use client"; // 👈 QUAN TRỌNG: Dòng này bắt buộc phải có ở đầu file

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function TrashAnimation() {
  const [stage, setStage] = useState("crumple"); // crumple -> toss -> done

  // 1. SVG Cục giấy vo tròn
  const PaperBall = () => (
    <svg
      viewBox="0 0 100 100"
      fill="white"
      stroke="#ccc"
      strokeWidth="2"
      style={{
        width: "100%",
        height: "100%",
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
      }}
    >
      <path d="M50 5 C20 5, 5 20, 10 40 C5 60, 20 90, 50 95 C80 90, 95 60, 90 40 C95 20, 80 5, 50 5 Z M30 30 Q50 50 70 30 M30 70 Q50 50 70 70 M20 50 L80 50" />
      <path d="M10 40 Q30 20 50 10" stroke="#ddd" fill="none" />
      <path d="M90 60 Q70 80 50 90" stroke="#ddd" fill="none" />
    </svg>
  );

  // 2. SVG Thùng rác
  const TrashBin = ({ isOpen }) => (
    <div style={{ position: "relative", width: 120, height: 140 }}>
      {/* Nắp thùng rác */}
      <motion.div
        initial={{ rotate: 0, y: 0 }}
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? -10 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          originX: 0,
          position: "absolute",
          top: 0,
          left: 10,
          zIndex: 20,
        }}
      >
        <svg width="100" height="20" viewBox="0 0 100 20">
          <path d="M10 20 L90 20 L85 5 L15 5 Z" fill="#5a5a5a" />
          <rect x="40" y="0" width="20" height="5" rx="2" fill="#5a5a5a" />
        </svg>
      </motion.div>

      {/* Thân thùng rác */}
      <motion.div
        animate={isOpen ? { scale: [1, 1.05, 1], y: [0, 2, 0] } : {}}
        transition={{ delay: 0.1 }}
        style={{ position: "absolute", top: 20, left: 15, zIndex: 10 }}
      >
        <svg width="90" height="120" viewBox="0 0 90 120">
          <path
            d="M5 0 L85 0 L75 110 Q75 120 65 120 L25 120 Q15 120 15 110 Z"
            fill="#808080"
          />
          <path
            d="M20 10 L25 110"
            stroke="#666"
            strokeWidth="3"
            opacity="0.5"
          />
          <path
            d="M45 10 L45 110"
            stroke="#666"
            strokeWidth="3"
            opacity="0.5"
          />
          <path
            d="M70 10 L65 110"
            stroke="#666"
            strokeWidth="3"
            opacity="0.5"
          />
        </svg>
      </motion.div>
    </div>
  );

  // Logic chuyển giai đoạn
  useEffect(() => {
    const timer1 = setTimeout(() => setStage("toss"), 1000);
    return () => clearTimeout(timer1);
  }, []);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-end"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(180deg, #e8e3f3 0%, #d4c9e8 50%, #c9c3e6 100%)",
        zIndex: 2000,
        overflow: "hidden",
      }}
    >
      {/* 1. HIỆU ỨNG TỜ GIẤY */}
      <motion.div
        initial={{
          scale: 1,
          borderRadius: "20px",
          y: "-50vh",
          width: "90%",
          maxWidth: "600px",
          height: "60vh",
          backgroundColor: "white",
          opacity: 1,
        }}
        animate={
          stage === "crumple"
            ? {
                scale: [1, 0.7, 0.4, 0.15],
                rotate: [0, -5, 5, -10, 10, -180],
                borderRadius: ["20px", "10%", "30%", "50%"],
                backgroundColor: ["#ffffff", "#f0f0f0", "#e0e0e0"],
                y: "-50vh",
              }
            : {
                scale: 0.15,
                x: [0, 50, 100, 0],
                y: ["-50vh", "0vh"],
                rotate: 720,
                opacity: [1, 1, 0],
              }
        }
        transition={
          stage === "crumple"
            ? { duration: 1, ease: "easeInOut" }
            : { duration: 0.6, ease: "easeIn", times: [0, 1] }
        }
        style={{
          position: "absolute",
          zIndex: 30,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        {stage === "crumple" && (
          <div
            className="p-3 w-100 h-100 d-flex flex-column gap-3 overflow-hidden"
            style={{ opacity: 0.5 }}
          >
            <div className="bg-light rounded p-2 w-75">...</div>
            <div className="bg-secondary bg-opacity-25 rounded p-2 w-50 align-self-end">
              ...
            </div>
            <div className="bg-light rounded p-2 w-75">...</div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === "crumple" ? [0, 0, 1] : 1 }}
          transition={{ duration: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <PaperBall />
        </motion.div>
      </motion.div>

      {/* 2. THÙNG RÁC */}
      <div style={{ marginBottom: "50px", position: "relative" }}>
        <TrashBin isOpen={stage === "toss"} />
      </div>

      {/* 3. THÔNG BÁO CUỐI CÙNG */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: stage === "toss" ? 1 : 0,
          y: stage === "toss" ? 0 : 20,
        }}
        transition={{ delay: 1.5 }}
        className="text-center position-absolute"
        style={{ bottom: "20%" }}
      >
        <h4 className="fw-bold" style={{ color: "#4B4289" }}>
          Đã xóa ký ức
        </h4>
        <p className="text-muted small">Mọi nỗi buồn đã được dọn dẹp.</p>
      </motion.div>
    </div>
  );
}
