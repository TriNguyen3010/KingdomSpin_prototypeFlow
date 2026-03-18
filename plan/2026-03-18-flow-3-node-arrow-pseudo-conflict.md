# Plan: Fix Flow 3 Node Arrow Không Hiện Do Xung Đột Pseudo-Element

## Mục tiêu
Sửa bug ở Flow 3 khu vực 1: node active đã được target đúng nhưng mũi tên hướng dẫn vẫn không hiện.

Kết quả mong muốn:
- node active ở khu vực 1 hiện mũi tên rõ ràng
- vẫn giữ được glow/ring của node current
- không phá tooltip hay các effect hiện có của node

## Hiện trạng code liên quan
### 1. HTML render đã có class `tutorial-arrow-target`
Tôi đã replay `renderKingdomMapNodes()` cho Flow 3 khu vực 1 và kết quả HTML hiện ra:
- `level-node current flow2-target tutorial-arrow-target tooltip`

Nghĩa là logic JS hiện tại đã gắn đúng class arrow lên node active.

Điểm code render nằm ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2055).

### 2. Node current đang dùng chính `::before` và `::after`
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L1075), `.level-node.current` dùng:
- `::before` cho halo nền
- `::after` cho ring pulse

### 3. Arrow system cũng đang dùng chính `::before` và `::after`
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L3183), `.tutorial-arrow-target` cũng render arrow bằng:
- `::before`
- `::after`

## Nhận định nguyên nhân gốc
Bug này không còn nằm ở logic JS nữa. Nguyên nhân gốc là **xung đột pseudo-element trên cùng một node**.

Node active hiện mang class:
- `.level-node.current`
- `.tutorial-arrow-target`

Nhưng:
- `.level-node.current::before`
- `.level-node.current::after`

đã chiếm sẵn 2 pseudo-element của phần tử đó.

Vì selector `.level-node.current` có specificity mạnh hơn `.tutorial-arrow-target`, nên pseudo-element của node current thắng, còn arrow pseudo-element không render được.

Điều này giải thích đúng hiện trạng:
- node được highlight đúng
- class arrow có mặt trong HTML
- nhưng mũi tên không xuất hiện

## Quyết định kỹ thuật đề xuất
### 1. Không render arrow trên chính `.level-node.current`
Không nên tiếp tục dùng `::before/::after` của cùng node để vẽ arrow.

Khuyến nghị:
- chuyển arrow target từ `.level-node` sang `.node-wrapper`
- hoặc thêm một child riêng để render arrow

### 2. Giữ pseudo-element của `.level-node.current` cho halo/pulse
Current node visual hiện đang đúng và đẹp.
Fix nên bảo toàn effect đó, không override nó bằng arrow.

### 3. Wrapper là host phù hợp nhất cho arrow
`renderKingdomMapNodes()` đã có:
- `<div class="node-wrapper">`

và CSS của `.node-wrapper` đã là `position: relative`.

Đây là nơi phù hợp để gắn class arrow:
- không đụng vào pseudo-element của `.level-node.current`
- không ảnh hưởng tooltip của node

## Phạm vi
### In scope
- Flow 3 region 1 node arrow
- xung đột CSS pseudo-element giữa current node và tutorial arrow

### Out of scope
- thay đổi logic progression node
- redesign halo/pulse của current node
- thay đổi arrow cho chest/build/task nếu chúng đang hoạt động đúng

## Kế hoạch triển khai
1. Di chuyển host của class arrow từ `.level-node` sang `.node-wrapper` cho node target
2. Update CSS selector arrow
   - hỗ trợ `.node-wrapper.tutorial-arrow-target`
   - canh lại vị trí arrow nếu cần
3. Giữ `flow2-target` outline trên `.level-node`
   - chỉ di chuyển arrow, không di chuyển toàn bộ highlight
4. Retest các case:
   - node 1 active ở khu vực 1
   - node 2 active ở khu vực 1
   - boss node active ở khu vực 1
   - chest/build arrow cũ vẫn đúng

## Rủi ro / điểm cần lưu ý
1. Nếu move cả highlight sang wrapper, outline có thể lệch hoặc quá to.
2. Nếu wrapper arrow không được offset đúng, arrow có thể lệch so với node/chest.
3. Cần đảm bảo chest arrow vẫn giữ `position: absolute` riêng, không bị side effect từ selector mới.

## Checklist QA
- HTML của node active có arrow host mới ở wrapper.
- Arrow hiện rõ trên node active của Flow 3 khu vực 1.
- Glow/ring của `.level-node.current` vẫn giữ nguyên.
- Tooltip của node vẫn hoạt động.
- Arrow chest/build cũ không bị regress.
