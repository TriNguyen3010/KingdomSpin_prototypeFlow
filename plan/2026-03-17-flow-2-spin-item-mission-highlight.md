# Plan: Flow 2 - Spin Đúng Item Và Sáng Ô Mission

## Mục tiêu
Điều chỉnh `Flow 2` để mỗi `node` không còn clear ngay sau 1 spin như hiện tại. Thay vào đó:
- Mỗi level hiển thị một nhóm `target item` cố định ở màn `kingdom-slot`.
- Người chơi phải spin trúng đúng các item đó.
- Khi item đã trúng, ô tương ứng trên panel mission chuyển sang trạng thái `sáng / completed`.
- Node chỉ clear khi toàn bộ target item của node hiện tại đã được hit.

Feature này chỉ áp vào `Flow 2`, không đổi loop mission board của `Kingdom` thường.

## Hiện trạng code liên quan
- `Flow 2` đang có onboarding + chest + castle mission riêng:
  - `createFlow2State()`
  - `getFlow2CastleMissions()`
  - `buildFlow2CastleMission()`
- Màn `Flow 2 slot` hiện chỉ render text goal đơn giản qua:
  - `renderFlow2GoalPanel(curRegion)`
  - `renderFlow2KingdomSlot(curRegion)`
- `spinKingdomSlot()` trong nhánh `isFlow2Active()` đang:
  - spin 1 lần
  - cộng reward
  - tăng `curRegion.clearedNodes += 1`
  - mở popup clear node

Điểm cần đổi là nhánh spin của `Flow 2` hiện chưa có state mission theo item và chưa có logic “hit rồi sáng ô”.

## Phạm vi
- In scope:
  - Data model mission item theo `region + node` riêng cho `Flow 2`.
  - UI panel target item ở màn `Flow 2 kingdom-slot`.
  - Logic cập nhật target item sau mỗi spin.
  - Visual state `pending -> hit` cho từng ô.
  - Chặn clear node cho tới khi đủ target item.
  - Giữ nguyên loop `node clear -> chest -> castle mission -> node tiếp theo`.
- Out of scope (MVP):
  - Persistence qua refresh / localStorage.
  - Cân bằng xác suất symbol quá sâu.
  - Animation particle lớn hoặc VFX phức tạp.
  - Đổi luật `castle mission`, `chest reward`, `universal map`.

## Rule gameplay đề xuất
1. Mỗi node của `Flow 2` có một danh sách target symbol cố định.
2. Target symbol được hiển thị thành các ô riêng ở side panel của màn spin.
3. Một spin được tính là `hit` nếu symbol target xuất hiện trong `symbolGrid` sau khi reel dừng.
4. Để demo-friendly, matching nên đọc từ toàn bộ `5 x 3` symbol visible, không chỉ `centerLine`.
5. Mỗi target chỉ cần hit `1 lần`.
6. Khi target đã hit:
   - ô đó đổi sang trạng thái sáng
   - trạng thái được giữ nguyên cho tới khi clear node
7. Node clear khi tất cả target của node hiện tại đều ở trạng thái `hit`.
8. Reward spin (`wonCoins`, `wonPower`) giữ nguyên logic hiện tại.
9. Loop meta sau khi clear node giữ nguyên:
   - node clear popup
   - chest claim
   - build castle mission
   - mở node kế tiếp

## Rule target item cho demo
Để dễ test và không kéo pacing quá dài:
1. Node 1: `2 target item`.
2. Node 2: `3 target item`.
3. Boss node: `3-4 target item`.
4. Không dùng target trùng nhau trong cùng 1 node.
5. Ưu tiên symbol dễ đọc từ bộ hiện có:
   - `crown`
   - `shield`
   - `sword`
   - `gem`
   - `leaf`
   - `hammer`
   - `helm`

Gợi ý demo region đầu:
1. Level 1: `shield`, `hammer`
2. Level 2: `crown`, `sword`, `gem`
3. Boss: `crown`, `shield`, `helm`, `leaf`

## Đề xuất data model
Trong mỗi `region` thêm state lazy cho `Flow 2`:
- `flow2SpinMissions: { [nodeNum]: Flow2SpinMission }`

Shape gợi ý:
- `id`
- `nodeNum`
- `targets`

Mỗi target:
- `symbol`
- `label`
- `hit`
- `hitOrder` hoặc `hitAtSpin` (optional, nếu cần animation nhẹ)

Helper mới gợi ý trong `app.js`:
- `createFlow2SpinMission(regionIdx, nodeNum)`
- `ensureFlow2SpinMission(regionIdx, nodeNum)`
- `getFlow2SpinMission(regionIdx, nodeNum)`
- `applyFlow2SpinMissionResult(regionIdx, nodeNum, symbolGrid)`
- `isFlow2NodeMissionComplete(regionIdx, nodeNum)`

## UI đề xuất
Thay `renderFlow2GoalPanel(curRegion)` bằng panel mission item rõ ràng hơn.

Panel nên có:
- Kicker: `Level 1 mission`
- Short copy: `Spin these items`
- Grid/list target item
- Progress text: `1 / 3 collected`

Mỗi target item card:
- icon từ `KINGDOM_SLOT_SYMBOL_MAP`
- tên ngắn của item
- trạng thái:
  - `pending`
  - `hit`

Visual state:
- `pending`: nền tối, border mờ
- `hit`: nền sáng hơn, glow vàng/xanh, icon scale nhẹ
- Có thể thêm class `just-hit` cho spin vừa rồi để flash ngắn

Responsive:
- Desktop: panel ở cột phải như layout hiện tại
- Mobile: panel xuống dưới slot machine, vẫn giữ target item đủ lớn để đọc

## Kế hoạch triển khai
1. Tách mission spin riêng cho Flow 2
   - Thêm `flow2SpinMissions` vào region state khởi tạo trong `createInitialRegions()`.
   - Tạo helper lazy cho từng node để tránh build toàn bộ upfront.

2. Định nghĩa mission target theo node
   - Tạo config/demo rule cho region đầu và fallback rule cho node khác.
   - Đảm bảo target không trùng nhau trong cùng node.

3. Thay panel goal text bằng panel target item
   - Refactor `renderFlow2GoalPanel(curRegion)` thành renderer mission item.
   - Hiển thị icon + progress + trạng thái sáng của từng ô.

4. Cập nhật engine xử lý spin của Flow 2
   - Trong `spinKingdomSlot()` nhánh `isFlow2Active()`, sau khi nhận `symbols`, lấy toàn bộ symbol visible từ `symbolGrid`.
   - Mark các target item đã hit.
   - Chỉ tăng `curRegion.clearedNodes` khi mission item của node hiện tại hoàn tất.
   - Nếu chưa đủ target thì giữ người chơi ở lại màn spin và chỉ cập nhật UI/reward.

5. Thêm feedback khi hit target
   - Bật sáng ô target vừa hit.
   - Toast ngắn kiểu `Mission hit: Shield`.
   - Optional: floating reward nhỏ cho icon item vừa hoàn thành.

6. Giữ nguyên onboarding / chest / castle flow
   - `Level intro popup` chỉ đổi copy goal cho khớp mission item.
   - `flow2_node1_cleared`, `flow2_claim_chest_guided`, `flow2_castle_mission2_unlocked` giữ nguyên ý nghĩa.
   - Node chỉ phát `clear popup` sau khi complete đủ item.

7. Dọn copy và docs
   - Sửa text goal của popup intro để không còn nói chung chung `Clear the first node`.
   - Cập nhật file flow/docs nếu cần để phân biệt:
     - `node mission spin`
     - `castle build mission`

## Rủi ro / điểm cần lưu ý
1. `Flow 2` hiện đang clear node ngay sau 1 spin, nên đổi logic này sẽ chạm trực tiếp pacing onboarding.
2. Nếu matching chỉ tính `centerLine` thì mission có thể quá hên xui; vì vậy MVP nên match theo toàn bộ visible grid.
3. Cần tránh nhầm lẫn giữa:
   - `Flow 2 spin mission` của node
   - `Flow 2 castle mission` của area
4. Nếu back khỏi màn spin rồi vào lại, trạng thái ô đã sáng phải còn nguyên.
5. Cần giữ cho panel mới không làm chật mobile hơn layout hiện tại.

## Checklist QA
- Flow 2 node 1 không clear ngay sau spin đầu nếu chưa hit đủ target item.
- Khi symbol target xuất hiện trong kết quả spin, đúng ô tương ứng sáng lên.
- Ô đã sáng vẫn giữ trạng thái sau spin kế tiếp.
- Hit lại item đã hoàn thành không làm tăng sai progress.
- Khi toàn bộ item đã hit, node clear đúng 1 lần.
- Sau node clear, flow `chest -> castle mission -> next node` vẫn chạy như hiện tại.
- Flow 1 và `Kingdom` thường không bị ảnh hưởng.
- UI panel mission hiển thị ổn ở desktop và mobile.
