"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Lấy danh sách phòng chat
    const fetchSessions = async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) setSessions(data);
    };
    fetchSessions();

    // Realtime: Tự động cập nhật khi có phòng mới
    const channel = supabase
      .channel("room_monitor")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => fetchSessions(), // Reload lại list khi có thay đổi
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="fw-bold" style={{ color: "#4B4289" }}>
          🎧 Dashboard Listener
        </h2>
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger rounded-pill px-4"
        >
          Đăng xuất
        </button>
      </div>

      <div className="row g-4">
        {sessions.length === 0 ? (
          <div className="col-12 text-center text-muted py-5">
            Hiện chưa có ai cần tâm sự...
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="col-md-6 col-lg-4">
              <div
                className="card h-100 border-0 shadow-sm"
                style={{ borderRadius: "16px", overflow: "hidden" }}
              >
                <div className="card-body">
                  <h5
                    className="card-title fw-bold"
                    style={{ color: "#6b5486" }}
                  >
                    Phòng #{session.id.slice(0, 4)}
                  </h5>
                  <p className="card-text text-muted small">
                    Bắt đầu:{" "}
                    {new Date(session.created_at).toLocaleTimeString("vi-VN")}
                  </p>
                  <button
                    onClick={() => router.push(`/chat/${session.id}`)}
                    className="btn w-100 text-white rounded-pill mt-3"
                    style={{ background: "#9b7ebd" }}
                  >
                    Tham gia lắng nghe ➤
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
