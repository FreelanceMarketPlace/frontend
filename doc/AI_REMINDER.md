# AI Reminder — Frontend (Nhom6_11)

## Nguồn yêu cầu đã scan
- Text yêu cầu (đã trích để đọc/scan nhanh): [doc/Buổi 2 - DEV CODE.txt](doc/Bu%E1%BB%95i%202%20-%20DEV%20CODE.txt)

## Mục tiêu (từ yêu cầu)
- Xây dựng giao diện **user** và giao diện **admin** cho tối thiểu **2 chức năng**.
- Tích hợp với backend (API/form/SDK), xử lý phản hồi và hiển thị thông báo.
- Phân quyền phải thể hiện trên UI (ẩn/hiện chức năng đúng role).

## Trang bắt buộc (từ yêu cầu)
- Đăng nhập / Đăng ký.
- Trang dành cho user (ví dụ: danh sách + thao tác nghiệp vụ).
- Trang dành cho admin (ví dụ: quản lý thực thể).

## Mapping sang hệ thống Freelancer ↔ Employer (khuyến nghị để demo end-to-end)
Vì backend đang theo domain marketplace (Job/Proposal/…), có thể map “user/admin” như sau để đáp ứng yêu cầu nhanh:
- **User UI**: Freelancer/Employer (người dùng hệ thống).
- **Admin UI**: có thể là **ADMIN** thật (nếu có tài khoản) hoặc “admin panel” tối thiểu để quản lý dữ liệu (ví dụ: xem danh sách users).

Luồng demo nên bám đúng yêu cầu “tạo/sửa dữ liệu → user nhìn thấy”:
- Employer đăng nhập → tạo Job (job-service) → Freelancer mở trang danh sách Job (public) và xem được Job mới.

## Backend endpoints hiện có để FE tích hợp (hiện trạng)
Auth (user-service):
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /me` (Bearer)
- `GET /users` (Bearer) — dùng làm **admin page** tối thiểu

Job Posting (job-service):
- Public: `GET /jobs`, `GET /jobs/{jobId}`
- Employer: `POST /jobs`, `PATCH /jobs/{jobId}`, `POST /jobs/{jobId}/close`, `GET /employer/jobs`

## Quy ước Auth trên Frontend (phù hợp với backend hiện tại)
- Access token: FE gửi `Authorization: Bearer <accessToken>` khi gọi endpoint cần auth.
- Refresh token: backend dùng HttpOnly cookie → FE gọi `POST /auth/refresh` để lấy access token mới.

Khuyến nghị cho demo:
- Lưu access token trong memory (state) và *có thể* lưu `localStorage` để tiện reload (trade-off: kém an toàn hơn).
- Khi mở app: thử gọi `/auth/refresh` (cookie) để lấy access token nếu có.

## Checklist nộp bài (từ yêu cầu)
- Source code frontend (repo chung hoặc repo riêng).
- Video demo <= 5 phút:
  - Admin đăng nhập + làm tối thiểu 1 nghiệp vụ.
  - User đăng nhập + làm tối thiểu 1 nghiệp vụ.
- `screenshots.zip` chụp các màn hình chính.
