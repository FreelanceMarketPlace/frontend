# Frontend Analysis — UI flow & screens (based on doc/Buổi 2 - DEV CODE)

Tài liệu yêu cầu chỉ định **phải có UI user + UI admin**, tích hợp backend, và demo end-to-end.

## 1) Chọn “2 chức năng” để làm (đủ yêu cầu + bám backend hiện có)
Khuyến nghị triển khai đúng luồng và dễ demo nhất:

### Function A — Authentication (User)
- Screens:
  - Register
  - Login
  - (Optional) Profile `/me`
- Backend: user-service `/auth/*`, `/me`
- Criteria:
  - Form validation + error mapping
  - Sau login: lưu access token và điều hướng

### Function B — Job Posting (Employer → User thấy)
- Screens (Employer):
  - Employer Dashboard: “My Jobs” (list)
  - Create Job
  - Edit Job (chỉ khi job OPEN)
  - Close Job
- Screens (User/public):
  - Job List (public, filter/search)
  - Job Detail
- Backend: job-service `/jobs`, `/employer/jobs`

### Admin screen (bắt buộc theo yêu cầu)
Do backend hiện tại chưa có đầy đủ Admin Dashboard, MVP nên làm:
- Admin: “Users Management (read-only)”
  - List users (`GET /users`) và hiển thị role/status
  - UI gating: chỉ hiện menu nếu role=ADMIN (hoặc SUPPORTER) trong JWT claim `role`

## 2) Luồng demo đề xuất (đáp ứng yêu cầu bài)
1) Employer đăng nhập.
2) Employer tạo job (POST /jobs).
3) Freelancer hoặc public mở Job List (GET /jobs) thấy job mới.
4) Admin đăng nhập và mở trang Admin Users (GET /users) để chứng minh phân quyền UI.

## 3) Routing tối thiểu (gợi ý)
- `/login`, `/register`
- `/jobs` (public)
- `/jobs/:id` (public)
- `/employer/jobs` (employer)
- `/employer/jobs/new` (employer)
- `/employer/jobs/:id/edit` (employer)
- `/admin/users` (admin)

## 4) Phân quyền hiển thị UI (must-have)
- Nếu chưa login: chỉ thấy public pages.
- Nếu role=EMPLOYER: thấy Employer menu.
- Nếu role=ADMIN/SUPPORTER: thấy Admin menu.

## 5) Tích hợp API (must-have)
- Tạo 1 API client dùng base URL theo env.
- Khi gọi endpoint protected: tự attach `Authorization: Bearer ...`.
- Khi 401: thử refresh (`POST /auth/refresh`) rồi retry 1 lần.

## 6) Error/Success UX (must-have)
- Form errors: hiển thị field-level (validation) + toast/snackbar cho lỗi chung.
- Success: redirect hợp lý (vd tạo job xong → về My Jobs hoặc Job Detail).

## 7) Deliverables
- Source + video demo + screenshots.zip đúng yêu cầu tài liệu.
