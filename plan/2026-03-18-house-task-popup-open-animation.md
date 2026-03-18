# Plan: Thêm Animation Mở Cho House Task Popup

## Mục tiêu
Thêm animation mở cho `House task popup` để popup không xuất hiện đột ngột, mà có cảm giác mở vào mượt và rõ ràng hơn.

Kết quả mong muốn:
- popup mở có motion rõ ràng nhưng ngắn gọn
- overlay và panel vào theo cùng một nhịp
- không làm hỏng flow guided của Flow 3
- không tạo race mới với popup lifecycle hiện có

## Hiện trạng code liên quan
### 1. House task popup đang mount trực tiếp vào `universalPanel`
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1156), `renderFlow2TaskPanelOverlay()` hiện:
- set `els.universalPanel.className = 'slide-panel flow2-task-panel-modal'`
- inject HTML ngay
- remove `hidden` khỏi `overlay` và `universalPanel`

Tức là popup hiện “hiện ra ngay”, chưa có phase `enter` hay class animate riêng.

### 2. CSS của task popup hiện mới có style tĩnh
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2427), `.slide-panel.flow2-task-panel-modal` hiện chỉ có:
- size
- border
- background
- shadow

Chưa có:
- `opacity` transition riêng
- `transform` start/end state
- animation keyframes cho open

### 3. Overlay system của scripted flow đang dùng chung với panel khác
`universalPanel` và `overlay` không chỉ phục vụ task popup, nên animation thêm vào phải tránh làm side effect sang:
- universal map
- panel khác
- flow cuối popup

## Nhận định nguyên nhân / điểm thiếu hiện tại
Thiếu motion không phải bug logic, mà là vì `House task popup` đang chỉ có state:
- `hidden`
- `visible`

không có state chuyển tiếp nào cho open.

Do đó, khi mở popup:
- overlay bật ngay
- panel bật ngay
- cảm giác “pop in” bị cứng

## Quyết định kỹ thuật đề xuất
### 1. Dùng class enter riêng cho task popup
Khuyến nghị:
- thêm class kiểu `flow2-task-panel-modal enter`
- panel bắt đầu từ state nhẹ như:
  - `opacity: 0`
  - `transform: translate(-50%, -48%) scale(0.96)`
- sau một reflow / `requestAnimationFrame`, thêm class active để animate vào

### 2. Overlay fade và panel motion nên tách nhau nhẹ
Khuyến nghị:
- overlay fade in nhẹ
- panel scale + translate + opacity

Như vậy popup sẽ có cảm giác mở “có chủ đích”, không chỉ blur nền rồi nhảy panel.

### 3. Không đổi close behavior trong bước này
Ở bước MVP này chỉ nên thêm open animation.
Close animation có thể làm riêng nếu cần, vì popup lifecycle của project vừa mới được fix race condition.

## Phạm vi
### In scope
- animation mở cho `House task popup`
- scripted flow task modal đang dùng `universalPanel`

### Out of scope
- redesign popup layout
- thay animation cho popup `showRichPopup()`
- close animation phức tạp cho mọi panel

## Kế hoạch triển khai
1. Thêm class/state mở cho task popup trong `renderFlow2TaskPanelOverlay()`
   - mount panel ở initial state
   - trigger class active ở frame tiếp theo

2. Thêm CSS transition/keyframes cho `.flow2-task-panel-modal`
   - opacity
   - transform
   - optional blur/shadow easing nhẹ

3. Nếu cần, thêm class riêng cho nội dung `.flow2-task-modal`
   - để stagger nhẹ phần head và list
   - nhưng chỉ nếu không làm code quá nặng

4. Retest các case chính
   - open popup bình thường
   - open popup guided build
   - reopen popup post-build reveal
   - close popup rồi mở lại nhiều lần

## Rủi ro / điểm cần lưu ý
1. Nếu animation gắn thẳng vào `.slide-panel`, có thể ảnh hưởng panel khác dùng cùng base class.
2. Nếu thêm timer không cẩn thận, dễ tạo race với `closePanels()` hoặc `syncScriptedFlowOverlays()`.
3. Guided popup của Flow 3 đang có timing flow riêng; animation không được làm trễ logic step transition quá nhiều.

## Checklist QA
- House task popup mở có fade/slide/scale mượt.
- Popup không còn hiện đột ngột.
- Flow 3 guided task popup vẫn mở đúng timing.
- Reopen popup sau build vẫn ổn, không giật và không bị kẹt hidden/visible state.
