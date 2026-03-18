# Plan: Scripted Build Cinematic Và Task Reveal

## Mục tiêu
Đổi flow build của scripted Flow 3 theo sequence mới:

- user bấm `Build` trong `House task popup`
- hiện một màn hình mới chỉ để diễn `build cinematic` khoảng `4s`
- màn đó không có tương tác, tự đóng sau khi diễn xong
- tự quay lại `House task popup`
- task vừa hoàn thành sẽ diễn anim biến mất
- task mới được unlock sẽ hiện ra
- các task còn `locked` thì không hiển thị

Kết quả mong muốn:
- user vẫn có cảm giác “đi sang màn build” riêng
- nhưng flow không quay lại `castle screen` cũ
- popup task sau build cho cảm giác progression rõ ràng hơn

## Hiện trạng code liên quan
### 1. Build hiện đang chạy ngay trong task popup
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L954), `startFlow2ActiveMissionBuild()` hiện:
- set `castleAutoBuildPending = true`
- giữ `state.screen = 'home'`
- re-render task popup

Sau đó [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L874), `startFlow2CastleAutoBuild()` sẽ:
- chuyển popup sang trạng thái `Building...`
- chờ timeout ngắn
- gọi `performFlow2CastleMissionBuild(false)`

Tức là lúc này build đang được “diễn” ngay trong popup, không có màn cinematic riêng.

### 2. Task popup hiện vẫn render full list task, gồm cả task locked
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1123), `renderFlow2TaskPanel()` đang map qua toàn bộ `getFlow2CastleMissions()` và render:
- `done`
- `active`
- `locked`

Điều này không khớp spec mới là:
- task complete phải biến mất sau anim
- task locked không được show

### 3. Reveal hiện tại mới chỉ là biến thể CSS trên chính popup
Task popup đã có nhánh `post-build-reveal` ở:
- [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1128)
- [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2613)

Nhưng nhánh này mới là:
- row `done` pulse
- row `active` fade in

Nó chưa có:
- completed row animate out rồi biến mất
- locked rows bị ẩn hoàn toàn
- một màn build cinematic riêng trước khi quay lại popup

## Quyết định kỹ thuật đề xuất
### 1. Thêm một `build cinematic overlay/screen` riêng cho scripted flow
Không revive lại `castle screen` cũ.

Khuyến nghị:
- thêm state kiểu `flow2.buildCinematicOpen`
- thêm metadata như:
  - `flow2.buildCinematicMissionId`
  - `flow2.buildCinematicStartedAt`
  - `flow2.pendingMissionRevealId`
- render một full-screen overlay/screen riêng chỉ cho cinematic build

Màn này nên:
- che toàn bộ gameplay phía sau
- không có nút đóng/back
- có art house hiện tại + progress/FX build
- tự complete sau khoảng `4000ms`

### 2. Tách flow build thành 3 phase rõ ràng
Nên tách state build thành:

1. `task_modal_ready`
2. `build_cinematic_playing`
3. `task_modal_reveal`

Không nên reuse một cặp cờ `castleAutoBuildPending / castleAutoBuilding` cho cả 3 phase như hiện tại, vì dễ rối và khó animate đúng nhịp.

### 3. Reopen task popup bằng dữ liệu reveal riêng
Sau khi cinematic complete:
- mark mission hiện tại là `DONE`
- unlock mission kế tiếp nếu có
- mở lại task popup ở mode reveal

Ở mode này:
- chỉ show task vừa xong và task mới unlock
- task vừa xong animate out rồi remove khỏi DOM
- task mới animate vào
- mọi task còn `locked` không render

### 4. “Done task biến mất” nên là state-driven, không chỉ CSS-only
Nếu chỉ animate bằng CSS trên danh sách hiện tại, row `done` vẫn còn trong DOM và rất dễ bị render lại ở frame tiếp theo.

Khuyến nghị:
- thêm helper `getVisibleFlow2TaskRows({ revealMode })`
- trong reveal mode chỉ trả về:
  - completed mission vừa xong
  - active mission mới unlock
- sau khi anim done kết thúc, popup trở về trạng thái normal và chỉ show active mission hiện tại

## Phạm vi
### In scope
- scripted Flow 3 build flow
- build cinematic overlay/screen mới
- post-build task reveal sequence
- ẩn task `locked`
- auto close cinematic rồi quay lại task popup

### Out of scope
- non-scripted castle/building mode
- redesign economy crown
- thay đổi node/chest reward loop

## Kế hoạch triển khai
1. Thêm state cho build cinematic
   - flag mở/đóng cinematic
   - mission đang build
   - state reveal sau build

2. Đổi `startFlow2ActiveMissionBuild()`
   - không complete mission ngay
   - chuyển sang `build cinematic`
   - mount một màn full-screen riêng

3. Tạo renderer cho build cinematic
   - full-screen
   - non-interactive
   - auto close sau `~4000ms`
   - khi complete thì gọi build completion handler

4. Refactor `performFlow2CastleMissionBuild()`
   - tách phần mutate data mission khỏi phần render popup
   - sau build xong mở task popup ở `reveal mode`

5. Refactor `renderFlow2TaskPanel()`
   - thêm logic visible rows
   - mode thường: show active task hiện tại, có thể kèm done summary nếu cần
   - mode reveal: show completed row + newly unlocked row
   - không render `locked` rows

6. Thêm animation cho task reveal
   - completed row animate out
   - unlocked row animate in
   - sau anim cleanup state reveal để popup trở về steady state

7. QA lại các sequence
   - build task đầu tiên ở Flow 3
   - build task giữa khu vực
   - build task cuối house
   - build task cuối vùng cuối cùng

## Rủi ro / điểm cần lưu ý
1. Nếu cinematic overlay và task popup cùng dùng `overlay/universalPanel` mà không tách phase rõ, rất dễ bị race condition kiểu popup cũ đè popup mới.
2. Nếu completed row bị remove khỏi data quá sớm, user sẽ không thấy anim “biến mất”.
3. Nếu locked task chỉ `display:none` bằng CSS nhưng vẫn render trong DOM, logic reveal sẽ khó kiểm soát hơn về timing.
4. Task build cuối cùng của house có thể nhảy thẳng sang `Area Complete`; cần chèn reveal đúng thứ tự trước khi popup complete khu vực xuất hiện.

## Checklist QA
- Bấm `Build` mở một màn cinematic riêng, không còn build ngay trong popup.
- Màn cinematic tự đóng sau khoảng 4 giây, không cần user bấm.
- Quay lại task popup đúng mission vừa build.
- Task vừa xong có anim biến mất.
- Task mới unlock có anim xuất hiện.
- Task đang `locked` không hiển thị trong popup.
- Build task cuối của house không làm vỡ flow `Area Complete`.
