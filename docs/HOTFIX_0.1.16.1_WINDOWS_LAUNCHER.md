# MeMeMe MVP 0.1.16.1 — Windows Launcher Hotfix

## Vấn đề

Artifact 0.1.16 là web build. Nếu tester double-click `index.html`, browser mở bằng `file:///C:/...` và có thể chặn ES module/local asset. Kết quả nhìn thấy là màn hình trắng dù production build không crash trong CI.

## Hotfix

Package giờ có hai file mới trong root artifact:

- `START_PLAYTEST.bat` — launcher tester chỉ cần double-click;
- `serve-playtest.ps1` — local static server dependency-free dùng Windows PowerShell + `.NET TcpListener`.

Launcher:
1. phục vụ chính thư mục artifact qua `127.0.0.1`;
2. ưu tiên port `4173`, tự thử tới `4183` nếu port đang bận;
3. tự mở URL localhost trong browser mặc định;
4. giữ terminal mở làm server cho tới khi tester nhấn `Ctrl+C`.

Không cần cài Node/Python cho cách chạy mặc định trên Windows.

## Package gate

`scripts/verify-playtest-package.mjs` giờ kiểm tra thêm:

- `dist/START_PLAYTEST.bat` tồn tại;
- `dist/serve-playtest.ps1` tồn tại;
- quickstart chỉ tester sang launcher;
- quickstart cảnh báo `file:///`;
- launcher gọi PowerShell server;
- server có `TcpListener` và tự mở browser.

Gameplay/network/rule không thay đổi trong hotfix này.
