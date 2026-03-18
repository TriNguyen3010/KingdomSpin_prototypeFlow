# Plan: Thu Nhỏ House Task Popup Cho Hợp Lý

## Mục tiêu
Giảm kích thước của `House task popup` để modal gọn hơn, bớt cảm giác chiếm gần hết màn hình, nhưng vẫn đủ chỗ cho:
- title/subcopy
- crown chip + progress
- danh sách task và CTA `Build`

Kết quả mong muốn:
- popup nhỏ gọn hơn trên desktop
- trên mobile không còn cảm giác “full screen gần như toàn phần”
- nội dung vẫn đọc thoải mái, không bị chật

## Hiện trạng code liên quan
### 1. Kích thước modal hiện tại đang khá lớn
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2372), `.slide-panel.flow2-task-panel-modal` hiện dùng:
- `width: min(980px, 94vw)`
- `height: min(660px, 90vh)`

Đây là kích thước rất lớn cho một task modal, đặc biệt khi nội dung hiện tại không cần nhiều không gian đến vậy.

### 2. Ở mobile modal vẫn gần như full screen
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L3564), breakpoint mobile hiện đang dùng:
- `width: 96vw`
- `height: 92vh`

Điều này khiến popup gần như chiếm trọn viewport, chỉ chừa viền rất mỏng.

### 3. Nội dung task popup hiện không yêu cầu modal quá cao
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1271), popup hiện chủ yếu có:
- header copy
- panel head với `crown chip` + progress
- list task

Trong state bình thường, số task visible không nhiều vì locked task đã bị ẩn, nên modal hiện đang lớn hơn nhu cầu thật.

### 4. Build cinematic hiện đã reuse cùng modal frame
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1337), build cinematic giờ cũng mount vào:
- `slide-panel flow2-task-panel-modal flow2-build-cinematic-modal`

Tức là nếu giảm size ở base class, cinematic cũng sẽ bị giảm theo. Đây là điểm cần xử lý rõ trong implementation.

## Nhận định nguyên nhân
Issue này là do sizing strategy của modal đang quá “an toàn” theo kiểu gần full-screen:
- desktop: gần 1000px x 660px
- mobile: 96vw x 92vh

Sau khi bỏ house summary strip khỏi `Home`, `House task popup` cũng không còn cần đóng vai trò một màn hình lớn nữa. Nó nên feel như một modal tập trung hơn là một screen takeover.

## Quyết định kỹ thuật đề xuất
### 1. Thu nhỏ base size của `flow2-task-panel-modal`
Khuyến nghị:
- desktop giảm cả width và height
- mobile giảm về khoảng gọn hơn, vẫn chừa được border quanh modal

Ví dụ hướng size:
- desktop quanh `820px` thay vì `980px`
- height quanh `560px` thay vì `660px`

### 2. Tách modifier riêng cho build cinematic nếu cần
Vì cinematic đang reuse cùng modal frame, có 2 lựa chọn:
- cho cinematic dùng chung size mới luôn
- hoặc giữ cinematic hơi lớn hơn bằng modifier `.flow2-build-cinematic-modal`

Khuyến nghị:
- chốt `task popup` là modal nhỏ hơn
- cinematic nếu cần visual room thì modifier riêng, không kéo task popup to lại

### 3. Nén nhẹ spacing bên trong task popup nếu modal nhỏ hơn
Có thể cần chỉnh nhỏ:
- padding modal
- gap giữa header và panel
- padding panel

Nhưng không nên thu quá mức nếu chưa thật sự cần.

## Phạm vi
### In scope
- size của `House task popup`
- responsive size của modal
- spacing bên trong nếu cần để khớp size mới

### Out of scope
- đổi flow build/task
- đổi content của task popup
- redesign toàn bộ popup visual language

## Kế hoạch triển khai
1. Giảm base size của `.slide-panel.flow2-task-panel-modal`
   - desktop width/height
   - mobile width/height

2. Audit `flow2-build-cinematic-modal`
   - quyết định giữ cùng size hay tách modifier riêng
   - tránh regression cho cinematic vừa mới chuyển vào cùng modal system

3. Tinh chỉnh spacing nếu cần
   - `flow2-task-modal`
   - `flow2-task-panel`
   - `flow2-task-panel-head`

4. Retest 3 trạng thái chính
   - task popup bình thường
   - guided build popup
   - post-build reveal popup

## Rủi ro / điểm cần lưu ý
1. Nếu chỉ giảm khung ngoài mà không giảm spacing bên trong, popup có thể bị chật ở mobile.
2. Nếu chỉnh base modal mà quên cinematic modifier, build cinematic cũng sẽ co theo ngoài ý muốn.
3. State post-build reveal có thể cần nhiều chiều cao hơn state thường, nên phải test riêng.

## Checklist QA
- `House task popup` nhỏ hơn rõ rệt trên desktop.
- Mobile popup không còn gần full-screen như hiện tại.
- Task list, crown chip, progress và CTA vẫn hiển thị tốt.
- Guided build và post-build reveal không bị vỡ layout.
- Build cinematic không bị regression do đang reuse cùng modal frame.
