# Plan: Fix Bug Flow 3 Màn Tối Sau Khi Hoàn Thành Tất Cả Task

## Mục tiêu
Tìm nguyên nhân và sửa bug ở Flow 3 khi hoàn thành toàn bộ house tasks:
- màn hình bị tối như đang có overlay
- popup cuối không hiện ra
- user không thể chơi tiếp hay thoát flow bằng CTA rõ ràng

## Hiện trạng từ ảnh và code
Ảnh hiện trạng cho thấy:
- background bị dim mạnh
- UI map vẫn ở phía sau
- không có popup nằm trên overlay

Pattern này khớp với tình huống:
- `overlay` vẫn visible
- nhưng `popup` đã bị thêm lại class `hidden`

### Code path liên quan
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L758), `handleFlow2AreaCompleteContinue()` hiện làm:
1. `closePopup(true)`
2. `renderTopBar()`
3. `renderScreen()`
4. `showFlow2AllAreasCompletePopup()`

Trong khi đó ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2848), `closePopup()` đang:
- remove `show`
- hide `overlay`
- rồi `setTimeout(..., 350)` để add lại class `hidden` vào `popup`

Và popup mới ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L705) được mở gần như ngay lập tức sau đó.

## Nhận định nguyên nhân gốc có khả năng rất cao
Đây nhiều khả năng là **race condition giữa popup cũ và popup mới**:

1. user bấm `Continue` ở `Area Complete`
2. `closePopup(true)` schedule một timer 350ms để add `hidden` vào popup node
3. ngay sau đó `showFlow2AllAreasCompletePopup()` reuse cùng `els.popup`
4. popup cuối được render và hiện ra
5. nhưng timer cũ của `closePopup()` bắn muộn hơn và add lại `hidden`
6. kết quả:
   - popup cuối biến mất
   - `overlay` vẫn còn visible
   - màn hình trông như bị freeze

Điểm này khớp rất sát với ảnh bạn gửi.

## Quyết định kỹ thuật đề xuất
### 1. Hủy timeout đóng popup cũ trước khi mở popup mới
Khuyến nghị:
- quản lý `popupHideTimeoutId` trong state/global
- mỗi lần `showPopup()` hoặc `showRichPopup()` chạy, phải clear timeout đóng popup cũ

### 2. Không để `closePopup()` cũ được mutate popup node sau khi popup mới đã mount
`closePopup()` hiện đang operate trên shared node `els.popup`.
Vì popup system chỉ có một DOM node dùng chung, timer cũ không được phép chạy mù sau khi popup mới đã được render.

### 3. Giữ nguyên terminal flow, chỉ sửa popup lifecycle
Bug này khác với bug “thiếu terminal flow” trước đó.
Hiện tại terminal flow đã có rồi:
- `Area Complete`
- `Flow 3 Complete`
- `Back to Flows`

Nhưng lifecycle của popup đang làm terminal popup tự biến mất.

## Phạm vi
### In scope
- popup lifecycle race của Flow 3 end-state
- overlay visible nhưng popup hidden sau `Area Complete`
- final completion popup của scripted flow

### Out of scope
- redesign end screen
- thay đổi copy của popup cuối
- thay đổi progression/task rules

## Kế hoạch triển khai
1. Thêm biến quản lý timeout đóng popup
   - ví dụ `popupHideTimer`

2. Update `closePopup()`
   - lưu timer id
   - clear timer cũ trước khi set timer mới

3. Update `showPopup()` và `showRichPopup()`
   - clear timer đóng popup đang pending trước khi show popup mới
   - đảm bảo popup node không bị `hidden` bởi timer cũ

4. Retest riêng nhánh:
   - `Area Complete` popup
   - bấm `Continue`
   - `Flow 3 Complete` popup phải đứng vững trên màn hình
   - bấm `Back to Flows`

## Rủi ro / điểm cần lưu ý
1. Cả `showPopup()` và `showRichPopup()` đều reuse cùng `els.popup`, nên fix phải bao phủ cả hai API.
2. Nếu chỉ clear timer ở một nhánh mà quên nhánh còn lại, bug sẽ vẫn xuất hiện ngắt quãng.
3. Cần chắc rằng fix popup lifecycle không làm hỏng animation đóng/mở hiện có.

## Checklist QA
- Sau `Area Complete`, popup `Flow 3 Complete` luôn hiện ra thay vì màn tối trống.
- Overlay không bị kẹt một mình khi popup đã biến mất.
- `Back to Flows` hoạt động và quay về màn chọn flow.
- Các popup khác trong game vẫn mở/đóng bình thường sau fix.
