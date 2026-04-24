# Implementation Plan - Kim's Schedule 📅

Xây dựng ứng dụng quản lý lịch làm việc thông minh, thẩm mỹ và tuân thủ quy định lao động.

## 🛠 Tech Stack
- **Framework:** Vue 3 + Vite (Hiệu suất cao, phù hợp với style của các dự án trước).
- **Styling:** Vanilla CSS + Lucide Icons (Giao diện Premium, Custom linh hoạt).
- **State Management:** Pinia (Quản lý danh sách nhân viên và lịch trình).
- **Utilities:** 
  - `date-fns`: Xử lý thời gian.
  - `html2canvas`: Xuất ảnh lịch làm việc.
  - `canvas-confetti`: Hiệu ứng khi hoàn thành bảng lịch.

## 🏗 Architecture
1. **Layout Engine:** Hệ thống Grid thông minh để hiển thị lịch 7 ngày trong tuần.
2. **Validation Logic:** Engine kiểm tra quy tắc 8-10h/ngày và 48h/tuần theo thời gian thực.
3. **Data Layer:** Lưu trữ dữ liệu nhân viên và ca làm vào LocalStorage (Offline-first).

## 📅 Phân đoạn triển khai (Phases)

### Phase 1: Foundation & Design System (Aesthetics)
- [ ] Khởi tạo dự án Vite + Vue.
- [ ] Thiết lập hệ màu HSL (Dark/Light mode) và Typography (Inter/Outfit).
- [ ] Xây dựng các Component UI cơ bản (Button, Input, Card) với hiệu ứng Hover/Active.
- [ ] Thiết kế Footer với thông tin tác giả `mtdes23`.

### Phase 2: Employee & Shift Management
- [ ] Xây dựng Module quản lý danh sách nhân viên (Thêm/Sửa/Xóa).
- [ ] Thiết lập danh mục Ca làm việc (Ví dụ: Ca 1: 08:00 - 16:00).
- [ ] Logic tính toán số giờ của mỗi ca.

### Phase 3: The Smart Scheduler Grid
- [ ] Xây dựng bảng điều khiển chính (7 ngày trong tuần).
- [ ] Tính năng chọn ca cho từng nhân viên bằng Dropdown/Context Menu.
- [ ] Hiển thị thanh tiến độ (Progress Bar) tổng giờ làm trong tuần của mỗi người.

### Phase 4: Validation & Smart Features
- [ ] Cài đặt cảnh báo khi vượt 10h/ngày hoặc 48h/tuần.
- [ ] Tính năng tự động gợi ý ngày nghỉ xen kẽ.
- [ ] Nút "Export Image" để gửi lịch cho nhân viên.

## ✅ Verification Criteria
- [ ] Không cho phép/Cảnh báo khi tổng giờ tuần > 48h.
- [ ] Ảnh xuất ra có độ phân giải cao, đầy đủ thông tin thương hiệu.
- [ ] Dữ liệu không bị mất khi F5 trình duyệt.
