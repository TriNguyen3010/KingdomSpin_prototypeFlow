# Plan: Đưa Build Cinematic Vào Khung Popup Cùng Size Với House Tasks

## Mục tiêu
Đổi `build cinematic` từ full-screen cinematic panel sang một popup cùng kích thước với `House task popup`.

Kết quả mong muốn:
- khi bấm `Build`, user vẫn thấy animation xây dựng
- animation chạy trong một modal/popup có size tương tự `House task popup`
- không còn full-screen takeover
- sau khi chạy xong, flow vẫn quay lại `House task popup` reveal như hiện tại

## Hiện trạng code liên quan
### 1. Build cinematic đang dùng panel riêng full-screen
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1326), `renderFlow2BuildCinematicOverlay()` hiện mount cinematic vào:
- `slide-panel flow2-build-cinematic-panel`

Và ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2391), class này đang là:
- `width: 100vw`
- `height: 100vh`
- `border-radius: 0`
- `transform: none`

Nghĩa là cinematic đang là một full-screen surface riêng, hoàn toàn khác `House task popup`.

### 2. House task popup đã có sẵn khung modal đúng size mong muốn
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2372), `.slide-panel.flow2-task-panel-modal` đang là:
- `width: min(980px, 94vw)`
- `height: min(660px, 90vh)`
- `border-radius: 28px`

Đây chính là khung mà user đang muốn reuse cho build animation.

### 3. Logic overlay hiện đang switch giữa 2 loại panel khác nhau
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1380), `syncScriptedFlowOverlays()` đang ưu tiên:
- `buildCinematicOpen -> renderFlow2BuildCinematicOverlay()`
- `taskPanelOpen -> renderFlow2TaskPanelOverlay()`

Tức là hiện tại build cinematic và task popup đang là 2 surface tách biệt.

## Nhận định
Vấn đề không chỉ là “anim quá to”, mà là đang dùng sai presentation surface:
- `House task popup` là một modal tập trung, đúng scope
- `build cinematic` lại nhảy sang full-screen takeover

Nên dù có thu CSS nhỏ lại, nó vẫn sẽ mang feel “một màn hình khác”.

Nếu yêu cầu là “bỏ anim đó vào trong pop up bằng size như house tasks”, thì cần đổi chính container/panel type, không chỉ giảm kích thước stage.

## Quyết định kỹ thuật đề xuất
### 1. Build cinematic dùng cùng panel frame với `House task popup`
Thay vì render:
- `slide-panel flow2-build-cinematic-panel`

đề xuất render:
- một panel cùng frame/modal size như `flow2-task-panel-modal`
- bên trong chứa nội dung cinematic riêng

Có thể theo 1 trong 2 hướng:
- reuse luôn class `flow2-task-panel-modal` và thêm modifier cinematic
- hoặc tạo class `flow2-build-cinematic-modal` nhưng copy đúng kích thước/modal behavior của task popup

Khuyến nghị:
- dùng modifier trên cùng modal system để giảm divergence

### 2. Overlay background vẫn có thể khác nhẹ, nhưng không được full takeover
Không cần bỏ hoàn toàn overlay tối.
Nhưng overlay nên bám cùng modal system, không biến cinematic thành “một screen mới”.

### 3. Giữ nguyên orchestration state hiện tại
Không đổi:
- `buildCinematicOpen`
- timer `FLOW2_BUILD_CINEMATIC_MS`
- sequence `Build -> cinematic -> task reveal`

Chỉ đổi presentation layer:
- panel size
- container class
- internal layout của cinematic

## Phạm vi
### In scope
- presentation/container của `build cinematic`
- CSS modal size và layout cinematic
- sync overlay để cinematic dùng cùng modal system với task popup

### Out of scope
- đổi thời lượng 4s
- đổi logic build completion
- đổi reveal sequence sau build

## Kế hoạch triển khai
1. Refactor panel class của `renderFlow2BuildCinematicOverlay()`
   - chuyển cinematic khỏi full-screen panel
   - mount nó vào modal cùng size với task popup

2. Tạo modifier CSS cho cinematic modal
   - reuse size/radius/shadow của `flow2-task-panel-modal`
   - chỉ khác bố cục content bên trong

3. Tinh chỉnh layout nội dung cinematic trong khung nhỏ hơn
   - stage
   - art
   - badge
   - progress
   - spacing dọc

4. Retest overlay transitions
   - task popup -> cinematic modal
   - cinematic modal -> task reveal popup
   - không bị flash hoặc lệch animation open/close

## Rủi ro / điểm cần lưu ý
1. Nếu chỉ đổi class panel mà không tune layout content, cinematic sẽ bị chật hoặc vỡ trong khung popup.
2. Nếu reuse thẳng `flow2-task-panel-modal` mà không có modifier riêng, animation enter/opacity có thể ảnh hưởng task popup thường.
3. Cần tránh race giữa 2 modal states vì hiện cinematic và task popup share `universalPanel`.

## Checklist QA
- Bấm `Build` mở cinematic trong một popup cùng size với `House task popup`.
- Không còn full-screen cinematic takeover.
- Animation vẫn chạy đủ 4s.
- Xong cinematic thì quay lại `House task popup` reveal bình thường.
- Desktop và mobile đều không bị vỡ layout.
