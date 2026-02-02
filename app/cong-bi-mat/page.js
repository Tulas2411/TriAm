"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Import từ file mới tạo

export default function SecretLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Sai mật khẩu hoặc email.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div
        className="card shadow-sm border-0 p-4"
        style={{ maxWidth: "400px", width: "100%", borderRadius: "16px" }}
      >
        <h3 className="text-center mb-4" style={{ color: "#6b5486" }}>
          🔐 Listener Access
        </h3>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
          <input
            type="email"
            placeholder="Email bí mật"
            className="form-control rounded-pill px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mã khóa"
            className="form-control rounded-pill px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn text-white fw-bold rounded-pill py-2"
            style={{
              background: "linear-gradient(135deg, #6b5486 0%, #9b7ebd 100%)",
            }}
            disabled={loading}
          >
            {loading ? "Đang xác thực..." : "Truy cập hệ thống"}
          </button>
        </form>
      </div>
    </div>
  );
}
