# Plan: Kingdom Slot - Mission Only + Right Panel Layout

## Mục tiêu
- Bỏ điều kiện qua node kiểu cũ (`Power/goal`), chỉ dùng `mission` để quyết định clear node.
- Chuyển `mission board` sang bên phải ở màn `kingdom-slot` để giảm chiếm diện tích phần giữa.
- Layout lại `kingdom-slot` rõ ràng hơn cho demo (desktop + mobile).

## Vấn đề hiện tại
- Đang tồn tại 2 điều kiện tiến trình: `nodeProgress/goal` và `mission`.
- Mission board đặt ở giữa dưới thanh progress làm khu vực reel bị chật.
- UI mission card còn dư thông tin trạng thái, gây rối khi demo nhanh.

## Phạm vi
- In scope:
  - Refactor logic clear node sang mission-only.
  - Loại bỏ/ẩn luồng `Power progress` trong `kingdom-slot`.
  - Bố cục 2 cột: trái là slot machine, phải là mission panel.
  - Responsive: mobile chuyển về 1 cột (slot trước, mission sau).
  - Cập nhật docs flow kingdom.
- Out of scope:
  - Persistence localStorage/server.
  - Đổi bộ mission count rule đã thống nhất (`1 / 2 / 3`).
  - Rebalance toàn bộ economy.

## Rule gameplay mới (mission-only)
1. Node clear khi **toàn bộ mission của node hiện tại đã hoàn thành** (`completed` hoặc `claimed`).
2. `wonPower` chỉ còn là chỉ số phục vụ mission type `power_accumulate`, không còn là điều kiện clear node.
3. Không dùng `curGoal/nodeProgress` để qua màn.
4. Luồng boss, unlock region/castle, chest giữ nguyên như hiện tại.

## Định hướng UI/layout
1. Tạo layout wrapper `kingdom-slot-layout`:
   - Cột trái: progress summary mission + reel + spin controls.
   - Cột phải: mission board cố định chiều rộng.
2. Desktop:
   - `grid-template-columns: minmax(0, 1fr) 360px` (hoặc gần tương đương).
3. Mobile/tablet:
   - Chuyển thành 1 cột, mission board xuống dưới reel.
4. Dọn UI mission card:
   - Giữ 1 trạng thái chính/card (tránh lặp "ACTIVE" nhiều chỗ).
   - Ưu tiên đọc nhanh: title, progress, reward, action.

## Kế hoạch triển khai
1. Refactor core condition trong `app.js`
   - Thêm helper `isCurrentNodeMissionCleared(regionIdx, nodeNum)`.
   - Trong `spinKingdomSlot()`, bỏ check clear theo `nodeProgress >= curGoal`.
   - Chuyển sang check clear theo mission sau `applyMissionProgress(...)`.
2. Loại bỏ luồng progress cũ khỏi `kingdom-slot`
   - Dừng render text/bar `x / y Power` trên màn slot.
   - Nếu cần giữ compatibility tạm thời, không dùng nó trong logic clear.
3. Layout lại render `kingdom-slot`
   - Tách HTML thành block trái/phải rõ ràng.
   - Mission board chuyển sang cột phải.
4. Update CSS
   - Thêm class layout mới cho 2 cột + responsive breakpoint.
   - Tối ưu spacing để reel area rộng hơn.
   - Giảm nhiễu visual trong mission card.
5. Update docs
   - `docs/kingdom-mode-flow.md` và `.mmd`: node clear theo mission-only.
6. Regression check nhanh
   - Spin, clear node, clear boss, unlock region/castle, claim chest.

## Checklist QA
- Node **không** clear nếu mission chưa hoàn thành dù spin nhiều lần.
- Node clear ngay khi đủ mission, không phụ thuộc `Power/goal`.
- Mission panel nằm bên phải trên desktop, không che phần reel.
- Mobile hiển thị 1 cột, không vỡ layout.
- Không regression các luồng: chest, boss clear, unlock region/castle.

