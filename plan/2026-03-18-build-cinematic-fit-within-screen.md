# Plan: Thu Gọn Build Cinematic Để Nằm Gọn Trong Màn Hình

## Mục tiêu
Giảm kích thước visual của `build cinematic` để animation nằm gọn trong màn hình, không tạo cảm giác zoom quá to hoặc chiếm gần hết viewport.

Kết quả mong muốn:
- cinematic vẫn là full-screen overlay
- nhưng nội dung chính nằm trong safe area gọn hơn
- stage art, badge và progress không bị quá lớn
- trên desktop và mobile đều nhìn vừa mắt

## Hiện trạng code liên quan
### 1. Overlay cinematic hiện đang là full viewport
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2391), `.slide-panel.flow2-build-cinematic-panel` đang dùng:
- `width: 100vw`
- `height: 100vh`
- `border-radius: 0`

Điều này tự nó không sai, nhưng khiến bất kỳ nội dung con nào to quá sẽ trông như “tràn màn”.

### 2. Container nội dung đang khá lớn
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2411), `.flow2-build-cinematic` đang có:
- `min-height: 100%`
- `padding: 56px 24px`
- `justify-content: center`

Kết quả là toàn bộ cinematic được phóng lớn và canh giữa rất mạnh theo trục dọc.

### 3. Stage hiện tại đang là thành phần to nhất
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2479), `.flow2-build-cinematic-stage` đang dùng:
- `width: min(720px, 92vw)`
- `min-height: 360px`
- `border-radius: 36px`

Đây là kích thước khá lớn cho một animation chỉ kéo dài khoảng 4 giây.

### 4. Art và badge cũng đang scale khá mạnh
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2505), `.flow2-build-cinematic-stage-art` đang là:
- `font-size: clamp(5rem, 10vw, 7.8rem)`

Và ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2513), `task badge` cũng dùng:
- `min-height: 52px`
- `padding: 0 20px`
- `font-size: 1.02rem`

Tổng hợp lại khiến cinematic hơi phô và dễ vượt khỏi vùng nhìn thoải mái.

## Nhận định nguyên nhân
Bug này không nằm ở route hay animation timing, mà là do tỷ lệ UI của cinematic đang bị thiết kế quá lớn:
- panel full screen
- stage rất rộng và cao
- art rất to
- khoảng thở dọc nhiều

Vì thế dù technically “không overflow”, thị giác vẫn thấy nó như bị tràn khỏi màn hình.

## Quyết định kỹ thuật đề xuất
### 1. Giữ full-screen overlay, nhưng thu nhỏ content scale
Không đổi concept full-screen cinematic.
Chỉ giảm scale của:
- title/sub spacing
- stage width/height
- art size
- progress width

### 2. Chuyển stage sang kích thước “safe viewport”
Khuyến nghị:
- dùng `width` nhỏ hơn, ví dụ quanh `min(620px, 88vw)`
- giảm `min-height`
- cân lại `padding` container để cinematic có nhiều vùng thở hơn

### 3. Giảm visual prominence của stage art
Art chỉ cần đủ để user thấy “đang xây”.
Không cần chiếm gần toàn bộ stage.

### 4. Retune mobile breakpoint cùng lúc
Hiện đã có responsive ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L3578), nhưng cần chỉnh đồng bộ với desktop scale mới để tránh mobile vẫn to quá.

## Phạm vi
### In scope
- `build cinematic` của scripted flow
- layout/size/spacing của cinematic overlay
- responsive breakpoint liên quan

### Out of scope
- đổi text của cinematic
- đổi thời lượng 4s
- đổi sequence build -> reveal

## Kế hoạch triển khai
1. Giảm scale của container cinematic
   - giảm padding dọc
   - có thể giảm gap giữa các block

2. Thu gọn `flow2-build-cinematic-stage`
   - giảm width
   - giảm min-height
   - giảm radius/shadow nếu cần

3. Thu gọn art và badge
   - giảm font-size emoji/stage art
   - giảm badge min-height/padding

4. Thu gọn progress bar và spacing dưới stage
   - giảm width
   - giảm margin-top

5. Re-tune mobile CSS
   - bảo đảm cinematic nằm trọn trong viewport nhỏ

## Rủi ro / điểm cần lưu ý
1. Thu nhỏ quá mức có thể làm cinematic mất cảm giác “reward moment”.
2. Nếu chỉ giảm stage mà không giảm title/art, tổng thể vẫn còn nặng.
3. Cần giữ đủ tương phản và readable spacing sau khi nén layout.

## Checklist QA
- Build cinematic nằm gọn trong màn hình desktop.
- Build cinematic không còn cảm giác tràn hoặc quá to trên mobile.
- Art, badge, progress vẫn đọc được rõ.
- Animation 4s vẫn chạy mượt và không bị lệch layout.
