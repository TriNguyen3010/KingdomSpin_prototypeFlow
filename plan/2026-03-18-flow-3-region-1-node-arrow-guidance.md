# Plan: Flow 3 Khu Vực 1 Hiển Thị Mũi Tên Cho Node Đến Lượt

## Mục tiêu
Ở khu vực 1 của Flow 3, mỗi khi có node đến lượt chơi thì node đó cần hiện mũi tên chỉ dẫn để user biết chạm vào đâu.

Kết quả mong muốn:
- node active ở khu vực 1 luôn có arrow rõ ràng khi đang là bước tiếp theo của flow
- user không phải đoán xem nên bấm node nào
- arrow node hoạt động nhất quán với arrow đang dùng cho chest/build/task ở tutorial

## Hiện trạng code liên quan
### 1. Hệ arrow tutorial đã tồn tại
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L166), `shouldShowFlow3TutorialArrows()` hiện đang bật arrow khi:
- đang là `Flow 3`
- và `isFlow2TutorialActive()` còn `true`

CSS của arrow base cũng đã có sẵn ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L3168).

### 2. Node active thực ra đã có hook arrow, nhưng bị khóa bởi scope tutorial hiện tại
Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2043), `renderKingdomMapNodes()` hiện đã gắn:
- `flow2-target`
- `tutorial-arrow-target`

cho node active khi:
- là node current
- và không bị chặn bởi chest claimable hoặc build requirement

Tức là engine UI đã có sẵn đường để show arrow trên node.

### 3. Vấn đề nhiều khả năng nằm ở semantics “khi nào được xem là còn cần arrow node”
Hiện arrow node chỉ bật nếu `shouldShowFlow3TutorialArrows()` trả về true.
Hàm này đang buộc theo:
- `isFlow2TutorialActive()`

Nếu product muốn khu vực 1 luôn có arrow khi node active đến lượt, kể cả sau một số bước tutorial đã complete, thì logic hiện tại là quá hẹp.

## Nhận định nguyên nhân gốc có khả năng cao nhất
Bug/thiếu sót ở đây nhiều khả năng không nằm ở phần render node, mà ở **gate condition của arrow**.

Hiện trạng:
- node active đã có class arrow target
- nhưng arrow chỉ xuất hiện trong một subset step tutorial

Nếu user đang ở khu vực 1 nhưng step đã ra ngoài phạm vi `isFlow2TutorialActive()`, arrow node sẽ biến mất dù design mong muốn vẫn phải chỉ vào node kế tiếp.

## Quyết định kỹ thuật đề xuất
### 1. Tách riêng capability “show node guidance in region 1”
Không nên reuse hoàn toàn `shouldShowFlow3TutorialArrows()` cho mọi loại arrow.

Khuyến nghị:
- giữ hàm hiện tại cho guided build/chest/task
- thêm một helper riêng cho node arrow, ví dụ:
  - `shouldShowFlow3Region1NodeArrow()`

### 2. Node arrow ở khu vực 1 nên bám vào progression state, không chỉ bám tutorial boolean
Helper mới nên check các điều kiện như:
- đang là `Flow 3`
- đang ở region index `0`
- còn node current chưa clear
- không có chest claimable đang muốn chặn luồng
- không có build requirement đang ép user làm việc khác trước

Như vậy arrow node chỉ hiện khi node thật sự là bước tiếp theo hợp lệ.

### 3. Reuse class arrow hiện có
Không cần invent UI mới.
Chỉ cần mở gate đúng cho node current để class:
- `flow2-target`
- `tutorial-arrow-target`

được apply đúng lúc.

## Phạm vi
### In scope
- Flow 3
- region 1 / Home area
- arrow hướng dẫn cho node current đến lượt

### Out of scope
- arrow cho các region sau
- redesign animation arrow
- thay đổi chest/build/task tutorial hiện có ngoài phần gate liên quan

## Kế hoạch triển khai
1. Audit lại logic gate của arrow node
   - xác nhận chính xác các case hiện đang bị tắt arrow ngoài ý muốn

2. Tách helper riêng cho node guidance ở region 1
   - không nhét hết vào `shouldShowFlow3TutorialArrows()`

3. Update `renderKingdomMapNodes()`
   - arrow node current ở region 1 bật khi node là next action hợp lệ
   - vẫn tắt nếu chest/build đang block flow

4. Retest sequence khu vực 1
   - mới vào map
   - sau node 1 clear
   - sau claim chest
   - sau build xong task 1
   - node 2 ready
   - boss node ready

## Rủi ro / điểm cần lưu ý
1. Nếu gate quá rộng, arrow node có thể hiện cùng lúc với arrow chest/build và gây nhiễu.
2. Nếu gate quá hẹp, issue sẽ không khác hiện tại.
3. Cần giữ đúng ưu tiên flow:
   - nếu đang bị ép claim chest hoặc build, arrow không được nhảy về node.

## Checklist QA
- Ở Flow 3, khu vực 1, node active có arrow khi nó là bước tiếp theo hợp lệ.
- Khi chest claimable đang block flow, arrow chuyển sang chest thay vì node.
- Khi build đang block flow, arrow chuyển sang task/build thay vì node.
- Sau khi block được giải quyết, arrow quay lại node kế tiếp đúng lúc.
