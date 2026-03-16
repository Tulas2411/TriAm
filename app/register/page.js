"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: `${username}@triam.app`,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage("Đăng ký thành công! Bạn hiện có thể đăng nhập.");
      setLoading(false);
      // Optional: router.push("/login");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light hero-bg">
      <div
        className="card shadow-lg border-0 p-5"
        style={{ maxWidth: "450px", width: "100%", borderRadius: "20px" }}
      >
        <div className="text-center mb-4">
          <Link href="/">
            <img
              src="/logo-triam.png"
              alt="Tri Âm Logo"
              className="rounded-circle shadow-sm mb-3"
              style={{ width: "60px", height: "60px", objectFit: "cover", cursor: "pointer" }}
            />
          </Link>
          <h3 className="fw-bold gradient-text">Đăng ký tài khoản</h3>
          <p className="text-muted small">Tạo một tài khoản để tiến tới phiên bản Premium.</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {message && <div className="alert alert-success py-2">{message}</div>}

        <form onSubmit={handleRegister} className="d-flex flex-column gap-3">
          <input
            type="text"
            placeholder="Tên tài khoản"
            className="form-control rounded-pill px-4 py-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="form-control rounded-pill px-4 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="submit"
            className="btn text-white fw-bold rounded-pill py-3 mt-2"
            style={{
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
            }}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <span className="text-secondary small">Đã có tài khoản? </span>
          <Link href="/login" className="text-decoration-none fw-bold" style={{ color: "#7c3aed" }}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
