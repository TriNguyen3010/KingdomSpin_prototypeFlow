# Plan: Làm Mượt Animation Task Biến Mất Và Hiện Ra

## Mục tiêu
Làm animation ở `House task popup` mượt hơn khi:
- task vừa hoàn thành biến mất
- task kế tiếp hiện ra

Kết quả mong muốn:
- transition có nhịp rõ ràng, ít “giật”
- task cũ không biến mất quá gấp
- task mới không pop-in đột ngột
- toàn bộ reveal feel như một sequence liên tục

## Hiện trạng code liên quan
### 1. Reveal hiện tại dựa vào một state ngắn và timer cleanup
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1139), `finishFlow2TaskReveal()` đang dọn reveal state và rerender lại popup.

Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1163), `scheduleFlow2TaskRevealCleanup()` dùng:
- `FLOW2_TASK_REVEAL_MS = 1550`

Tức là reveal hiện đang bị bó vào một khoảng thời gian cứng, sau đó state bị reset ngay.

### 2. Visible missions đang đổi khá mạnh giữa các phase
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L865), `getFlow2TaskPanelVisibleMissions()` khi `taskRevealActive` sẽ chỉ giữ:
- task vừa xong
- task vừa unlock

Sau khi cleanup chạy, popup lại rerender về chỉ task active.

Điều này tạo ra 2 lần thay đổi DOM/content khá rõ:
- lần 1: sang reveal mode
- lần 2: cleanup về state ổn định

### 3. CSS animation hiện tại còn khá mechanical
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2809), task done đang dùng `reveal-done`.

Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2814), task mới dùng `reveal-active`.

Và keyframes ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2970) hiện là:
- `flow2-task-done-exit`
- `flow2-task-active-reveal`
- `flow2-task-badge-glow`

Animation hiện tại:
- exit hơi “hất ngang + blur”
- reveal là fade/slide đơn giản
- chưa có stagger hoặc overlap timing tinh tế

## Nhận định nguyên nhân
Độ “không mượt” đến từ 2 tầng:

1. State orchestration:
- reveal bị cleanup khá sớm
- list bị rerender lại theo phase hơi gắt

2. Motion design:
- exit/reveal curve còn hơi cứng
- chưa có độ chồng nhịp giữa task cũ và task mới

Nói ngắn gọn: vấn đề không chỉ ở keyframes, mà còn ở cách JS cắt phase reveal.

## Quyết định kỹ thuật đề xuất
### 1. Tách reveal thành phase rõ hơn
Khuyến nghị chia ra tối thiểu 2 phase:
- `task old exits`
- `task new enters`

Thay vì để cả 2 cùng phụ thuộc vào một timer cleanup chung.

### 2. Giảm “DOM snap” giữa các phase
Thay vì filter list đổi quá gắt, nên cân nhắc:
- giữ item cũ trong DOM lâu hơn trong lúc exit
- chỉ remove hẳn sau khi exit xong

Điều này sẽ giảm cảm giác popup bị “rebuild”.

### 3. Làm motion mềm hơn
Khuyến nghị:
- task done exit theo hướng nhẹ hơn, ít blur hơn
- task mới enter có overlap nhẹ sau khi task cũ bắt đầu rời đi
- easing mềm hơn, giảm cảm giác mechanical

## Phạm vi
### In scope
- JS orchestration của task reveal
- CSS animation `reveal-done / reveal-active`
- timing/stagger của sequence sau build

### Out of scope
- đổi flow build cinematic
- đổi logic unlock task
- redesign toàn bộ task popup UI

## Kế hoạch triển khai
1. Audit lại phase của `taskRevealActive`
   - xác định phase hiện tại đang rerender quá gấp ở đâu

2. Refactor reveal state nếu cần
   - tách exit và enter phase
   - delay cleanup đến sau khi exit/enter hoàn tất

3. Chỉnh keyframes/easing
   - task cũ rời đi mượt hơn
   - task mới vào mềm hơn
   - giảm blur/offset mạnh nếu đang gây “giật”

4. Retest 3 case
   - task 1 complete -> task 2 unlock
   - task giữa complete -> task tiếp theo unlock
   - task cuối complete -> area complete flow

## Rủi ro / điểm cần lưu ý
1. Nếu tăng timing quá nhiều, popup sẽ feel chậm và cản pacing.
2. Nếu giữ item cũ trong DOM quá lâu, list có thể trông như duplicate trong một nhịp ngắn.
3. Nếu chỉ sửa CSS mà không sửa timing cleanup, motion vẫn sẽ bị “cắt ngang”.

## Checklist QA
- Task vừa xong rời đi mượt, không giật.
- Task mới hiện ra có nhịp rõ ràng, không pop-in đột ngột.
- Không còn cảm giác list bị rebuild gấp.
- Task cuối complete vẫn chuyển area complete đúng.
- Không làm hỏng guided build flow và post-build reveal flow hiện tại.
