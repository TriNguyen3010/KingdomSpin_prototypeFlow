# Plan: Fix Bug Bể Layout Khi Rương Ở Trạng Thái Đã Nhận Trong Flow 3

## Mục tiêu
Sửa lỗi layout của `rương` trên màn `Home` của `Flow 3` khi rương chuyển sang trạng thái `đã nhận` (`claimed`).

Kết quả mong muốn:
- Rương `claimed` vẫn nằm đúng vị trí giữa hai node.
- Việc chuyển từ `claimable -> claimed` không làm lệch node, path line, hay khoảng cách giữa các phần tử.
- Không làm hỏng các trạng thái `locked` và `claimable`.

## Hiện trạng code liên quan
Trong `renderKingdomMapNodes(...)` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1671):
- class của rương được render theo `chestStatus`
- icon của rương đổi theo state:
  - `claimable` -> `🎁`
  - `claimed` -> `✅`

Markup hiện tại:
- `class="reward-chest ${chestStatus} ..."`

State của rương:
- được xác định tại `getChestStatus(region, chestIdx)` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1647)

CSS chính:
- base position/layout của rương ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L940)
- state `claimable` ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L964)
- state `claimed` ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L982)

## Giả thuyết nguyên nhân
Bug này nhiều khả năng nằm ở vùng chuyển trạng thái `claimable -> claimed`, không phải ở data model.

Các hướng cần kiểm tra:
1. CSS state `claimed` chưa giữ đủ layout constraints của base `reward-chest`.
2. Một class bổ sung của tutorial/coachmark trong Flow 3 có thể đang ghi đè positioning khi rương vừa đổi state.
3. Trong lúc claim xong, map re-render cùng lúc với đổi target tutorial tiếp theo, dẫn tới chest bị chồng class hoặc bị ảnh hưởng bởi selector chung.
4. Transform/animation của state `claimable` có thể để lại side effect khi chest chuyển sang `claimed`.

## Phạm vi
- In scope:
  - Fix layout của chest `claimed` trên màn `Home` của `Flow 3`.
  - Audit class stack của chest khi vừa claim xong.
  - Giữ nguyên logic reward và tutorial sequence.
- Out of scope:
  - Đổi gameplay chest.
  - Đổi art/icon của chest.
  - Refactor toàn bộ hệ thống map layout.

## Hướng điều tra đề xuất
1. So sánh class thực tế của rương ở 3 trạng thái:
   - `locked`
   - `claimable`
   - `claimed`
2. Kiểm tra xem chest `claimed` trong Flow 3 có đồng thời mang các class như:
   - `flow2-target`
   - `tutorial-arrow-target`
   - class state cũ chưa được gỡ đúng
3. So sánh computed behavior giữa:
   - `position`
   - `transform`
   - `display`
   - `z-index`
   - `animation`
   - `outline`
4. Kiểm tra riêng case “claim xong ngay trong tutorial” vì đây là lúc nhiều state UI đổi cùng lúc nhất.

## Phương án fix kỹ thuật
### Phương án A: State-specific CSS guard
1. Khóa rõ layout cho `.reward-chest.claimed`:
   - giữ `position: absolute`
   - giữ `left/top/transform`
   - tắt mọi animation không cần thiết
2. Nếu có class tutorial/target còn bám vào chest `claimed`, thêm guard selector để chest `claimed` không bị ghi đè layout.

Ưu điểm:
- Ít diff
- Sửa đúng symptom nhanh

### Phương án B: Tách visual state khỏi positioning
1. Base `.reward-chest` chỉ lo positioning/layout.
2. Các state `locked/claimable/claimed` chỉ đổi:
   - màu
   - border
   - glow
   - icon feel
3. Mọi selector tutorial/arrow không được phép đụng vào positioning của chest.

Ưu điểm:
- Sạch hơn về lâu dài
Nhược điểm:
- Diff lớn hơn

MVP nên bắt đầu bằng `Phương án A`, nếu phát hiện xung đột lan rộng thì chuyển sang `Phương án B`.

## Kế hoạch triển khai
1. Reproduce và chụp đúng state `claimed`
   - vào `Flow 3`
   - claim chest đầu tiên
   - quan sát class và layout sau render

2. Audit class stack của chest
   - xác nhận selector nào đang tác động vào chest `claimed`
   - đặc biệt là class tutorial/target nếu còn bám

3. Fix CSS state `claimed`
   - thêm guard để chest `claimed` giữ nguyên positioning
   - loại bỏ animation/transform side effect nếu có

4. Retest cả 3 trạng thái
   - `locked`
   - `claimable`
   - `claimed`

5. Retest tutorial flow tiếp theo
   - sau khi claim xong, task/build step kế tiếp vẫn hiển thị đúng
   - không có layout shift sang node/chest khác

## Checklist QA
- Chest đầu tiên của `Flow 3` ở trạng thái `claimed` không bị lệch vị trí.
- Node hai bên chest không bị xô lệch.
- Path line vẫn nối đúng.
- Chest `claimable` vẫn animate/hiển thị đúng như cũ.
- Chest `locked` không bị ảnh hưởng.
- Flow 2 không bị regression layout.
