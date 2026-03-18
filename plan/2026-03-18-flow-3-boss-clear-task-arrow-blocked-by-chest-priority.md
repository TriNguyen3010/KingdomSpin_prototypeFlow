# Plan: Flow 3 Boss Clear Task Arrow Bị Chặn Bởi Chest Priority

## Mục tiêu
Sửa case Flow 3 khi user clear xong `boss node` nhưng `house` chưa build xong: top bar phải hiện mũi tên vào nút `Tasks` để dẫn user sang build tiếp.

Kết quả mong muốn:
- sau `boss clear -> Continue`, nếu `house` chưa complete thì flow ưu tiên dẫn sang `Tasks`
- nút `Tasks` có arrow rõ ràng
- user không bị kẹt ở map đã clear mà không biết bước tiếp theo

## Hiện trạng code liên quan
### 1. Flow sau boss clear đang ưu tiên chest trước house guidance
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L843), `handleFlow2NodeClearContinue()` hiện có thứ tự:
- nếu tutorial node 1 của Flow 3 thì vào guided build đầu tiên
- `else if (getFirstClaimableChestIdx(curRegion) !== null)` thì set step `flow2_area_map_chest_ready`
- `else if (isRegionCleared(curRegion) && !isFlow2CastleCompleted())` thì mới gọi `guideFlow2ToHouseCompletion()`

Đây là điểm quyết định chính của bug.

### 2. Arrow vào `Tasks` chỉ hiện khi state house-guided được set
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L183), `shouldShowFlow3TaskButtonArrow()` yêu cầu:
- `flow2.taskNotif === true`
- `flow2.step === 'flow2_castle_mission_guided'`
- region đã clear
- house chưa complete

Nếu không đi qua `guideFlow2ToHouseCompletion()`, helper này sẽ luôn trả `false`.

### 3. `guideFlow2ToHouseCompletion()` hiện đúng là nơi bật state cho nút `Tasks`
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1076), hàm này set:
- `flow2.taskNotif = true`
- `flow2.taskPanelOpen = false`
- `setFlow2Step('flow2_castle_mission_guided')`

Tức là bản thân arrow logic mới thêm không sai hướng; nó chỉ không bao giờ được kích hoạt trong case bạn chụp.

### 4. Ảnh hiện trạng xác nhận đúng nhánh chest-priority
Trong ảnh:
- boss đã `Cleared`
- vẫn còn chest claimable trên map
- nút `Tasks` không có dot và không có arrow

Điều đó khớp với việc code đã rơi vào `flow2_area_map_chest_ready`, chứ không vào `guideFlow2ToHouseCompletion()`.

## Nhận định nguyên nhân gốc
Đây không phải bug CSS hay bug render arrow.

Nguyên nhân gốc là bug thứ tự progression:
- sau boss clear, map thường vẫn còn chest claimable
- branch `chest ready` đang chặn branch `house incomplete`
- vì vậy `taskNotif` không được bật
- `shouldShowFlow3TaskButtonArrow()` không có đủ điều kiện để hiện arrow

Nói ngắn gọn: arrow không hiện vì flow state sai, không phải vì arrow UI hỏng.

## Quyết định kỹ thuật đề xuất
### 1. Ưu tiên `house completion guidance` hơn `claimable chest` sau khi region đã clear
Trong `handleFlow2NodeClearContinue()`:
- nếu `isRegionCleared(curRegion) && !isFlow2CastleCompleted()`
- phải gọi `guideFlow2ToHouseCompletion()` trước
- không để `getFirstClaimableChestIdx(curRegion)` chặn nhánh này

### 2. Giữ chest claimable cho bước sau, không làm entry chính
Chest vẫn có thể để trên map và claim sau.
Nhưng khi boss đã xong mà house chưa xong, progression chính phải là:
- `Tasks -> build house`

### 3. Không sửa arrow helper trước
`shouldShowFlow3TaskButtonArrow()` hiện tại đủ chặt.
Nếu sửa helper mà không sửa progression order, bug sẽ chỉ được vá bề mặt.

## Phạm vi
### In scope
- Flow 3
- nhánh `boss clear -> Continue -> về Home`
- thứ tự ưu tiên giữa `claimable chest` và `house incomplete guidance`

### Out of scope
- thay đổi reward chest logic tổng thể
- đổi cost/build rule của house task
- thay đổi UI của chest hoặc task popup

## Kế hoạch triển khai
1. Sửa thứ tự branch trong `handleFlow2NodeClearContinue()`
   - check `region cleared && house incomplete` trước `claimable chest`

2. Retest signal state sau boss clear
   - `flow2.taskNotif` phải bật
   - `flow2.step` phải là `flow2_castle_mission_guided`

3. Retest top bar guidance
   - `btn-flow2-task` phải nhận `tutorial-arrow-target`
   - bấm vào phải mở `House task popup`

4. Kiểm tra side effect
   - chest vẫn còn claim được sau đó
   - không làm hỏng tutorial node/chest path cũ ở region đầu

## Rủi ro / điểm cần lưu ý
1. Nếu đổi ưu tiên quá rộng cho mọi node clear, có thể phá tutorial `claim chest` của step đầu Flow 3.
2. Nếu task popup mở ra mà thiếu crown, user có thể vẫn cần quay lại claim chest sau khi đã thấy cost build.
3. Cần giữ logic này chỉ cho case `region already cleared` và `house incomplete`, không áp bừa cho mọi `claimable chest`.

## Checklist QA
- Clear boss khi house chưa complete và vẫn còn chest claimable.
- Sau `Continue`, top bar hiện arrow vào `Tasks`.
- Bấm `Tasks` mở `House task popup` bình thường.
- Chest vẫn còn trên map và claim được sau đó.
- Tutorial `claim chest` đầu Flow 3 không bị regression.
