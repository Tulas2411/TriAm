"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button } from "react-bootstrap";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabaseClient = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
  };


  const handleStart = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sessions")
      .insert([{ is_active: true }])
      .select();
    if (data) {
      router.push(`/chat/${data[0].id}`);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="hero-bg overflow-hidden">
      {/* HEADER */}
      <header className="header-glass sticky-top py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
              }}
            >
              <img
                src="/logo-triam.png" // Đảm bảo ảnh này nằm trong thư mục public/
                alt="Tri Âm Logo"
                className="rounded-circle shadow-sm" // Thêm bo tròn và bóng nhẹ cho đẹp
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
            </div>
            <span className="h5 mb-0 fw-bold gradient-text">Tri Âm</span>
          </div>

          <nav className="d-none d-md-flex gap-4">
            <a
              href="#"
              className="text-decoration-none text-secondary fw-medium"
            >
              Trang chủ
            </a>
            <a
              href="#features"
              className="text-decoration-none text-secondary fw-medium"
            >
              Tính năng
            </a>
            <a
              href="#about"
              className="text-decoration-none text-secondary fw-medium"
            >
              Bảo mật
            </a>
          </nav>

          <div className="d-flex align-items-center gap-2">
            {!user ? (
              <>
                <Link href="/login" className="btn btn-outline-primary d-none d-md-block rounded-pill fw-medium">
                  Đăng nhập
                </Link>
                <Link href="/register" className="btn btn-triam-primary rounded-pill fw-medium px-4">
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                <Link href="/pricing" className="btn btn-warning fw-bold text-dark d-none d-md-block rounded-pill shadow-sm">
                  ⭐ Nâng cấp Premium
                </Link>
                <button
                  className="btn btn-outline-danger rounded-pill fw-medium px-4"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </>
            )}
            <button
              className="btn btn-triam-primary ms-2 rounded-pill px-4"
              onClick={() => setShowModal(true)}
            >
              Bắt đầu
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="container py-5 mt-4">
        <div className="row align-items-center gy-5">
          {/* Left Content */}
          <div className="col-lg-6 floating-anim">
            <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-50 px-3 py-2 rounded-pill mb-4">
              <span
                className="text-primary fw-bold"
                style={{ fontSize: "0.8rem" }}
              >
                💜 WEB TRI ÂM
              </span>
            </div>

            <h1 className="display-3 fw-bold mb-4 lh-sm">
              HỖ TRỢ TÂM SỰ
              <br />
              <span className="gradient-text">ẨN DANH</span>
            </h1>

            <p className="lead text-secondary mb-5 pe-lg-5">
              Lắng nghe và chia sẻ một cách ẩn danh với những người đồng cảm.
              Một không gian an toàn để bạn được là chính mình.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="btn btn-triam-primary btn-lg d-inline-flex align-items-center gap-2 px-4 py-3"
            >
              <span>Bắt đầu trò chuyện</span>
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>

          {/* Right Content - CSS Mockup (Không cần ảnh) */}
          <div
            className="col-lg-6 position-relative floating-anim"
            style={{ animationDelay: "-3s" }}
          >
            <div className="mockup-frame bg-white">
              {/* Browser Bar */}
              <div className="mockup-header">
                <div className="mockup-dot dot-red"></div>
                <div className="mockup-dot dot-yellow"></div>
                <div className="mockup-dot dot-green"></div>
                <div className="mockup-url">triam.app</div>
              </div>

              {/* Screen Content */}
              <div className="mockup-body">
                <div className="bg-white rounded-4 p-4 shadow-sm">
                  {/* Chat Header inside Mockup */}
                  <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      </svg>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">Tri Âm Bot</h6>
                      <small className="text-muted">Đang lắng nghe...</small>
                    </div>
                  </div>

                  {/* Chat Bubbles */}
                  <div className="d-flex flex-column gap-3">
                    <div className="chat-bubble-left">
                      Bạn cảm thấy như thế nào hôm nay?
                    </div>
                    <div className="chat-bubble-right">
                      Có ai đó sẵn sàng lắng nghe tôi không? 😔
                    </div>
                    <div className="chat-bubble-left">
                      Tôi đang ở đây, hãy chia sẻ với tôi nhé!
                    </div>
                  </div>

                  {/* Input Fake */}
                  <div className="mt-4 pt-3 border-top d-flex gap-2">
                    <div className="flex-grow-1 bg-light rounded-pill px-3 py-2 text-muted small">
                      Nhập tin nhắn...
                    </div>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white"
                      style={{
                        width: "35px",
                        height: "35px",
                        background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                      }}
                    >
                      ➤
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold gradient-text mb-3">
              Tính năng hỗ trợ
            </h2>
            <p className="text-secondary">
              Mọi thứ bạn cần để cảm thấy an toàn
            </p>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="card-hover h-100 text-center">
                <div
                  className="d-inline-flex p-3 rounded-4 mb-4"
                  style={{ background: "#f3e8ff" }}
                >
                  <svg
                    style={{ color: "#9333ea" }}
                    width="32"
                    height="32"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h4 className="fw-bold mb-3">Tâm sự ẩn danh</h4>
                <p className="text-muted small">
                  Hoàn toàn bảo mật. Không cần đăng nhập. Danh tính của bạn là
                  bí mật vĩnh viễn.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="card-hover h-100 text-center">
                <div
                  className="d-inline-flex p-3 rounded-4 mb-4"
                  style={{ background: "#f3e8ff" }}
                >
                  <svg
                    style={{ color: "#9333ea" }}
                    width="32"
                    height="32"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <h4 className="fw-bold mb-3">Lắng nghe đồng cảm</h4>
                <p className="text-muted small">
                  Kết nối với những người sẵn sàng lắng nghe bạn mà không phán
                  xét.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="card-hover h-100 text-center">
                <div
                  className="d-inline-flex p-3 rounded-4 mb-4"
                  style={{ background: "#f3e8ff" }}
                >
                  <svg
                    style={{ color: "#9333ea" }}
                    width="32"
                    height="32"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h4 className="fw-bold mb-3">Truy cập mọi lúc</h4>
                <p className="text-muted small">
                  Hệ thống hoạt động 24/7. Luôn có ai đó ở đây khi bạn cần.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-5"
        style={{
          background: "linear-gradient(to top, #f3e8ff, rgba(255,255,255,0))",
        }}
      >
        <div className="container text-center">
          <p className="text-muted mb-0">
            © 2026 Tri Âm. Thiết kế cho những tâm hồn cần chia sẻ.
          </p>
        </div>
      </footer>

      {/* MODAL CAM KẾT (Giữ nguyên logic cũ) */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        contentClassName="border-0 rounded-4 shadow-lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title
            className="fw-bold fs-5"
            style={{ color: "#6b5486", lineHeight: "1.4" }}
          >
            Trước khi mình bắt đầu câu chuyện mình nói nhỏ điều này nhé
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="px-4 py-3"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          <div
            style={{ color: "#555", fontSize: "0.95rem", lineHeight: "1.6" }}
          >
            <p className="mb-3">
              <strong>Tri Âm</strong> là một góc an toàn để bạn chia sẻ ẩn danh
              và được lắng nghe bởi người có kiến thức về tâm lý. Tụi mình ở đây
              để đồng hành và giúp bạn nhẹ lòng hơn, nhưng không thay thế cho
              bác sĩ hay điều trị tâm lý chuyên sâu đâu nha.
            </p>
            <p className="mb-3">
              Nếu bạn đang trải qua khủng hoảng nghiêm trọng hoặc có ý nghĩ làm
              hại bản thân hay người khác, bạn nên tìm đến cơ sở y tế hoặc
              chuyên gia gần nhất để được hỗ trợ kịp thời và an toàn hơn.
            </p>
            <p className="mb-3">
              Sau cuộc trò chuyện, mọi quyết định vẫn là ở bạn. Mong bạn cũng
              giúp giữ không gian này an toàn bằng cách không sử dụng nền tảng
              cho mục đích gây tổn thương hay vi phạm pháp luật nhé.
            </p>
            <p className="mb-3">
              Cuộc trò chuyện của chúng ta hoàn toàn ẩn danh. Khi bạn chọn kết
              thúc và đồng ý xóa, nội dung sẽ được xóa khỏi hệ thống và không
              thể khôi phục lại.
            </p>
            <p className="mb-0">
              Nếu bạn đã sẵn sàng, nhấn <strong>“Đồng ý”</strong> để mình bắt
              đầu cùng nhau nha.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-4 pb-4">
          <Button
            variant="light"
            onClick={() => setShowModal(false)}
            className="rounded-pill px-4"
          >
            Hủy
          </Button>
          <Button
            className="btn-triam-primary rounded-pill px-4"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Đang tạo phòng..." : "Đồng ý"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
