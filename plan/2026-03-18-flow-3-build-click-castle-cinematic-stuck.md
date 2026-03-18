# Plan: Fix Flow 3 Bị Kẹt Ở Màn Castle Sau Khi Bấm Build

## Mục tiêu
Sửa bug ở nhánh onboarding `Flow 3` khi player bấm `Build` trong task modal:
- flow chuyển sang màn `castle`
- nhưng animation xây dựng không chạy
- và flow bị đứng ở đó, không complete build, không reopen task modal

Kết quả mong muốn:
- sau khi bấm `Build`, castle cinematic luôn bắt đầu ổn định
- có trạng thái visual rõ ràng là đang xây
- hết animation thì build complete
- reopen lại task modal để show `task 1 done` và `task 2 unlocked`

## Hiện trạng code liên quan
### 1. Build click hiện chỉ set cờ rồi đổi màn
Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L720), `openFlow2ActiveMission()` đang:
- đóng task modal
- set `flow2.castleAutoBuildPending = state.crowns >= activeMission.cost`
- set `flow2.castleAutoBuilding = false`
- gọi `switchScreen('castle')`

Nói ngắn gọn: hành động `Build` hiện chưa tự bắt đầu cinematic ngay, mà mới chỉ đặt cờ “chờ auto-build”.

### 2. Animation hiện phụ thuộc vào callback sau render
Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L815), `maybeRunFlow2CastleAutoBuild()` chỉ chạy nếu đồng thời đúng các điều kiện:
- đang ở `state.screen === 'castle'`
- `castleAutoBuildPending === true`
- `castleAutoBuilding === false`
- còn `activeMission`
- đủ crown

Sau đó hàm mới set:
- `castleAutoBuilding = true`
- `renderScreen()`
- `setTimeout(...)` để complete build

Điểm yếu của approach này là cinematic đang phụ thuộc vào timing của render pipeline thay vì được start như một action explicit.

### 3. Visual animation chỉ hiện khi `castleAutoBuilding === true`
Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1090), `renderFlow2CastleScreen()` chỉ show progress bar và trạng thái building khi:
- `flow2.castleAutoBuilding` là `true`

Nếu cờ này không được bật đúng lúc, player chỉ thấy màn castle tĩnh.

### 4. Build complete và reopen task modal đang nằm ở nhánh sau timeout
Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L755), `performFlow2CastleMissionBuild()` đã có logic đúng cho branch mới:
- build đầu tiên của Flow 3 sẽ reopen task modal
- set step sang `flow2_castle_mission2_unlocked`

Điều đó nghĩa là phần “sau khi build xong” đã có hướng đi đúng; bug hiện tại nằm trước đó, ở chỗ cinematic không start hoặc không finish.

## Nhận định nguyên nhân gốc có khả năng cao
Với code hiện tại, bug nhiều khả năng không nằm ở `performFlow2CastleMissionBuild()`, mà ở lớp orchestration trước đó:
- `Build` click chỉ set cờ
- `renderScreen()` phải chạy đúng
- `maybeRunFlow2CastleAutoBuild()` phải được gọi đúng frame
- các cờ `pending/building/screen/step` phải còn đồng bộ

Chuỗi này quá mong manh cho một branch tutorial bắt buộc.

Triệu chứng “sang castle nhưng không anim và đứng luôn” khớp nhất với 2 khả năng:
1. `castleAutoBuildPending` không còn `true` vào lúc `maybeRunFlow2CastleAutoBuild()` check.
2. `maybeRunFlow2CastleAutoBuild()` có chạy nhưng không set được `castleAutoBuilding`, hoặc timeout complete không fire trong state mong muốn.

## Quyết định kỹ thuật đề xuất
### 1. Không để cinematic của Flow 3 phụ thuộc thuần vào `renderScreen()`
Nhánh `Flow 3 onboarding build` nên có một starter rõ ràng hơn, ví dụ:
- `startFlow3CastleBuildCinematic()`

Starter này được gọi như một action explicit sau khi player bấm `Build`, thay vì kỳ vọng render loop tự pickup state.

### 2. Tách state “pending launch” và “running” cho cinematic
Khuyến nghị thêm state rõ nghĩa, ví dụ:
- `flow3CastleCinematicPending`
- `flow3CastleCinematicRunning`

Hoặc một state tổng quát hơn:
- `scriptedBuildSequence = 'idle' | 'entering_castle' | 'building' | 'post_build_modal'`

Mục tiêu là để branch này không còn phải suy luận từ nhiều boolean rời rạc.

### 3. Dùng `switchScreen('castle')` xong mới start cinematic bằng hook rõ ràng
Hướng MVP:
- `Build` click set state “sắp chạy cinematic”
- khi màn `castle` đã mount xong, gọi starter đúng một lần
- starter bật `castleAutoBuilding = true`
- starter schedule timeout complete

Điểm quan trọng:
- có guard tránh start hai lần
- có fail-safe reset nếu player không đủ crown hoặc mission biến mất

### 4. Phải có nhánh recovery nếu cinematic không start được
Nếu vì lý do nào đó build không thể bắt đầu:
- đóng castle stuck state
- quay lại task modal hoặc hiện popup lỗi rõ ràng

Không để player bị kẹt ở màn `castle` không có action nào.

## Phạm vi
### In scope
- Bug `Build -> Castle nhưng không anim và đứng luôn` trong Flow 3 onboarding
- Trigger cinematic khi bấm `Build`
- Hoàn tất build và reopen task modal
- Guard chống stuck state

### Out of scope
- Đổi toàn bộ kiến trúc build flow của Flow 2
- Redesign castle screen
- Thay toàn bộ step machine của scripted flow

## Kế hoạch triển khai
1. Audit luồng build click hiện tại
   - trace `openFlow2ActiveMission()`
   - trace `switchScreen('castle')`
   - trace `maybeRunFlow2CastleAutoBuild()`
   - xác định chính xác cờ nào đang không tới được trạng thái expected

2. Thêm helper orchestration riêng cho Flow 3 build cinematic
   - tách khỏi logic render-driven hiện tại
   - starter chỉ chạy cho branch onboarding này

3. Điều chỉnh trigger khi bấm `Build`
   - `Build` click phải set cinematic state rõ ràng
   - đổi màn sang `castle`
   - sau khi vào `castle`, starter chạy đúng một lần

4. Bật visual building ngay khi starter chạy
   - `castleAutoBuilding = true`
   - progress bar / building note hiện ngay
   - tránh frame “castle tĩnh” trước khi animation bắt đầu

5. Hoàn tất build bằng complete handler hiện có
   - complete mission 1
   - reopen task modal
   - task 1 `Done`
   - task 2 `Active`

6. Thêm fail-safe chống stuck
   - nếu starter không thể chạy
   - hoặc timeout bị hủy giữa chừng
   - phải reset/cancel branch này một cách recoverable

7. Retest đúng nhánh lỗi
   - node clear
   - task modal tự mở
   - bấm `Build`
   - castle anim bắt đầu
   - build complete
   - task modal reopen

## Rủi ro / điểm cần lưu ý
1. Nếu chỉ vá bằng cách tăng timeout hoặc gọi `renderScreen()` thêm lần nữa, bug có thể giảm nhưng không hết vì gốc rễ là orchestration mơ hồ.
2. `switchScreen('castle')` hiện đang đi qua `closePanels()` và animation chuyển màn; nếu starter gắn sai thời điểm sẽ tạo race condition mới.
3. `performFlow2CastleMissionBuild()` đang dùng step hiện tại để quyết định branch; nếu step đổi quá sớm thì cinematic complete sẽ rơi sang nhánh sai.
4. Nếu không có guard “start đúng một lần”, player có thể bị double-build hoặc double-complete.

## Checklist QA
- Bấm `Build` trong Flow 3 task modal luôn đưa sang castle cinematic.
- Vào castle là thấy trạng thái building ngay, không có frame đứng hình kéo dài.
- Sau thời gian cinematic, build complete ổn định.
- Task modal mở lại với task 1 `Done`.
- Task 2 được unlock/reveal đúng như plan trước.
- Không còn case bị kẹt ở màn castle không có tiến triển.
- Flow 2 không bị đổi behavior build bởi fix này.
