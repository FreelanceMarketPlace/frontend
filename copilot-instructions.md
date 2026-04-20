# Copilot/AI Instructions — Frontend (React)

- Tham chiếu yêu cầu UI ở doc/ (đã tóm tắt trong doc/AI_REMINDER.md và doc/FRONTEND_ANALYSIS.md).
- Không commit secrets: không commit `.env`, token, cookies, credentials; chỉ commit `.env.example` (placeholder).
- Tuân thủ rule làm việc: Git Flow + Conventional Commits + PR/review (giống backend).

## Tech stack
- Vite + React + TypeScript.
- Router: `react-router-dom`.
- HTTP: `axios`.

## Cấu hình môi trường
- Frontend đọc base URL qua env (xem `app/.env.example`):
  - `VITE_USER_API_BASE_URL` (mặc định `http://localhost:8081`)
  - `VITE_JOB_API_BASE_URL` (mặc định `http://localhost:8082`)
- Luôn dùng `withCredentials: true` cho axios để refresh cookie HttpOnly hoạt động.

## Auth conventions
- Access token: lưu bằng `tokenStore` (localStorage) và gắn vào header `Authorization: Bearer <token>`.
- Refresh token: backend set cookie HttpOnly; FE không được đọc/ghi refresh token bằng JS.
- Khi gặp 401:
  - Tự gọi `POST /auth/refresh` (1 lần retry cho mỗi request).
  - Nếu refresh fail: clear access token + đưa user về `/login` (hoặc hiển thị trạng thái chưa đăng nhập).

## Quy ước cấu trúc source (trong app/src)
- `api/`: axios instances + API wrappers (không gọi axios trực tiếp trong pages).
- `auth/`: context/token store/guards.
- `components/`: layout + shared UI.
- `pages/`: route-level screens.
- `types/`: TypeScript types bám theo DTO từ backend.

## UI/Flow tối thiểu cần có (bám theo doc)
- Public: Job list + job detail (chỉ job OPEN).
- Auth: register + login + logout.
- Employer: My jobs, create job, edit job, close job.
- Admin/Supporter: users list.

## Coding rules
- Ưu tiên sửa ở “root cause” (types/DTO mismatch, auth flow) thay vì hack UI.
- Tách loading/error state rõ ràng; không nuốt lỗi silent.
- Không thêm thư viện UI lớn (MUI/Tailwind/AntD/Redux Query/…) nếu chưa thống nhất; nếu cần, đề xuất trước.

## Dev commands
- `cd app && npm install`
- `npm run dev` (dev server)
- `npm run build` (typecheck + build)
