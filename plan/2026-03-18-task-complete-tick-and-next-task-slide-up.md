# Plan: Thêm Tick Hoàn Thành Và Cho Task Mới Đi Từ Dưới Lên

## Mục tiêu
Tinh chỉnh `House task popup` sau build theo 2 motion rõ ràng hơn:
- task hiện tại có anim `tick complete`
- task mới xuất hiện từ dưới đi lên

Kết quả mong muốn:
- user nhìn thấy rõ task vừa hoàn thành đã được xác nhận
- task mới có cảm giác “được mở ra” thay vì chỉ đổi nội dung
- motion vẫn gọn, không giật

## Hiện trạng code liên quan
### 1. Reveal hiện tại đã bị đơn giản hóa thành fade
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js), flow reveal hiện đang dùng:
- `taskRevealActive`
- `taskRevealPhase`
- phase `exit -> enter`

Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css), animation hiện tại đã nghiêng về:
- `reveal-done`: fade out
- `reveal-active`: fade in

Điều này ổn về độ đơn giản, nhưng chưa truyền được cảm giác:
- “task này vừa complete”
- “task mới vừa được unlock”

### 2. Badge `Done` hiện chưa có motion xác nhận
Task complete hiện chỉ đổi state/badge, nhưng chưa có:
- tick pop
- tick scale
- tick glow ngắn

Nên completion feel còn hơi “phẳng”.

### 3. Task mới chưa có hướng xuất hiện rõ
Task mới hiện đang thiên về fade in, nhưng chưa có chuyển động từ dưới lên đủ rõ để user cảm được đây là “next task”.

## Nhận định nguyên nhân
Vấn đề hiện tại không còn nằm ở orchestration lớn nữa, mà ở motion semantics:

1. Completion thiếu feedback trực quan
- user chưa thấy khoảnh khắc “confirm xong task”

2. Unlock thiếu hướng chuyển động
- task mới chưa có motion riêng để phân biệt với fade thông thường

Nói ngắn gọn: cần thêm **micro-sequence đúng nghĩa**, không cần quay lại animation phức tạp như trước.

## Quyết định kỹ thuật đề xuất
### 1. Giữ JS orchestration hiện tại, chỉ bổ sung visual phase
Không đổi lại flow reveal quá nhiều.

Giữ:
- `exit`
- `enter`

Nhưng trong `exit`, thêm một nhịp complete rõ hơn cho task vừa xong.

### 2. Thêm tick complete cho task cũ
Khuyến nghị:
- trong row `reveal-done`, badge `Done` hoặc icon check có một anim ngắn
- tick có thể:
  - scale từ `0.8 -> 1`
  - có glow/ring nhẹ
  - chạy trước khi row fade out hoàn toàn

Mục tiêu là user kịp đọc “xong rồi”.

### 3. Task mới đi từ dưới lên
Ở phase `enter`, task mới nên:
- bắt đầu `opacity: 0`
- translateY từ dưới lên nhẹ
- vào nhanh, mượt, không overshoot nhiều

Giữ motion ngắn và sạch, không collapse row cũ bằng height animation.

## Phạm vi
### In scope
- CSS animation cho badge/icon tick của task complete
- CSS animation cho task mới slide-up + fade-in
- timing nhẹ trong JS nếu cần để tick có đủ thời gian hiện

### Out of scope
- đổi flow build cinematic
- đổi layout popup
- đổi logic unlock/complete/area complete

## Kế hoạch triển khai
1. Audit `renderFlow2TaskPanel()`
   - xác định class nào đang gắn cho task complete và task mới

2. Bổ sung hook visual cho complete tick
   - thêm class/state nếu cần cho badge/icon tick

3. Chỉnh CSS motion
   - `reveal-done`: tick confirm ngắn rồi fade
   - `reveal-active`: slide từ dưới lên + fade in

4. Retune timing
   - bảo đảm tick kịp đọc nhưng không làm flow chậm

5. Retest
   - task 1 complete -> task 2 unlock
   - task giữa complete -> task tiếp theo unlock
   - task cuối complete -> area complete

## Rủi ro / điểm cần lưu ý
1. Nếu tick animation quá nổi, nó sẽ tranh focus với task mới.
2. Nếu slide-up quá mạnh, popup sẽ lại có cảm giác “giật”.
3. Nếu kéo timing quá dài, pacing sau build sẽ chậm.

## Checklist QA
- Task hiện tại có tick complete rõ ràng.
- Task complete vẫn rời đi gọn, không giật.
- Task mới đi từ dưới lên rõ ràng nhưng nhẹ.
- Không có duplicate row hoặc jump layout.
- Task cuối complete vẫn chuyển đúng sang `Area Complete`.
