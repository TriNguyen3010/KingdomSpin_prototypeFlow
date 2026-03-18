# Plan: Flow 3 Boss Clear Task Button Arrow Guidance

## Mục tiêu
Khi user clear xong `boss node` nhưng `house` của khu vực hiện tại vẫn chưa build xong, UI phải chỉ rõ bước tiếp theo bằng cách show mũi tên vào nút `Tasks` ở top bar.

Kết quả mong muốn:
- sau `boss clear -> Continue`, nếu region đã clear nhưng house chưa complete thì user quay về `Home`
- top bar có mũi tên chỉ vào nút `Tasks`
- user bấm `Tasks` để vào `House task popup`
- không còn trạng thái “đứng hình, không biết làm gì tiếp theo”

## Hiện trạng code liên quan
### 1. Sau boss clear, flow đã dẫn sang nhánh build house nhưng chỉ bằng state
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L817), `handleFlow2NodeClearContinue()` đang có nhánh:
- nếu `isRegionCleared(curRegion) && !isFlow2CastleCompleted()`
- thì gọi `guideFlow2ToHouseCompletion()`

Tức là flow logic đã biết đây là bước “phải đi build house tiếp”.

### 2. `guideFlow2ToHouseCompletion()` chỉ bật dot, chưa có arrow
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1076), hàm này hiện set:
- `flow2.taskNotif = true`
- `flow2.taskPanelOpen = false`
- `flow2.mustBuildBeforeNextNode = false`
- `setFlow2Step('flow2_castle_mission_guided')`

Điểm quan trọng:
- có notification dot ở nút `Tasks`
- nhưng không có class/flag nào khiến mũi tên hiện lên ở đó

### 3. Top bar đã có sẵn nút `Tasks`, nhưng không nhận tutorial arrow class
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2257), `renderTopBar()` đang render:
- `button#btn-flow2-task`
- label `📝 Tasks`
- `taskDot` nếu `flow2.taskNotif === true`

Nhưng hiện tại button này chưa được gắn `tutorial-arrow-target`.

### 4. Hệ arrow hiện tại đã hỗ trợ button nói chung
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L3429), `.tutorial-arrow-target` đã support:
- `.flow2-task-btn`
- `.flow2-build-btn`
- `.node-wrapper`
- `.level-node`

Nên về kỹ thuật, có thể reuse cùng hệ arrow bằng cách gắn class lên nút `Tasks` ở top bar.

## Nhận định nguyên nhân
Vấn đề không nằm ở progression logic, mà nằm ở thiếu guidance surface:
- flow đã chuyển đúng sang “build house next”
- user đã có `taskNotif`
- nhưng notification dot là tín hiệu quá yếu
- trong khi arrow hiện đang chỉ được dùng cho node/chest/build CTA, chưa cover top-bar `Tasks`

Do đó sau boss clear, user nhìn map đã clear, không còn node nào để bấm, nhưng cũng không được chỉ trực tiếp vào nơi phải bấm tiếp theo.

## Quyết định kỹ thuật đề xuất
### 1. Tạo helper riêng cho `Task button arrow`
Thay vì hardcode ở `renderTopBar()`, nên thêm helper kiểu:
- `shouldShowFlow3TaskButtonArrow()`

Điều kiện khuyến nghị:
- `isFlow3Active()`
- `state.mode === 'kingdom'`
- `state.screen === 'home'`
- `!flow2.taskPanelOpen`
- `flow2.taskNotif === true`
- region hiện tại đã clear
- house chưa complete

### 2. Gắn class arrow trực tiếp vào `#btn-flow2-task`
Khi helper trả về `true`, nút `Tasks` sẽ có thêm:
- `tutorial-arrow-target`
- nếu cần thì thêm `flow2-target`

Như vậy arrow hiện lên mà không phải tạo thêm hệ coachmark mới.

### 3. Không dùng `mustBuildBeforeNextNode` cho case này
Case này khác nhánh tutorial build đầu tiên:
- boss đã xong
- giờ chỉ cần dẫn user mở task popup

Vì vậy không nên reuse `mustBuildBeforeNextNode`, tránh làm lẫn logic với guided build step cũ.

## Phạm vi
### In scope
- Flow 3
- sau `boss clear` khi `house` chưa complete
- arrow vào `Tasks` button trên top bar

### Out of scope
- thay đổi rule build house
- thay đổi boss clear reward/progression
- thêm popup hay tutorial text mới

## Kế hoạch triển khai
1. Thêm helper xác định khi nào phải show arrow vào `Tasks`
   - bám vào `guideFlow2ToHouseCompletion()` state hiện có
   - chặn khi task popup đã mở

2. Update `renderTopBar()`
   - gắn class `tutorial-arrow-target` vào `btn-flow2-task` khi helper trả về `true`

3. Audit interaction sau khi bấm `Tasks`
   - khi popup mở, arrow trên top bar phải biến mất
   - tránh để arrow còn treo sau khi vào popup/build

4. Retest sequence chính
   - clear boss khi house chưa xong
   - Continue
   - quay về `Home`
   - thấy arrow vào `Tasks`
   - bấm `Tasks` mở popup đúng

## Rủi ro / điểm cần lưu ý
1. Nếu điều kiện show arrow quá rộng, `Tasks` button có thể hiện arrow cả ở những step không mong muốn.
2. Nếu chỉ dựa vào `taskNotif`, arrow có thể bật cả ở các case khác ngoài `boss clear` house-incomplete.
3. Top bar button chưa từng là host chính cho arrow trong Flow 3, nên cần test vị trí mũi tên có bị lệch layout hay không.

## Checklist QA
- Clear boss khi house chưa complete thì sau `Continue` thấy arrow ở nút `Tasks`.
- Bấm `Tasks` mở `House task popup` bình thường.
- Khi popup đã mở, arrow trên top bar biến mất.
- Nếu house đã complete, không hiện arrow vào `Tasks`.
- Các arrow cũ của node/chest/build vẫn hoạt động như trước.
