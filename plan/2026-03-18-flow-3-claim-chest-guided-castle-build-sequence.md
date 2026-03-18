# Plan: Flow 3 - Step `flow2_claim_chest_guided` Chuyển Sang Castle Build Animation Và Quay Lại Map

## Mục tiêu
Điều chỉnh sequence của `Flow 3` ở đúng step `flow2_claim_chest_guided` để:
- popup `Flow 3 task modal` vẫn là bước chuyển tiếp sau khi claim chest
- sau bước này thì tự sang màn `castle`
- ở màn `castle` chỉ diễn `animation xây dựng`, không có tương tác thủ công
- diễn xong thì quay về màn chọn node / map
- không mở lại `task modal` này sau khi build xong
- không cần `castle button` trong branch này

Kết quả mong muốn:
- tutorial Flow 3 đi mượt theo chuỗi `claim chest -> task modal -> auto sang castle build animation -> map`
- người chơi không bị kéo quay lại task modal ngay sau khi build xong
- castle screen được dùng như một màn “feedback moment”, không phải màn form/action
- branch này không phụ thuộc vào `castle button` ở top bar, map anchor, hay CTA castle riêng

## Popup cần gọi chính xác
Popup trong ảnh là `Flow 3 task modal`, render từ [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L850) và mount vào `universalPanel` tại [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L900).

Trong tutorial Flow 3, popup này xuất hiện đúng ở step:
- `flow2_claim_chest_guided`

Step này được set ngay sau khi claim chest đầu tiên ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2546).

## Hiện trạng code liên quan
### Task modal
- `renderFlow2TaskPanel()` dựng nội dung modal ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L850)
- button action trong row active hiện gọi `openFlow2ActiveMission()` tại [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L858)

### Castle open + auto-build
- `openFlow2ActiveMission()` đang đóng task modal, set cờ `castleAutoBuildPending`, rồi `switchScreen('castle')` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L695)
- `maybeRunFlow2CastleAutoBuild()` auto-build sau khi vào màn castle ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L786)
- `renderFlow2CastleScreen()` hiện mới chỉ có note trạng thái auto-build ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1043)

### Điểm đang gây sai sequence
Trong `performFlow2CastleMissionBuild()` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L729):
- sau build xong code đang set:
  - `flow2.taskNotif = !!nextMission`
  - `flow2.taskPanelOpen = !!nextMission`
  - `state.screen = 'home'`

Điều đó nghĩa là:
- nếu còn mission tiếp theo, task modal sẽ bị mở lại ngay
- sequence hiện tại kết thúc ở `home + task modal`, không phải `home map` sạch như yêu cầu mới

Ngoài ra, branch hiện tại vẫn đang phụ thuộc vào action/button để đi vào castle:
- CTA trong task modal
- `castle` entry points sẵn có như map anchor hoặc top bar button

Điều này không còn khớp với yêu cầu mới là:
- không cần `castle button` luôn
- sau task modal thì branch tự chuyển tiếp sang `castle cinematic`

## Yêu cầu nghiệp vụ mới
Yêu cầu này không áp cho toàn bộ scripted flow theo nghĩa chung. Nó là behavior đặc thù cho `Flow 3` ở đúng nhánh:
- `currentFlow === 3`
- `step === 'flow2_claim_chest_guided'`

Nói ngắn gọn:
- `flow2_claim_chest_guided` là một cinematic/tutorial branch
- branch này không nên follow behavior mặc định “build xong rồi bật task modal tiếp theo”
- branch này cũng không nên phụ thuộc vào bất kỳ `castle button` nào để tiếp tục flow

## Đề xuất kỹ thuật
### 1. Tách “tutorial cinematic build return” khỏi build flow mặc định
Khuyến nghị không hardcode behavior mới cho mọi lần build.

Thay vào đó:
- thêm một nhánh detection riêng cho:
  - `Flow 3`
  - step hiện tại là `flow2_claim_chest_guided`
- hoặc thêm helper rõ nghĩa kiểu:
  - `shouldUseFlow3CastleBuildCinematic()`

Như vậy:
- Flow 2 không bị kéo theo
- các build sau của Flow 3 cũng không tự động mang behavior sai

### 2. Task modal trong branch này chỉ là bước chuyển tiếp, không phải nơi bấm castle
Ở đúng step `flow2_claim_chest_guided`, task modal nên được hiểu là:
- một màn nhắc nhiệm vụ ngắn
- không phải nơi mở `castle` bằng button
- không giữ player ở đây để chọn tiếp

Hướng MVP:
- task modal có thể hiện rất ngắn như info card
- sau đó tự đóng và tự sang `castle`

Điểm quan trọng:
- không dùng `castle button`
- không buộc player tap vào map castle anchor
- không buộc player tap vào top bar castle button

### 3. Castle screen cần có trạng thái animation thật sự
Hiện `castleAutoBuilding` mới chỉ dùng để show note text. Với yêu cầu mới, màn castle cần được hiểu là:
- “màn trình diễn xây dựng”
- không có control
- có thời lượng đủ để người chơi nhận thức được chuyện đang build

Hướng MVP:
- dùng `castleAutoBuilding` làm cờ animation phase
- thêm visual state trên `renderFlow2CastleScreen()`:
  - stage art pulse / glow / progress / text `Building...`
- sau một timeout ngắn, hoàn tất build

### 4. Sau build xong ở branch này thì quay về map sạch
Ở nhánh cinematic này, sau build xong cần force:
- `taskPanelOpen = false`
- `taskNotif = false` hoặc ít nhất không reopen modal ngay
- `state.screen = 'home'`

Và step tiếp theo cần phản ánh rằng:
- build đầu tiên đã xong
- tutorial không còn ở chest-guided step

Khả năng cao nên chuyển sang:
- `flow2_castle_mission2_unlocked`
hoặc một step mới trung gian, tùy việc node 2 có cần khóa tiếp hay không

Nếu step `flow2_castle_mission2_unlocked` hiện đang gắn với logic reopen task modal, cần tách nghĩa của step này khỏi UI side effect.

## Phương án step/state đề xuất
### Phương án A: Giữ step cũ, đổi side effect UI
Sau khi build xong ở branch này:
- vẫn set `flow2_castle_mission2_unlocked`
- nhưng không set `taskPanelOpen = true`
- quay về `home`

Ưu điểm:
- diff nhỏ

Rủi ro:
- step name hiện tại đang hơi gợi ý rằng task tiếp theo vừa được mở ra cho người chơi thấy

### Phương án B: Tạo step mới cho cinematic completion
Ví dụ:
- `flow3_castle_build_cinematic_done`

Sau đó từ map/home mới quyết định chuyển tiếp tiếp theo.

Ưu điểm:
- semantics rõ hơn

Rủi ro:
- tăng số step phải audit

Khuyến nghị:
- MVP bắt đầu bằng `Phương án A`, miễn là dọn sạch side effect reopen task modal.

## Kế hoạch triển khai
1. Xác định nhánh tutorial đặc thù
   - detect `Flow 3 + flow2_claim_chest_guided`
   - gom vào helper rõ nghĩa

2. Bỏ dependency vào castle button ở branch này
   - branch này không đi qua top bar `castle button`
   - không đi qua map castle anchor
   - không giữ CTA `castle` riêng trong task modal nếu không cần

3. Điều chỉnh task modal thành bước chuyển tiếp
   - task modal chỉ đóng vai trò info/tutorial beat
   - sau một khoảng ngắn hoặc rule transition rõ ràng, tự sang `castle`

4. Tăng vai trò của castle screen
   - thêm visual state `building`
   - trong state này không có CTA/action nào
   - chỉ hiển thị animation/progress/building copy

5. Điều chỉnh complete handler của build
   - ở cinematic branch:
     - không reopen `task modal`
     - không bật notif kéo người chơi quay lại modal
     - quay về `home/map`
   - ở branch thường:
     - giữ behavior hiện tại

6. Rà lại tutorial step transition
   - đảm bảo sau build xong tutorial không còn ở `flow2_claim_chest_guided`
   - node/map quay lại đúng trạng thái mong muốn

7. Retest Flow 3
   - claim chest đầu tiên
   - hiện task modal
   - tự sang castle
   - xem build animation
   - quay lại map
   - xác nhận không reopen modal

8. Smoke test regression cho Flow 2 và Flow 3 build thường
   - build ngoài branch này không bị đổi sai

## Rủi ro / điểm cần lưu ý
1. `performFlow2CastleMissionBuild()` hiện đang là nơi gộp cả mutation lẫn UI side effect; sửa thiếu guard rất dễ làm đổi behavior của mọi build.
2. `flow2_castle_mission2_unlocked` hiện có thể đang được dùng như một signal để từ modal quay sang node 2, nên nếu không audit kỹ sẽ phát sinh step mismatch.
3. Nếu animation chỉ là timeout không gắn visual state rõ ràng, người chơi sẽ thấy castle screen “đứng hình” thay vì “đang xây”.
4. Nếu bỏ luôn `castle button` mà vẫn còn logic tutorial/notification bám vào button này, flow sẽ bị treo ở state cũ.
5. Tutorial arrows hiện bám vào task modal; sau khi bỏ reopen modal cần chắc rằng không còn mũi tên mồ côi hoặc state `mustBuildBeforeNextNode` treo.

## Checklist QA
- Claim chest đầu tiên của Flow 3 mở đúng `Flow 3 task modal`.
- Không cần bấm `castle button` nào để tiếp tục flow.
- Sau task modal, flow tự sang `castle`.
- Màn `castle` chỉ diễn animation build, không có tương tác build tay.
- Build xong quay về `home/map`.
- Sau khi quay về map, task modal không tự mở lại.
- Node/map state sau build đúng với tutorial mong muốn.
- Flow 2 không bị đổi sequence build theo behavior mới này.
