# Plan: Flow 3 - Node Win Tự Mở Task Modal, Manual Build, Sau Build Reopen Modal Để Reveal Task 2

## Mục tiêu
Điều chỉnh `Flow 3` ở nhánh tutorial đầu để sequence chạy như sau:
- sau khi thắng node, player nhận `+1 crown`
- ngay sau đó tự mở `Flow 3 task modal`
- trong popup này, player phải tự bấm `Build`
- sau khi bấm `Build`, flow chuyển sang màn `castle` để diễn animation xây dựng, không có tương tác build ở castle
- build xong thì mở lại `task modal`
- modal này phải thể hiện rõ:
  - task 1 đã hoàn thành
  - task 2 vừa được mở ra
- flow dừng ở đó để player tự bấm tắt modal

Kết quả mong muốn:
- onboarding của `Flow 3` có cảm giác “player chủ động bắt đầu build”, thay vì auto-build
- castle screen chỉ là màn feedback/cinematic cho build
- task modal sau build đóng vai trò xác nhận tiến độ, không bị auto đóng
- không cần `castle button` riêng ở top bar hay map để tiếp tục nhánh này

## Ghi chú về plan cũ
Plan này thay thế intent của plan auto-build trước đó cho đúng nhánh:
- [2026-03-18-flow-3-claim-chest-guided-castle-build-sequence.md](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/plan/2026-03-18-flow-3-claim-chest-guided-castle-build-sequence.md)

Plan cũ mô tả `task modal -> auto sang castle -> quay về map`.
Plan mới đổi sang:
- `node win -> +1 crown -> auto open task modal -> user bấm Build -> castle animation -> reopen task modal -> reveal task 2`

## Hiện trạng code liên quan
### 1. Reward `+1 crown` sau khi thắng node
Logic này đã có sẵn trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2874):
- khi clear node, code đang `state.crowns += 1`
- popup node cleared cũng đang copy là `+1 Crown earned.`

Plan này xem đây là behavior cần giữ nguyên và verify lại, không phải phần cần phát minh mới.

### 2. Entry point hiện tại của task modal vẫn đang đi qua claim chest
Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2611), sau khi claim chest:
- `flow2.taskPanelOpen = true`
- `flow2.mustBuildBeforeNextNode = true`
- `setFlow2Step('flow2_claim_chest_guided')`

Điều này không còn khớp với yêu cầu mới, vì task modal phải mở ngay sau `node win`, không phải sau `claim chest`.

### 3. Task modal guided hiện đang auto-advance
Hiện code đang đi ngược yêu cầu mới ở 2 điểm:
- helper `maybeRunFlow3ClaimChestGuidedTaskAdvance()` tại [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L801) tự mở mission sau timeout
- `renderFlow2TaskPanel()` tại [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L898) đang render pill `Starting...` thay vì nút `Build`

### 4. Build complete hiện không reopen task modal
Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L739), branch `isFlow3ClaimChestGuidedStep()` đang:
- build xong thì về `home`
- set step sang `flow2_node2_ready`
- không mở lại task modal

Điều này đang ngược với yêu cầu mới là phải reopen task modal để show task 1 complete và task 2 unlocked.

## Quyết định sản phẩm
1. `+1 crown` sau khi thắng node là mandatory reward của Flow 3
   - giữ behavior hiện tại
   - QA phải verify lại đúng lúc clear node đầu tiên

2. Ngay sau khi clear node đầu tiên, flow phải:
   - cộng `+1 crown`
   - tự mở `Flow 3 task modal`
   - đưa tutorial vào step build-guided tương ứng

3. Trong task modal guided, modal phải là nơi player bấm `Build`
   - không auto-advance từ modal
   - không auto-start nếu player chưa tap

4. Sau khi player bấm `Build`, castle screen là màn cinematic
   - không có nút `Build` trong castle
   - không yêu cầu bấm thêm `castle button`
   - chỉ diễn animation xây dựng và complete mission

5. Build xong phải reopen lại `Flow 3 task modal`
   - modal này là post-build state
   - task 1 hiện `Done`
   - task 2 hiện `Active/Unlocked`
   - không auto-close
   - player tự bấm `X` để đóng

6. Claim chest không còn là điều kiện để bật task modal đầu tiên trong branch này
   - chest vẫn có thể tồn tại như reward layer riêng
   - nhưng không phải trigger của onboarding build

7. Chỉ sau khi player đóng modal post-build thì flow mới quay về map sạch
   - có thể tiếp tục dùng semantics hiện có của `flow2_castle_mission2_unlocked`
   - nhưng side effect phải dừng ở modal, không nhảy thẳng `flow2_node2_ready` trước khi user đóng

## Sequence mục tiêu
1. Player clear node 1
   - nhận `+1 crown`
   - tự mở `Flow 3 task modal`
   - flow vào step build-guided tương ứng

2. Trong task modal
   - row `Build castle` là task active
   - có nút `Build`
   - player chủ động bấm nút này

3. Sau khi bấm `Build`
   - đóng task modal
   - chuyển sang `castle`
   - tự chạy build animation/cinematic
   - không cần thêm click ở castle

4. Khi build hoàn tất
   - trừ crown cost
   - task 1 chuyển `Done`
   - task 2 chuyển `Active`
   - quay lại overlay task modal

5. Modal sau build
   - có thể dùng motion ngắn để nhấn mạnh `task 1 completed`
   - sau đó reveal `task 2`
   - dừng ở trạng thái modal đang mở
   - player tự bấm `X` để đóng

6. Sau khi player đóng modal
   - quay về map/home
   - flow tiếp tục từ state sau build đầu tiên

## Đề xuất kỹ thuật
### 1. Dời trigger mở task modal từ claim chest sang node win
Hiện trigger đang nằm ở flow claim chest, nên cần dời sang nhánh node completion của `Flow 3`.

Hướng MVP:
- ngay sau khi cộng `+1 crown` từ node clear, mở luôn `taskPanelOpen`
- set step tutorial tương ứng cho build-guided
- bảo đảm popup `node cleared` và task modal không đè UI lên nhau theo cách gây rối

### 2. Bỏ auto-advance của guided task modal
Nhánh guided này không nên dùng:
- `maybeRunFlow3ClaimChestGuidedTaskAdvance()`
- `taskModalAutoAdvanceScheduled`

Hướng MVP:
- giữ helper/state nếu muốn tái sử dụng sau này
- nhưng disable hoàn toàn trong branch manual-build này

### 3. Trả lại CTA `Build` trong task modal guided
`renderFlow2TaskPanel()` cần đổi lại:
- không render `Starting...`
- render `Build`
- tutorial arrow nếu còn cần thì neo vào đúng button này

### 4. Castle screen vẫn là auto-building cinematic sau khi user đã quyết định
Sau khi bấm `Build` trong modal:
- có thể tiếp tục dùng `openFlow2ActiveMission()`
- có thể tiếp tục dùng `castleAutoBuildPending` + `maybeRunFlow2CastleAutoBuild()`

Nhưng semantics phải là:
- auto-build chỉ bắt đầu sau hành động explicit của user ở task modal
- không phải auto-build ngay khi modal vừa mở

### 5. Tách “post-build task reveal” khỏi nhánh quay thẳng về map
`performFlow2CastleMissionBuild()` cần nhánh riêng cho:
- `currentFlow === 3`
- build xong mission `build_castle`
- mission tiếp theo là `build_fountain`

Ở nhánh này:
- không set thẳng `flow2_node2_ready`
- phải set state để reopen task modal
- step có thể là `flow2_castle_mission2_unlocked`

### 6. Cần thêm state ngắn hạn cho animation trong task modal sau build
Khuyến nghị thêm cờ rõ nghĩa, ví dụ:
- `taskModalRevealPhase`
- hoặc `taskModalIntroAnimation`

Mục đích:
- lần mở modal sau build có animation “task 1 complete -> task 2 reveal”
- lần mở modal từ claim chest vẫn là state thường

Nếu không tách cờ này, UI sẽ khó phân biệt:
- modal guided trước build
- modal post-build confirm progress

### 7. Chest flow cần được nới khỏi onboarding build trigger
Nếu chest vẫn tồn tại sau node clear, cần bảo đảm:
- chest không tự mở task modal lần nữa
- claim chest không reset step guided đang chạy
- chest reward vẫn cộng bình thường nếu player claim sau đó

### 8. Close behavior phải lùi step transition về lúc user đóng modal
Hiện `closePanels()` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2498) đã có logic:
- nếu step là `flow2_castle_mission2_unlocked` thì đóng modal sẽ chuyển sang `flow2_node2_ready`

Plan này giữ hướng đó, nhưng cần bảo đảm:
- step `flow2_castle_mission2_unlocked` chỉ được set sau khi build xong và modal đã reopen
- trước lúc user bấm đóng, flow chưa tự nhảy sang map state kế tiếp

## Phạm vi
### In scope
- Reward `+1 crown` sau khi clear node ở Flow 3 tutorial
- Auto open task modal ngay sau node win ở Flow 3 tutorial
- Castle build cinematic sau khi user bấm `Build`
- Reopen task modal sau build để reveal task 2
- Close behavior sau modal post-build

### Out of scope
- Đổi sequence build của Flow 2
- Đổi build flow thường của các mission về sau nếu không thuộc branch này
- Thiết kế lại toàn bộ castle screen
- Thêm mechanic crown mới ngoài `+1 crown` node reward hiện có

## Kế hoạch triển khai
1. Khóa lại intent branch này
   - xác định helper guard cho `Flow 3 + node win build onboarding`
   - xác định helper guard cho `post-build reveal`

2. Dời trigger task modal sang node win
   - mở task modal ngay sau khi clear node
   - giữ reward `+1 crown`
   - tránh trùng/đè với popup node clear hiện có

3. Gỡ auto-advance ở task modal guided
   - disable `maybeRunFlow3ClaimChestGuidedTaskAdvance()`
   - bỏ copy `Starting automatically`
   - trả lại CTA `Build`

4. Giữ castle là cinematic sau action của user
   - sau khi bấm `Build`, mở `castle`
   - auto-run build animation tại castle
   - không thêm action button ở castle

5. Đổi complete handler của build đầu tiên
   - build xong thì reopen task modal
   - set task 1 `Done`
   - set task 2 `Active`
   - set step/status tương ứng cho modal post-build

6. Thêm animation state cho modal post-build
   - animate complete task 1
   - animate reveal task 2
   - sau animation thì đứng yên, chờ user đóng

7. Rà lại close behavior
   - khi user đóng modal post-build, mới chuyển về map state tiếp theo
   - không reopen modal ngay sau khi vừa đóng

8. Retest Flow 3 branch đầu
   - win node 1
   - thấy task modal tự mở ngay
   - bấm `Build`
   - xem castle animation
   - thấy modal reopen với task 1 complete, task 2 unlock
   - tự đóng modal

9. Smoke test regression
   - Flow 2 không bị manual-build theo nhánh này
   - claim chest của Flow 3 không vô tình mở lại guided modal sai lúc
   - các build khác của Flow 3 không bị inherit sai animation/modal logic

## Rủi ro / điểm cần lưu ý
1. `performFlow2CastleMissionBuild()` đang gộp mutation gameplay và side effect UI, nên guard không chặt sẽ làm Flow 2 đổi behavior theo.
2. Trigger task modal đang nằm ở `claimChest(...)`, nên khi dời sang node win cần tránh mở modal hai lần.
3. `taskModalAutoAdvanceScheduled` đang được reset ở vài chỗ khác nhau; nếu chỉ tắt một nửa logic thì có thể phát sinh trạng thái treo.
4. Nếu reopen modal sau build nhưng không có cờ phân biệt `post-build reveal`, UI sẽ không biết lúc nào cần diễn animation complete/unlock.
5. `mustBuildBeforeNextNode` cần được cập nhật đúng thời điểm; nếu hạ cờ quá sớm hoặc quá muộn, map có thể cho bấm node sai lúc.
6. Nếu close handler vẫn ép step transition quá sớm, user sẽ thấy modal chưa kịp đóng xong mà state map đã đổi.

## Checklist QA
- Sau khi clear node 1, player nhận đúng `+1 crown`.
- Sau khi clear node 1, `Flow 3 task modal` tự mở ngay.
- Task modal guided có nút `Build`, không auto chạy khi chưa bấm.
- Bấm `Build` sẽ sang castle cinematic mà không cần thêm click.
- Castle screen không có CTA build tay trong branch này.
- Build xong modal mở lại với task 1 là `Done`.
- Task 2 được reveal/unlock trong modal sau build.
- Modal sau build không tự đóng.
- User bấm `X` mới đóng modal và quay lại map.
- Claim chest sau đó không làm bật lại guided modal sai lúc.
- Flow 2 không bị ảnh hưởng bởi sequence mới này.
