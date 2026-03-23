"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("sessions"); // 'sessions' | 'users' | 'stats'
  
  // Sessions State
  const [sessions, setSessions] = useState([]);
  
  // Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Chart Filtering State
  const [chartViewMode, setChartViewMode] = useState("week"); // 'week' | 'month'

  const router = useRouter();
  const supabase = createClient();

  // Validate Access
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
         router.push('/cong-bi-mat');
      } else if (user.user_metadata?.role !== 'listener') {
         router.push('/');
      }
    });
  }, []);

  // Fetch Sessions
  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) setSessions(data);
    };
    fetchSessions();

    const channel = supabase
      .channel("room_monitor")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => fetchSessions(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Fetch Users
  useEffect(() => {
    if (activeTab === "users" || activeTab === "stats") {
      if (users.length === 0) {
         fetchUsers();
      }
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data);
    } catch (err) {
      setErrorUsers(err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateUser = async (userId, fakeCreatedAt, fakeLastSignedAt) => {
    setUpdatingUser(true);
    try {
      const payload = { userId };
      if (fakeCreatedAt) payload.fakeCreatedAt = fakeCreatedAt;
      if (fakeLastSignedAt) payload.fakeLastSignedAt = fakeLastSignedAt;
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fakeCreatedAt, fakeLastSignedAt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Cập nhật thông tin thành công!');
      fetchUsers();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Pagination Logic
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Statistics Aggregation Logic
  const statsData = useMemo(() => {
    if (!users || users.length === 0) return [];

    const dateCounts = {};

    users.forEach(user => {
      // Ưu tiên dùng dữ liệu fake như người dùng yêu cầu
      const createdAtRaw = user.user_metadata?.fakeCreatedAt || user.created_at;
      const lastSignedAtRaw = user.user_metadata?.fakeLastSignedAt || user.last_sign_in_at;

      const createdDate = createdAtRaw ? new Date(createdAtRaw) : null;
      const signedDate = lastSignedAtRaw ? new Date(lastSignedAtRaw) : null;

      if (createdDate) {
        let key = "";
        if (chartViewMode === "week") {
          key = createdDate.toLocaleDateString("vi-VN", { weekday: 'short', month: 'numeric', day: 'numeric' });
        } else {
          key = createdDate.toLocaleDateString("vi-VN", { month: 'short', year: 'numeric' });
        }
        if (!dateCounts[key]) dateCounts[key] = { name: key, newRegisters: 0, activeVisitors: 0, fullDateObj: createdDate };
        dateCounts[key].newRegisters += 1;
      }

      if (signedDate) {
        let key = "";
        if (chartViewMode === "week") {
          key = signedDate.toLocaleDateString("vi-VN", { weekday: 'short', month: 'numeric', day: 'numeric' });
        } else {
          key = signedDate.toLocaleDateString("vi-VN", { month: 'short', year: 'numeric' });
        }
        if (!dateCounts[key]) dateCounts[key] = { name: key, newRegisters: 0, activeVisitors: 0, fullDateObj: signedDate };
        dateCounts[key].activeVisitors += 1;
      }
    });

    const sortedData = Object.values(dateCounts).sort((a, b) => a.fullDateObj - b.fullDateObj);
    return sortedData;
  }, [users, chartViewMode]);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0" style={{ color: "#4B4289" }}>
          🎧 Dashboard Listener
        </h2>
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger rounded-pill px-4"
        >
          Đăng xuất
        </button>
      </div>

      {/* TABS */}
      <ul className="nav nav-pills mb-4 gap-2 border-bottom pb-3">
        <li className="nav-item">
          <button 
            className={`nav-link rounded-pill px-4 ${activeTab === 'sessions' ? 'active shadow-sm text-white' : 'bg-light text-dark'}`}
            style={activeTab === 'sessions' ? { background: "linear-gradient(135deg, #a78bfa, #7c3aed)" } : {}}
            onClick={() => setActiveTab('sessions')}
          >
            Phòng Chat Đang Chờ
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link rounded-pill px-4 ${activeTab === 'users' ? 'active shadow-sm text-white' : 'bg-light text-dark'}`}
            style={activeTab === 'users' ? { background: "linear-gradient(135deg, #a78bfa, #7c3aed)" } : {}}
            onClick={() => setActiveTab('users')}
          >
            Quản Lý Người Chia Sẻ
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link rounded-pill px-4 ${activeTab === 'stats' ? 'active shadow-sm text-white' : 'bg-light text-dark'}`}
            style={activeTab === 'stats' ? { background: "linear-gradient(135deg, #a78bfa, #7c3aed)" } : {}}
            onClick={() => setActiveTab('stats')}
          >
            📊 Thống Kê
          </button>
        </li>
      </ul>

      {/* TAB CONTENT: SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="row g-4 fade show">
          {sessions.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">
              Hiện chưa có ai cần tâm sự...
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="col-md-6 col-lg-4">
                <div
                  className="card h-100 border-0 shadow-sm transition-hover"
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
                      className="btn w-100 text-white rounded-pill mt-3 fw-medium"
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
      )}

      {/* TAB CONTENT: USERS */}
      {activeTab === 'users' && (
        <div className="fade show">
          {errorUsers && (
             <div className="alert alert-danger mb-4 shadow-sm">
               <strong>Có lỗi xảy ra:</strong> {errorUsers}
               <br/><small>Gợi ý: Kiểm tra bạn đã thêm `SUPABASE_SERVICE_ROLE_KEY` vào `.env.local` chưa.</small>
             </div>
          )}

          <div className="card shadow-sm border-0 rounded-4 p-4">
            <h5 className="mb-4 fw-bold text-secondary">Danh sách người dùng đăng ký</h5>
            {loadingUsers ? (
              <div className="text-center py-5 text-muted">Đang tải danh sách...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle border-bottom">
                  <thead className="table-light">
                    <tr>
                      <th className="py-3 px-3">Thông tin User</th>
                      <th className="py-3 px-3" style={{minWidth: "180px"}}>Ngày Tham Gia</th>
                      <th className="py-3 px-3" style={{minWidth: "180px"}}>Đăng Nhập Cuối</th>
                      <th className="py-3 px-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <UserRow 
                        key={user.id} 
                        user={user} 
                        onUpdate={handleUpdateUser} 
                        updating={updatingUser}
                      />
                    ))}
                    {users.length === 0 && !errorUsers && (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted">
                          Chưa có người dùng nào được tìm thấy.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <span className="text-muted small">Hiển thị {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, users.length)} trên tổng cộng {users.length} người dùng</span>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link rounded-start-pill" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                        ❮ Trước
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i+1} className={`page-item ${currentPage === i+1 ? 'active' : ''}`}>
                         <button 
                           className="page-link" 
                           onClick={() => setCurrentPage(i + 1)}
                           style={currentPage === i+1 ? { backgroundColor: "#7c3aed", borderColor: "#7c3aed" } : {}}
                         >
                           {i + 1}
                         </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link rounded-end-pill" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                        Sau ❯
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: STATS */}
      {activeTab === 'stats' && (
        <div className="fade show">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold text-secondary mb-0">Biểu Đồ Theo Dõi</h5>
              <select 
                className="form-select form-select-sm w-auto rounded-pill px-3 shadow-sm"
                value={chartViewMode}
                onChange={(e) => setChartViewMode(e.target.value)}
              >
                <option value="week">Xem theo Ngày</option>
                <option value="month">Xem theo Tháng</option>
              </select>
            </div>

            {loadingUsers ? (
              <div className="text-center py-5 text-muted">Đang tải dữ liệu biểu đồ...</div>
            ) : statsData.length === 0 ? (
              <div className="text-center py-5 text-muted">Chưa có đủ dữ liệu để tạo biểu đồ.</div>
            ) : (
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={statsData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#6B7280", fontSize: 13 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#6B7280", fontSize: 13 }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }}
                    />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ paddingTop: '20px' }} 
                    />
                    <Line 
                      type="monotone" 
                      name="👤 Đăng ký mới" 
                      dataKey="newRegisters" 
                      stroke="#3B82F6" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2 }} 
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      type="monotone" 
                      name="🔥 Truy cập" 
                      dataKey="activeVisitors" 
                      stroke="#8B5CF6" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, onUpdate, updating }) {
  const displayCreatedAt = user.user_metadata?.fakeCreatedAt || user.created_at;
  const displayLastSignedAt = user.user_metadata?.fakeLastSignedAt || user.last_sign_in_at;

  const [fakeCreatedAt, setFakeCreatedAt] = useState(
    displayCreatedAt ? new Date(displayCreatedAt).toISOString().slice(0, 16) : ""
  );
  const [fakeLastSignedAt, setFakeLastSignedAt] = useState(
    displayLastSignedAt ? new Date(displayLastSignedAt).toISOString().slice(0, 16) : ""
  );

  const username = user.user_metadata?.username || user.email?.split('@')[0] || "No Email";

  return (
    <tr>
      <td className="px-3">
        <div className="fw-bold" style={{ color: "#4f46e5" }}>{username}</div>
        <small className="text-muted">{user.email}</small>
      </td>
      <td className="px-3">
        <input 
          type="datetime-local" 
          className="form-control form-control-sm rounded-3 bg-light border-0 shadow-sm px-3"
          value={fakeCreatedAt}
          onChange={(e) => setFakeCreatedAt(e.target.value)}
        />
      </td>
      <td className="px-3">
        <input 
          type="datetime-local" 
          className="form-control form-control-sm rounded-3 bg-light border-0 shadow-sm px-3"
          value={fakeLastSignedAt}
          onChange={(e) => setFakeLastSignedAt(e.target.value)}
        />
      </td>
      <td className="text-center px-3">
        <button 
          className="btn btn-sm text-white rounded-pill px-4 shadow-sm transition-all text-nowrap mt-1"
          style={{ 
            background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
            opacity: updating ? 0.7 : 1
          }}
          disabled={updating}
          onClick={() => {
            const parsedCreated = fakeCreatedAt ? new Date(fakeCreatedAt).toISOString() : null;
            const parsedLastSigned = fakeLastSignedAt ? new Date(fakeLastSignedAt).toISOString() : null;
            onUpdate(user.id, parsedCreated, parsedLastSigned);
          }}
        >
          {updating ? "Lưu..." : "Cập nhật"}
        </button>
      </td>
    </tr>
  );
}
