# Plan: Đơn Giản Hóa Task Reveal Thành Fade Out / Fade In

## Mục tiêu
Đổi animation `House task popup` sau build sang kiểu đơn giản hơn:
- task cũ `fade out`
- task mới `fade in`

Mục tiêu là làm motion dễ đọc và ít lỗi hơn so với sequence hiện tại.

## Vấn đề hiện tại
Sau lần chỉnh trước, reveal vẫn chưa đạt cảm giác mong muốn vì:
- orchestration vẫn còn nhiều phase
- row cũ còn collapse/reflow theo layout
- row mới vẫn tạo cảm giác “đổi list” thay vì chỉ chuyển trạng thái nhẹ nhàng

Tức là bài toán này không cần motion phức tạp; cần motion dễ hiểu hơn.

## Quyết định kỹ thuật
### 1. Bỏ emphasis vào translate/collapse
Không tiếp tục dùng kiểu:
- slide mạnh
- shrink mạnh
- collapse height

Thay vào đó:
- task cũ chỉ fade out nhẹ
- task mới chỉ fade in nhẹ

### 2. Giảm số phase JS nếu có thể
Nếu logic hiện tại đang tách `exit -> enter`, vẫn có thể giữ 2 phase,
nhưng render behavior nên đơn giản:
- phase 1: show task cũ, fade out
- phase 2: show task mới, fade in

Không cần thêm row queued với transform phức tạp.

### 3. Giữ DOM change tối thiểu
Mục tiêu là để user nhìn thấy:
- task cũ mờ dần
- sau đó task mới hiện dần

Không cần cảm giác “card bay đi / card nhảy lên”.

## Phạm vi
### In scope
- CSS của `reveal-done` và `reveal-active`
- timing reveal sau build
- JS render phase nếu cần đơn giản lại

### Out of scope
- đổi flow build
- đổi layout popup
- đổi logic unlock task / area complete

## Kế hoạch triển khai
1. Audit lại state reveal hiện tại
   - xem phase nào còn gây reflow không cần thiết

2. Đơn giản hóa JS nếu cần
   - chỉ giữ 2 nhịp `fade out -> fade in`

3. Thay keyframes hiện tại bằng fade-based animation
   - `reveal-done`: opacity giảm dần
   - `reveal-active`: opacity tăng dần
   - chỉ giữ translate rất nhẹ hoặc bỏ hẳn

4. Retest
   - task 1 complete -> task 2 unlock
   - task giữa complete -> task tiếp theo unlock
   - task cuối complete -> area complete flow

## Rủi ro / điểm cần lưu ý
1. Nếu fade timing quá ngắn, user vẫn thấy “giật”.
2. Nếu fade timing quá dài, flow sẽ feel chậm.
3. Nếu vẫn giữ collapse height, cảm giác gắt sẽ còn lại dù đã đổi sang fade.

## Checklist QA
- Task cũ fade out rõ ràng, không giật.
- Task mới fade in rõ ràng, không pop-in.
- Không còn cảm giác row bị hất hoặc co giật.
- Task cuối complete vẫn sang `Area Complete` đúng.
