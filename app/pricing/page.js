"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Create payment URL via our API
      const res = await fetch("/api/vnpay/create_payment_url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 50000, // 50,000 VND for example
          bankCode: "", // Optional, let VNPay show methods
          orderDescription: "Nâng cấp Premium Tri Âm",
          orderType: "other",
          language: "vn",
        }),
      });

      const data = await res.json();
      if (data && data.url) {
        // Redirect standard window to VNPay
        window.location.href = data.url;
      } else {
        alert("Lỗi tạo link thanh toán: " + data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra");
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light hero-bg py-5">
      <div className="container">
        <div className="text-center mb-5 mt-4">
          <Link href="/">
            <img
              src="/logo-triam.png"
              alt="Tri Âm Logo"
              className="rounded-circle shadow-sm mb-3"
              style={{ width: "80px", height: "80px", objectFit: "cover", cursor: "pointer" }}
            />
          </Link>
          <h1 className="display-4 fw-bold gradient-text">Nâng cấp Premium</h1>
          <p className="lead text-secondary">
            Trở thành thành viên Premium để trải nghiệm không gian sẻ chia toàn diện nhất.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div
                className="card-header border-0 text-white text-center py-4"
                style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}
              >
                <h3 className="mb-0 fw-bold">Gói Premium</h3>
                <div className="display-5 fw-bold mt-2">50.000đ</div>
                <div className="small opacity-75">/ Tháng</div>
              </div>
              <div className="card-body p-5">
                <ul className="list-unstyled mb-4">
                  <li className="mb-3 d-flex align-items-center">
                    <span className="text-success me-2 fw-bold">✓</span> Huy hiệu Premium uy tín
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <span className="text-success me-2 fw-bold">✓</span> Ưu tiên kết nối Listener
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <span className="text-success me-2 fw-bold">✓</span> Không giới hạn thời gian chat
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <span className="text-success me-2 fw-bold">✓</span> Trò chuyện bảo mật cao cấp
                  </li>
                </ul>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="btn btn-warning w-100 py-3 rounded-pill fw-bold text-dark shadow-sm"
                  style={{ fontSize: "1.1rem" }}
                >
                  {loading ? "Đang kết nối VNPay..." : "Thanh toán qua VNPay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
