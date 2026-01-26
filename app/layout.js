import "./globals.css"; // 👈 Quan trọng: Import style chung và Bootstrap tại đây
import { Nunito } from "next/font/google"; // Sử dụng font Nunito cho giao diện thân thiện

// Cấu hình Font chữ
const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"], // Các độ đậm nhạt cần dùng
  display: "swap",
});

// Cấu hình SEO cơ bản (Title tab trình duyệt)
export const metadata = {
  title: "Tri Âm - Hỗ trợ tâm sự ẩn danh",
  description:
    "Nơi bạn có thể chia sẻ nỗi lòng một cách an toàn, ẩn danh và mọi ký ức sẽ được xóa bỏ khi kết thúc.",
  icons: {
    icon: "/favicon.ico", // Bạn có thể thêm icon logo vào thư mục public
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={nunito.className}>
        {/* Children chính là nội dung của page.js hoặc chat/[id]/page.js sẽ được render ở đây */}
        {children}
      </body>
    </html>
  );
}
