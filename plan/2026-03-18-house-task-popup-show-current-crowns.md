# Plan: Hiển Thị Crown Hiện Có Trong House Task Popup

## Mục tiêu
Thêm thông tin số `crown` user đang có ngay trong `House task popup`, để user nhìn vào popup là biết hiện tại có đủ tiền build hay chưa.

Kết quả mong muốn:
- popup có một chỗ hiển thị rõ `👑 <current crowns>`
- user không cần nhìn ngược lên top bar để so với cost
- khi crown thay đổi, popup render lại số mới ngay

## Hiện trạng code liên quan
### 1. `House task popup` hiện chỉ show progress và cost từng task
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1217), `renderFlow2TaskPanel()` đang render:
- title/subcopy của popup
- progress pill `getFlow2CastleProgressText()`
- danh sách task
- cost badge cho task active như `Cost · 👑 X`

Nhưng popup chưa có một chỗ nào show trực tiếp `state.crowns`.

### 2. Số crown hiện tại chỉ đang có ở top bar toàn cục
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2275), `renderTopBar()` update `els.crownAmount`.

Tức là:
- data đã có sẵn
- nhưng trong context của popup, user vẫn phải đảo mắt lên top bar để so với cost

### 3. Popup hiện đã có header phù hợp để nhét thêm wallet info
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1270), modal đang có:
- `flow2-task-modal-head`
- `flow2-task-modal-copy`
- close button

Và ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2593), phần header này đã là flex layout, nên rất hợp để thêm một `crown chip` mà không phải đổi cấu trúc popup quá nhiều.

## Nhận định
Đây là thiếu sót về information hierarchy, không phải bug logic:
- user đã thấy `cost`
- user đã có `Build` disabled state khi thiếu crown
- nhưng popup chưa nói rõ “bạn hiện có bao nhiêu crown”

Kết quả là quyết định build vẫn hơi mù, nhất là khi popup full-screen che bớt context xung quanh.

## Quyết định kỹ thuật đề xuất
### 1. Thêm `current crowns chip` ngay ở header hoặc panel head
Ưu tiên đặt ở một trong 2 chỗ:
- cạnh progress pill trong `flow2-task-panel-head`
- hoặc cạnh title ở `flow2-task-modal-head`

Khuyến nghị:
- đặt gần progress pill để gom toàn bộ trạng thái build vào một vùng
- format: `👑 2 Crowns` hoặc `👑 2`

### 2. Giá trị đọc trực tiếp từ `state.crowns`
Không tạo state mới.
Popup đã rerender khi crown đổi sau build/reward, nên chỉ cần render trực tiếp `state.crowns`.

### 3. Style thành chip/pill rõ ràng
Visual nên đồng bộ với progress pill hiện có:
- nền dark glass
- border sáng nhẹ
- icon crown nổi bật

## Phạm vi
### In scope
- `House task popup` của scripted flow
- thêm hiển thị `current crowns`
- style cho chip/pill crown

### Out of scope
- đổi logic cost/build
- đổi reward economy
- thay đổi top bar crown display

## Kế hoạch triển khai
1. Update `renderFlow2TaskPanel()`
   - thêm block hiển thị `state.crowns` trong head của popup

2. Thêm CSS cho crown chip
   - spacing
   - nền/border
   - typography/icon

3. Retest các trạng thái chính
   - mở popup khi đủ crown
   - mở popup khi thiếu crown
   - build xong task, crown giảm và chip update đúng
   - claim chest xong mở popup lại, crown tăng và chip update đúng

## Rủi ro / điểm cần lưu ý
1. Nếu đặt chip sai chỗ, header popup có thể bị chật trên mobile.
2. Nếu wording quá dài như `Current crowns: X`, popup sẽ bị nặng thông tin.
3. Cần đảm bảo chip này vẫn ổn khi popup ở trạng thái `guided-build` và `post-build-reveal`.

## Checklist QA
- Mở `House task popup` thấy rõ số crown hiện có.
- Cost task và số crown hiện có có thể đối chiếu ngay trong popup.
- Sau build, số crown trong popup giảm đúng.
- Sau reward từ node/chest, số crown trong popup tăng đúng.
- Mobile layout không bị vỡ khi thêm chip crown.
