# Plan: Kingdom Slot - Khoá Nút Spin Khi Đủ Mission

## Mục tiêu
Khoá nút `SPIN` ngay khi node hiện tại đã đủ mission để qua màn, tránh người chơi spin dư.

## Phạm vi
- In scope:
  - Disable nút `SPIN` theo trạng thái mission hiện tại.
  - Chặn gọi `spinKingdomSlot()` trực tiếp khi đã đủ mission.
  - Không re-enable nút sau `finally` nếu node đã sẵn sàng clear.
- Out of scope:
  - Thay đổi rule clear node (vẫn mission-only).
  - Thay đổi reward hoặc mission targets.

## Rule
1. Nếu `isCurrentNodeMissionCleared(...) === true` thì `SPIN` phải bị khoá.
2. `SPIN` cũng bị khoá khi `regionCleared` hoặc đang `kingdomSpinBusy`.
3. UI có thể hiển thị label `READY` thay vì `SPIN` khi khoá do đủ mission.
4. Backend guard trong `spinKingdomSlot()` bắt buộc có để tránh trigger từ console/click race.

## Kế hoạch triển khai
1. Tính cờ `nodeMissionCleared` trong render `kingdom-slot`.
2. Gộp cờ disable thành `spinDisabled = regionCleared || kingdomSpinBusy || nodeMissionCleared`.
3. Cập nhật label nút theo trạng thái (`CLEARED/READY/SPIN`).
4. Thêm guard đầu hàm `spinKingdomSlot()` nếu đã đủ mission.
5. Cập nhật `finally` để chỉ bật lại nút khi node vẫn chưa đủ mission.

## Checklist QA
- Hoàn thành đủ mission thì nút `SPIN` chuyển disabled ngay (không cần đổi màn).
- Không thể spin thêm bằng click nhanh liên tiếp sau khi mission vừa đủ.
- Không thể spin thêm bằng gọi thủ công `spinKingdomSlot()` từ console.
- Sau khi clear node và sang node mới, nút `SPIN` hoạt động lại bình thường.

