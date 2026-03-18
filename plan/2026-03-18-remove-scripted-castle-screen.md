# Plan: Remove Castle Screen Khỏi Scripted Flow

## Mục tiêu
Bỏ hẳn màn `castle screen` khỏi scripted flow, để user không còn bị chuyển sang một màn build riêng khi bấm task/build.

Kết quả mong muốn:
- scripted flow không còn route sang `state.screen === 'castle'`
- build task được xử lý ngay trong `House task popup` hoặc tại `Home`
- không còn dependency vào `renderFlow2CastleScreen()`
- completion flow của khu vực và toàn flow vẫn chạy đúng

## Hiện trạng code liên quan
### 1. Scripted flow vẫn còn route cứng sang `castle`
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L926), `openFlow2ActiveMission()` hiện:
- đóng task popup
- set cờ `castleAutoBuildPending`
- rồi `switchScreen('castle')`

Đây là entry chính đang đẩy user sang màn build riêng.

### 2. Build orchestration hiện đang phụ thuộc vào `state.screen === 'castle'`
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L870), `startFlow2CastleAutoBuild()` chỉ chạy khi:
- `isFlow2Active()`
- `state.screen === 'castle'`

Và ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L909), `scheduleFlow2CastleAutoBuildStart()` cũng polling đến khi màn hiện tại là `castle`.

Điều này có nghĩa:
- chỉ cần bỏ screen `castle`
- là toàn bộ auto-build starter hiện tại sẽ hỏng nếu không refactor

### 3. Renderer của scripted flow vẫn có nhánh `castle`
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2331), `renderScreen()` vẫn có:
- `state.screen === 'castle'`
- rồi gọi `renderFlow2CastleScreen(...)`

Màn này hiện đang hiển thị:
- stage visual của house
- current build task
- cost crown
- trạng thái building / thiếu crown

### 4. Các điểm UI khác vẫn assume còn tồn tại build screen
Một số chỗ liên quan:
- `getAllowedScriptedFlowScreens()` vẫn cho phép `castle`
- top bar non-scripted còn có `btn-building`
- một số step guided từng cho phép `castle` như screen hợp lệ

## Nhận định nguyên nhân / lý do nên bỏ
`Castle screen` giờ không còn cần thiết về UX:
- task popup đã chứa gần đủ thông tin task/cost/progress
- người chơi phải đổi màn chỉ để xem lại đúng task đó là dư thừa
- flow bị dài và dễ phát sinh bug orchestration do phải sync giữa popup -> castle -> popup

Việc giữ thêm một screen riêng làm tăng:
- số route
- số state trung gian
- bug timing / overlay / popup
- bug stuck ở screen chuyển tiếp

## Quyết định kỹ thuật đề xuất
### 1. House task popup trở thành build surface chính
Thay vì:
- popup -> castle screen -> build -> popup

đề xuất:
- popup -> build trực tiếp trong popup
- nếu cần animation thì animate ngay trong popup hoặc overlay riêng

### 2. Tách logic build khỏi requirement `state.screen === 'castle'`
Auto-build / manual build phải được refactor để chạy mà không cần route sang screen riêng.

Khuyến nghị:
- bỏ dependency vào `castleAutoBuildPending + screen === 'castle'`
- chuyển sang một action trực tiếp từ popup/task CTA

### 3. `renderFlow2CastleScreen()` trở thành dead code và cần được gỡ
Sau khi scripted flow không còn dùng màn này:
- renderer nhánh `state.screen === 'castle'` cho scripted mode nên được gỡ
- helper/state liên quan tới scripted castle screen cần được cleanup

## Phạm vi
### In scope
- scripted Flow 2/3
- remove screen `castle` khỏi scripted branch
- refactor build entry và completion flow liên quan

### Out of scope
- non-scripted castle slot mode
- redesign toàn bộ task system
- thay đổi economy crown/task cost

## Kế hoạch triển khai
1. Chốt UX thay thế cho build screen
   - build trực tiếp trong task popup
   - hoặc view/build trong popup với animation inline

2. Refactor `openFlow2ActiveMission()`
   - không còn `switchScreen('castle')`
   - nếu đủ crown thì build flow chạy trực tiếp
   - nếu thiếu crown thì popup chỉ hiển thị thông tin task/cost hiện tại

3. Gỡ dependency `state.screen === 'castle'`
   - thay `startFlow2CastleAutoBuild()`
   - thay `scheduleFlow2CastleAutoBuildStart()`
   - thay các guard/tutorial đang check `castle`

4. Gỡ renderer scripted `castle`
   - remove nhánh `renderFlow2CastleScreen()` khỏi scripted route
   - cleanup helper/state nếu không còn dùng

5. Retest các flow chính
   - node win -> task popup -> build task
   - thiếu crown -> xem task mà không cần screen riêng
   - build task cuối -> area complete
   - final completion flow

## Rủi ro / điểm cần lưu ý
1. Nếu bỏ screen `castle` nhưng quên refactor auto-build starter, flow build sẽ đứng ngay.
2. Một số step guided cũ đang assume `castle` là màn hợp lệ, đặc biệt ở Flow 3 onboarding.
3. Nếu move cả animation sang popup mà không tách state enter/build/reveal rõ ràng, popup logic có thể rối hơn trước.

## Checklist QA
- Bấm `Build` trong task popup không còn chuyển sang `castle screen`.
- Thiếu crown vẫn xem được task/cost trong popup.
- Build task thành công vẫn update progress, unlock task tiếp theo, và complete khu vực đúng.
- Flow 3 tutorial không còn bước nào bị kẹt vì thiếu `castle screen`.
- Không còn đường nào của scripted flow render `renderFlow2CastleScreen()`.
