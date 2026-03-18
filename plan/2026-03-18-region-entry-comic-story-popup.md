# Plan: Region Entry Comic Story Popup

## Mục tiêu
Khi user bước vào một khu vực mới, game sẽ tự động mở một popup story. Popup này hiển thị:
- một tấm hình comic/cartoon đại diện cho cốt truyện của khu vực
- có thể kèm title/caption ngắn

Kết quả mong muốn:
- vào khu vực mới là có beat kể chuyện rõ ràng
- popup tự mở đúng thời điểm
- mỗi khu vực chỉ hiện story popup ở lần vào đầu tiên
- user có CTA rõ để đóng và bắt đầu chơi khu vực đó

## Hiện trạng code liên quan
### 1. Hook chuyển khu vực hiện tại là `travelToRegion(idx)`
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2852), `travelToRegion(idx)` đang:
- reset một số state của scripted flow
- set `state.currentRegionIdx = idx`
- render `home`

Đây là entry point phù hợp nhất để gắn logic “vào khu vực mới”.

### 2. Vùng mới cũng được vào qua `startGame(flowId)`
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L3399), `startGame(...)` đang set:
- `state.currentRegionIdx = 0`
- `state.screen = 'home'`

Nếu muốn khu vực đầu tiên cũng có story popup, flow này cũng cần được hook.

### 3. Hệ popup hiện có mới hỗ trợ text, chưa có image slot
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L715), `showRichPopup(...)` hiện support:
- title
- goal text
- body lines
- CTA

Nhưng chưa có field kiểu:
- image
- illustration
- comic panel

Nên muốn có popup comic đúng nghĩa thì cần mở rộng popup system hoặc tạo popup helper riêng.

### 4. Khu vực mới hiện được unlock/travel sau khi complete area
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L854), `handleFlow2AreaCompleteContinue()` đang:
- unlock region kế tiếp
- gọi `travelToRegion(nextRegionIdx)`

Đây là luồng quan trọng nhất cần auto-show story popup cho khu vực mới.

## Nhận định
Feature này không chỉ là thêm hình vào popup cũ, mà là thêm một loại onboarding beat mới cho từng region.

Có 3 quyết định cần chốt:
1. Popup hiện khi nào:
   - chỉ khi vào khu vực lần đầu
   - hay mọi lần travel
2. Nội dung lấy từ đâu:
   - config mapping theo `region.id`
3. UI dùng popup nào:
   - extend `showRichPopup`
   - hay tạo `showRegionStoryPopup(...)` riêng

Khuyến nghị:
- chỉ hiện lần đầu vào từng khu vực
- dùng config mapping theo region
- tạo helper popup story riêng để không làm `showRichPopup` generic bị phình quá mức

## Quyết định kỹ thuật đề xuất
### 1. Tạo config `REGION_STORY_POPUPS`
Mapping theo `region.id`, ví dụ:
- `home`
- `forest`
- `desert`
- `snow`
- `volcano`

Mỗi entry có thể chứa:
- `title`
- `caption`
- `image`
- optional `ctaLabel`

### 2. Track “đã xem story popup” theo từng region
Không nên chỉ dựa vào `region.unlocked`.
Nên có state riêng kiểu:
- `storyPopupSeenByRegion`
hoặc
- `regionIntroSeen`

State này cần reset khi `startGame(...)` bắt đầu run mới.

### 3. Tạo helper popup riêng cho story comic
Khuyến nghị tạo:
- `showRegionStoryPopup(regionIdx)`

Lý do:
- popup này cần image lớn
- layout khác popup text thường
- dễ custom CTA và lock state

### 4. Auto-open ở đúng 2 điểm
Điểm khuyến nghị:
- khi start game vào region đầu tiên
- khi `travelToRegion(nextRegionIdx)` do unlock/advance sang khu vực mới

Không nên auto-open khi user chỉ back/forth giữa các region đã xem rồi.

## Phạm vi
### In scope
- popup story comic cho từng region
- image config theo region
- trigger tự mở khi vào region mới lần đầu
- guard không mở lại khi revisit

### Out of scope
- viết full cốt truyện dài
- animation slideshow nhiều trang
- hệ dialogue tương tác nhiều bước

## Kế hoạch triển khai
1. Tạo config story popup theo region
   - title
   - caption
   - image asset reference

2. Thêm state tracking đã xem theo region
   - reset ở `startGame(...)`
   - set sau khi popup của region đó đã hiện

3. Tạo popup helper riêng cho region story
   - layout có image comic lớn
   - CTA `Continue` hoặc `Start`

4. Hook trigger vào flow
   - region đầu khi bắt đầu run
   - region mới sau `travelToRegion(...)`

5. Retest behavior
   - start flow -> region 1 popup
   - complete area -> vào region mới -> popup tự mở
   - quay lại region cũ -> không bật lại popup

## Rủi ro / điểm cần lưu ý
1. Nếu hook thẳng vào `travelToRegion(...)` mà không có seen-guard, popup sẽ hiện lại mỗi lần user đổi region bằng arrow.
2. Nếu extend `showRichPopup(...)` quá nhiều, popup text thường sẽ bị phức tạp hóa không cần thiết.
3. Ảnh comic cần có source strategy rõ ràng:
   - asset local
   - generated image
   - placeholder trước rồi thay sau

## Checklist QA
- Vào run mới, khu vực đầu tiên có popup comic.
- Unlock và travel sang khu vực mới thì popup comic tự mở.
- Popup có image comic đúng region.
- Đóng popup xong thì vào gameplay bình thường.
- Revisit khu vực đã xem rồi thì popup không tự bật lại.
