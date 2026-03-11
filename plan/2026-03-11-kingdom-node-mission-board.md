# Plan: Kingdom Mode - Bảng Mission Cho Node

## Mục tiêu
Thêm `mission board` cho từng node trong Kingdom để người chơi có nhiệm vụ rõ ràng ngoài mục tiêu `Power`.

## Phạm vi
- In scope:
  - Data model mission theo `region + node`.
  - UI bảng mission trong màn `kingdom-slot`.
  - Logic cập nhật tiến độ mission theo kết quả spin.
  - Reward mission (coins/crowns) claim 1 lần.
  - Hook mission vào flow clear node hiện tại.
  - Cập nhật docs flow.
- Out of scope (MVP):
  - Mission theo ngày/tuần.
  - Persistence localStorage/server.
  - Mission reroll, mission chain nhiều bước.

## Thiết kế rule mission (MVP)
1. Mỗi node có danh sách mission cố định khi bắt đầu node.
2. Mission dạng `counter` (ví dụ):
   - Tích lũy `Power`.
   - Spin số lần tối thiểu.
   - Thắng `N` coins từ kingdom slot.
3. Mission có trạng thái: `locked -> active -> completed -> claimed`.
4. Mission chuyển `active` khi node là node hiện tại.
5. Node clear không bị chặn bởi mission (mission là bonus), tránh phá game loop hiện tại.
6. Reward mission claim 1 lần, không reset sau khi claim.

## Rule số lượng mission theo region (demo)
1. `Home` (region đầu): mỗi node chỉ có `1 mission`.
2. Region kế (`Forest`): mỗi node có `2 mission`.
3. Các region còn lại (`Desert`, `Snow`, `Volcano`): mỗi node có `3 mission`.

## Rule độ khó mission (demo-friendly)
1. Mục tiêu phải hoàn thành nhanh trong vài spin, ưu tiên trải nghiệm "qua được ngay".
2. Target gợi ý:
   - `power_accumulate`: `4-8`.
   - `spin_count`: `2-4`.
   - `coin_win`: `600-1800`.
3. Không dùng mission gây chặn tiến trình (ví dụ yêu cầu chuỗi thắng, điều kiện hiếm).
4. Boss node vẫn dùng mission dễ, chỉ tăng nhẹ số target so với node thường.

## Đề xuất data model
Trong `state.regions[regionIdx]` thêm:
- `nodeMissions`: map theo `nodeNum`.
- Mỗi mission item:
  - `id`, `title`, `type`, `target`, `progress`, `status`, `reward`.

Helper mới trong `app.js`:
- `createNodeMissions(regionIdx, nodeNum)`
- `ensureNodeMissions(regionIdx, nodeNum)`
- `applyMissionProgress(regionIdx, nodeNum, spinResult)`
- `claimNodeMission(regionIdx, nodeNum, missionId)`
- `getMissionCountByRegion(regionIdx)` (1 / 2 / 3 mission theo rule demo)

## Kế hoạch triển khai
1. State & khởi tạo mission
   - Thêm cấu trúc mission vào region state.
   - Khởi tạo lazy theo node để giảm dữ liệu ban đầu.
2. Mission engine (logic cập nhật)
   - Áp rule số lượng mission theo region: 1 -> 2 -> 3.
   - Áp profile target dễ cho demo, tránh mission tốn thời gian.
   - Chuẩn hóa payload spin result (`wonPower`, `wonCoins`, `spinCount`).
   - Cập nhật progress mission sau mỗi spin.
   - Auto đổi trạng thái `completed` khi đủ target.
3. UI mission board ở `kingdom-slot`
   - Render danh sách mission dưới progress bar.
   - Hiển thị trạng thái + progress + reward.
   - Thêm nút `Claim` cho mission `completed`.
4. Claim reward & feedback
   - Cộng `coins/crowns`, đánh dấu `claimed`.
   - Gọi `renderTopBar()`, `renderScreen()`, toast/floating reward.
5. Đồng bộ flow node clear
   - Đảm bảo node clear vẫn chạy như cũ.
   - Mission chưa claim vẫn giữ được trạng thái khi rời màn.
6. Cập nhật docs
   - Bổ sung mission board vào `docs/kingdom-mode-flow.md` và `.mmd`.

## Checklist QA
- Node mới vào có mission đúng theo cấu hình.
- Số lượng mission theo region đúng rule `1 / 2 / 3`.
- Region đầu hoàn thành mission trong rất ít spin (demo nhanh).
- Spin cập nhật progress mission chính xác theo từng loại mission.
- Mission đủ điều kiện chuyển `completed` và claim được đúng 1 lần.
- Reward mission cộng đúng vào top bar.
- Không làm thay đổi logic clear node, boss clear, unlock region/castle, chest.
- UI mission board hiển thị tốt ở desktop và mobile.
