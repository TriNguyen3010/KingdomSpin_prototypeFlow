# Plan: Flow 3 - Clone Từ Flow 2

## Mục tiêu
Tạo thêm `Flow 3` mới trong project, lấy `Flow 2` làm baseline gần như nguyên vẹn để có thể:
- Chọn `Flow 3` ngay từ màn flow selection.
- Chạy đầy đủ loop tương tự `Flow 2`:
  - area map
  - node spin
  - chest reward
  - castle mission
  - popup intro / clear / area complete
- Giữ `Flow 2` hiện tại không bị regression.

Mục tiêu MVP là `Flow 3` hành xử gần như giống `Flow 2`. Khác biệt về content/rule nếu có sẽ để dưới dạng config để chỉnh sau.

## Hiện trạng code liên quan
- `index.html` mới có 2 lựa chọn:
  - `Flow 1`
  - `Flow 2`
- `app.js` hiện đang hardcode `Flow 2` theo namespace riêng:
  - `currentFlow === 2`
  - `state.flow2`
  - `createFlow2State()`
  - `isFlow2Active()`
  - `getFlow2State()`
  - các helper / renderer / step tên `flow2_*`
- `startGame(flowId)` mới có path setup riêng cho `flowId === 2`.

Điểm quan trọng: nếu copy-paste thẳng toàn bộ `Flow 2` thành `Flow 3`, code sẽ chạy nhanh cho MVP nhưng chi phí bảo trì tăng gấp đôi. Vì vậy plan nên clone behavior nhưng tách phần dùng chung ra trước hoặc song song.

## Phạm vi
- In scope:
  - Thêm option `Flow 3` vào màn chọn flow.
  - Tạo state riêng cho `Flow 3`.
  - Clone toàn bộ behavior `Flow 2` cho `Flow 3`.
  - Tách config để `Flow 3` có thể đổi content/rule sau này mà không phải đụng sâu vào `Flow 2`.
  - Giữ `Flow 2` tiếp tục chạy như hiện tại.
- Out of scope (MVP):
  - Tạo visual theme hoàn toàn mới cho `Flow 3`.
  - Viết lại toàn bộ kiến trúc flow của app.
  - Persistence giữa các flow.
  - Thiết kế rule hoàn toàn khác `Flow 2`.

## Quyết định kỹ thuật đề xuất
1. `Flow 3` nên là một bản clone theo behavior của `Flow 2`, nhưng không nên clone bằng cách copy thêm hàng loạt hàm `flow3_*` nếu tránh được.
2. Nên trích `Flow 2` hiện tại sang mô hình `scripted flow config` để:
   - `Flow 2` và `Flow 3` dùng cùng engine
   - mỗi flow chỉ khác ở config + state key
3. Nếu cần chốt MVP nhanh:
   - vẫn có thể thêm `flow3` state riêng
   - nhưng renderer/helper nên nhận `flowId` hoặc `flowKey`
   - tránh duplicate toàn bộ `renderFlow2...`, `buildFlow2...`, `handleFlow2...`
4. Rule gameplay mặc định của `Flow 3` giai đoạn đầu:
   - giống `Flow 2`
   - content mặc định có thể y hệt `Flow 2`
   - khác biệt sẽ đến từ config sau

## Kiến trúc clone đề xuất
### 1. Flow descriptor
Tạo một lớp config cho flow kiểu:
- `FLOW_DEFS[2]`
- `FLOW_DEFS[3]`

Mỗi flow config nên chứa:
- `id`
- `label`
- `startCoins`
- `startCrowns`
- `castleMissions`
- `spinMissionPresets`
- `uiTitle` / `refLabel`
- optional `themeOverrides`

MVP:
- `FLOW_DEFS[3]` copy trực tiếp từ `FLOW_DEFS[2]`

### 2. State tách riêng theo flow
Thay vì chỉ có `state.flow2`, nên chuyển thành một trong hai hướng:

Hướng khuyến nghị:
- `state.scriptedFlows = { flow2: ..., flow3: ... }`

Hướng MVP tối thiểu:
- giữ `state.flow2`
- thêm `state.flow3`
- nhưng helper chung phải nhận `flowKey`

State cho mỗi flow nên có:
- `active`
- `step`
- `tutorialComplete`
- `taskPanelOpen`
- `taskNotif`
- `universalNotif`
- `mustBuildBeforeNextNode`
- `shownLevelIntros`
- `areaCompleteShown`
- `lastSpinHitTargetIds`

### 3. Helper active flow
Cần các helper mới kiểu:
- `isScriptedFlowActive()`
- `getActiveScriptedFlowId()`
- `getActiveScriptedFlowState()`
- `getActiveFlowConfig()`

Mục tiêu là thay dần các đoạn `if (isFlow2Active())` thành logic tổng quát hơn, để Flow 3 tự hưởng behavior giống Flow 2.

## Kế hoạch triển khai
1. Chuẩn bị entry cho Flow 3
   - Thêm button `Flow 3` trong `index.html`.
   - Update label hiển thị ở flow indicator.
   - Mở đường vào `startGame(3)`.

2. Tách config dùng chung của Flow 2
   - Gom các constant đặc thù `Flow 2` vào object config:
     - castle mission
     - spin mission preset
     - starting resource
     - popup copy nếu có
   - Tạo config `Flow 3` bằng cách clone config `Flow 2`.

3. Tách state scripted flow
   - Refactor `createFlow2State()` thành factory chung, ví dụ `createScriptedFlowState()`.
   - Bổ sung state cho `Flow 3`.
   - Đảm bảo reset state đúng khi `startGame(2)` hoặc `startGame(3)`.

4. Generalize helper runtime
   - Refactor các helper `Flow 2` sang dạng active-flow aware:
     - state getter
     - castle mission getter
     - spin mission getter
     - level intro goal text
     - notification / task panel logic
   - Chỉ giữ wrapper tên `Flow 2` nếu cần để giảm diff lớn trong lần đầu.

5. Generalize renderer
   - Map screen
   - slot screen
   - goal panel / mission panel
   - castle screen
   - task panel
   - popup step flow
   Mục tiêu: `Flow 3` render giống `Flow 2` mà không cần copy nguyên block HTML lần thứ hai.

6. Generalize action handler
   - `on node click`
   - `claim chest`
   - `open task panel`
   - `open active mission`
   - `build castle mission`
   - `spin kingdom slot` cho scripted flow
   - `handle area complete`

7. Cập nhật `startGame(flowId)`
   - `flowId === 3` phải setup giống `flowId === 2`
   - nhưng bind đúng state/config của `Flow 3`
   - đảm bảo `currentFlow` = `3` thì UI restriction, tutorial sequence, task logic vẫn hoạt động

8. Dọn naming và docs
   - Chuyển các tên quá đặc thù `Flow 2` sang neutral hơn nếu đã refactor helper chung.
   - Ghi rõ trong docs/plan:
     - `Flow 2` = scripted flow bản gốc
     - `Flow 3` = scripted flow clone

## Phạm vi clone của MVP
Ở bản đầu của `Flow 3`, cho phép clone nguyên các đặc điểm này từ `Flow 2`:
- cùng start resource
- cùng area đầu
- cùng castle mission
- cùng spin target item
- cùng popup copy
- cùng step progression

Tức là khác biệt duy nhất ban đầu chỉ là:
- user chọn `Flow 3` thay vì `Flow 2`
- engine chạy trên namespace/config của `Flow 3`

## Rủi ro / điểm cần lưu ý
1. `Flow 2` hiện trải dài ở rất nhiều helper tên cứng theo flow, nên nếu clone thẳng sẽ tạo thêm một lớp copy-paste lớn.
2. Nếu không tách config trước, mọi bug fix sau này phải sửa cả `Flow 2` lẫn `Flow 3`.
3. `currentFlow === 2` đang là gate ở nhiều chỗ; cần audit kỹ để `Flow 3` không bị rơi vào nhánh `Flow 1`.
4. `startGame(3)` cần reset đúng state để không dùng lẫn state của `Flow 2`.
5. Nếu UI text vẫn hardcode “Flow 2”, người chơi sẽ thấy sai nhãn dù logic chạy đúng.

## Checklist QA
- Màn chọn flow có thêm nút `Flow 3`.
- `startGame(3)` vào đúng loop scripted flow thay vì `Flow 1`.
- `Flow 3` đi được đầy đủ sequence:
  - level intro
  - spin node
  - chest claim
  - castle mission
  - next node
- `Flow 3` boss/area complete vẫn hoạt động.
- `Flow 2` không bị đổi behavior sau refactor.
- `Flow 1` không bị ảnh hưởng.
- Reset về flow selection rồi vào lại từng flow vẫn đúng state riêng.
- Text/label trên UI không còn chỗ nào ghi sai flow ID.
