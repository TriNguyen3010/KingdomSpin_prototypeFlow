# Plan: Scripted Flow - Task Popup Full Màn Hình Và Castle Auto Build

## Mục tiêu
Điều chỉnh UX của scripted flow để:
- `Task` mở như một popup full màn hình giống các popup/thẻ thông báo khác, thay vì side panel trên màn `Home`
- vào màn `castle` thì không cần bấm `Build` nữa

Kết quả mong muốn:
- người chơi bấm `Task` hoặc bị tutorial ép mở task thì thấy một popup/panel full màn hình rõ ràng, tách khỏi map
- từ task list hoặc castle CTA, người chơi vào `castle` là mission active được xử lý ngay nếu đủ crown
- màn `castle` chỉ còn vai trò feedback/trình bày tiến độ, không yêu cầu thêm một lần click `Build`
- không làm vỡ loop `node -> chest -> castle mission -> next node`

## Hiện trạng code liên quan
Task hiện được mở bằng state `taskPanelOpen` trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L666) và render thành side panel ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L799).

Markup task hiện tại:
- `renderFlow2TaskPanel()` trả về `<aside class="flow2-task-panel">...`
- panel này đang được nhét trực tiếp vào layout màn `Home` trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L898)

CSS side panel hiện tại nằm ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2431).

Castle flow hiện tại:
- `openFlow2ActiveMission()` chỉ chuyển màn sang `castle` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L690)
- action build thực tế nằm trong `buildFlow2CastleMission()` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L721)
- màn castle vẫn render nút `Build` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L959)
- CSS của nút build nằm ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2811)

Popup system sẵn có:
- popup thường: [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2451)
- universal full-screen panel: [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2220)

## Vấn đề UX hiện tại
1. `Task` đang là side panel nên cảm giác nhẹ hơn các mốc quan trọng khác trong scripted flow.
2. Khi task panel mở, người chơi vẫn ở trên màn `Home`, dễ bị chia sự chú ý giữa map và task list.
3. Castle đang yêu cầu 2 lần commit:
   - click mở mission
   - click `Build`
4. Với tutorial Flow 3, bước ép build hiện phải target vào `Build` button trong castle screen, làm flow dài và thừa thao tác.

## Phạm vi
- In scope:
  - đổi `Task` từ side panel sang popup/panel full màn hình
  - bỏ yêu cầu bấm `Build` trong màn castle
  - cập nhật tutorial target tương ứng
  - giữ nguyên rule crown cost, mission progression, chest reward
- Out of scope:
  - đổi art/theme lớn cho castle screen
  - refactor toàn bộ popup system
  - thêm animation phức tạp mới cho task/castle

## Quyết định kỹ thuật đề xuất
### 1. Task dùng full-screen panel thay vì side panel
Khuyến nghị không tiếp tục render `Task` bên trong `renderFlow2KingdomHome()`.

Thay vào đó:
- `openFlow2TaskPanel()` nên mở `overlay + universalPanel` hoặc một full-screen shell tương đương
- `renderFlow2TaskPanel()` có thể được tách thành:
  - phần content task list dùng chung
  - phần shell full-screen dành cho popup mode

Lý do:
- hợp với yêu cầu “như những popup thông báo khác”
- giảm áp lực layout cho màn `Home`
- rõ hierarchy hơn trong flow scripted

### 2. Castle auto-build khi vào màn
Khuyến nghị bỏ thao tác click `Build` ở màn castle.

Hướng MVP:
- khi `openFlow2ActiveMission()` chuyển sang `castle`, nếu có mission active và đủ crown thì auto gọi logic build
- màn `castle` sau đó chỉ hiển thị kết quả/trạng thái current progress

Nếu chưa đủ crown:
- không auto-build
- vẫn vào castle screen hoặc show popup báo thiếu crown, tùy UX chốt lúc implement

Khuyến nghị MVP an toàn hơn:
- nếu thiếu crown thì dùng popup `NOT ENOUGH CROWNS` như hiện tại và không vào castle screen

## Điểm cần tách trước khi implement
`buildFlow2CastleMission()` hiện đang làm cả:
- validate crown
- mutate mission state
- chuyển về `home`
- bật notification/task panel
- phát reward feedback

Để auto-build sạch hơn, nên tách logic thành 2 lớp:
1. `performFlow2CastleMissionBuild()` hoặc helper tương đương
   - chỉ xử lý data/state transition
2. entry points UI:
   - manual/task popup/castle open

Điều này giúp:
- không phụ thuộc vào việc còn hay mất nút `Build`
- tránh duplicate state updates

## Ảnh hưởng đến tutorial Flow 3
Hiện tutorial arrow build đang bám vào:
- task popup button `Build` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L807)
- castle screen button `Build` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L988)
- castle anchor trên map ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L851)

Sau khi đổi UX:
- arrow trong task popup có thể vẫn trỏ vào row/action để mở mission
- arrow ở castle screen không còn trỏ vào nút `Build`
- step tutorial “build in castle” nên được rút gọn thành “tap castle / open mission”

## Kế hoạch triển khai
1. Tách task content khỏi home layout
   - biến task list thành content có thể render trong full-screen shell
   - gỡ phụ thuộc vào `flow2-map-content.has-task-panel`

2. Chuyển `openFlow2TaskPanel()` sang full-screen popup/panel
   - reuse `overlay`
   - ưu tiên reuse `universalPanel` hoặc shell popup full-screen đang có
   - thêm close action tương thích với `closePanels()` / flow task hiện tại

3. Dọn CSS side panel cũ
   - bỏ vai trò layout-side của `.flow2-task-panel`
   - đổi sang style panel full màn hình hoặc modal shell

4. Tách logic build khỏi button
   - rút logic mutation trong `buildFlow2CastleMission()` thành helper dùng chung
   - đảm bảo logic crown cost, mission complete, next mission unlock, tutorial state vẫn giữ nguyên

5. Đổi `openFlow2ActiveMission()`
   - nếu mission active và đủ crown: vào castle rồi auto-build, hoặc auto-build ngay trước/sau render castle theo UX chốt
   - nếu không đủ crown: giữ behavior báo lỗi rõ ràng

6. Dọn castle screen
   - bỏ nút `Build`
   - thay bằng trạng thái thông tin, progress, hoặc CTA quay lại nếu cần
   - giữ value của màn castle ở phần feedback/visual

7. Cập nhật tutorial arrows
   - bỏ dependency vào `.flow2-build-btn`
   - chuyển target tutorial về task popup row hoặc castle entry point

8. Smoke test shared scripted flows
   - Flow 2
   - Flow 3

## Rủi ro / điểm cần lưu ý
1. `Flow 2` và `Flow 3` dùng chung scripted helpers, nên nếu đổi trực tiếp mà không có capability guard thì cả hai flow sẽ cùng đổi UX.
2. `buildFlow2CastleMission()` hiện đang tự mở lại task/home sau khi hoàn tất; nếu auto-build xảy ra ngay lúc vào castle thì cần tránh flicker hoặc render trung gian vô nghĩa.
3. Nếu task chuyển sang full-screen popup, cần rà lại interaction với `overlay`, `popupLocked`, `closePanels()` để không xung đột với popup khác.
4. Tutorial step hiện đang giả định có target ở castle build button; bỏ nút này mà không dọn step sẽ làm tutorial bị kẹt.

## Checklist QA
- Bấm `Task` mở full màn hình, không còn side panel đè trên `Home`.
- Đóng task popup quay lại đúng màn trước.
- Từ task popup vào castle không cần bấm thêm `Build`.
- Nếu đủ crown, mission hoàn tất đúng và unlock task kế tiếp như cũ.
- Nếu không đủ crown, thông báo lỗi rõ ràng và không phá state.
- Flow 3 tutorial không còn đòi click vào nút `Build` trong castle.
- Flow 2 không bị regression ở loop `node -> chest -> castle -> next node`.
