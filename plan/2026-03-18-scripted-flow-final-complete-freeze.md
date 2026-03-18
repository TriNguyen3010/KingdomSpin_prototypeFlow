# Plan: Điều Tra Bug Freeze Sau Khi Hoàn Thành Tất Cả Task

## Mục tiêu
Tìm nguyên nhân và sửa bug ở bước hoàn thành toàn bộ task của scripted flow, khi người chơi build xong task cuối cùng rồi màn hình rơi vào trạng thái như bị freeze.

Kết quả mong muốn:
- hoàn thành task cuối cùng không rơi vào dead-end state
- có terminal flow rõ ràng cho khu vực cuối cùng
- không còn tình trạng quay về màn map đã clear hết nhưng không còn hành động tiếp theo
- user luôn có một CTA rõ ràng sau khi finish toàn bộ progression

## Hiện trạng code liên quan
### 1. Nhánh `Area Complete -> Continue` chỉ xử lý tốt khi còn khu vực kế tiếp
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L745), `handleFlow2AreaCompleteContinue()` hiện:
- unlock vùng kế tiếp nếu `nextRegionIdx < state.regions.length`
- nếu còn vùng tiếp theo thì `travelToRegion(nextRegionIdx)`
- nếu không còn vùng tiếp theo thì chỉ:
  - `renderTopBar()`
  - `renderScreen()`
  - `showToast('All areas unlocked.')`

Điều đó có nghĩa là nhánh cuối cùng hiện không có end-state riêng, không có popup riêng, không có CTA chuyển cảnh, cũng không kết thúc flow.

### 2. Map của vùng đã clear hết node vốn không còn điểm tương tác progression
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1957), `renderKingdomMapNodes()` có rule:
- node đã clear thì không còn `onclick`
- chỉ node current và chưa clear mới vào được slot

Khi vùng cuối đã hoàn tất:
- `curRegion.clearedNodes >= curRegion.nodes`
- tất cả node trên map đều thành cleared
- không còn node current để bấm tiếp

### 3. State sau khi bấm Continue ở popup cuối đang quay về step map thường
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L765), nhánh cuối vẫn set:
- `flow2.step = 'flow2_area_map_ready'`

Tức là flow engine tự xem đây chỉ là “quay về map bình thường”, trong khi thực tế progression đã kết thúc.

## Nhận định nguyên nhân gốc có khả năng cao nhất
Bug này nhiều khả năng không phải freeze do render hay crash JS, mà là **thiếu terminal completion flow cho khu vực cuối cùng**.

Chuỗi hiện tại là:
1. build xong task cuối
2. `Area Complete` popup mở đúng
3. user bấm `Continue`
4. vì không còn `nextRegionIdx`, code chỉ rerender lại map hiện tại
5. map hiện tại đã clear hết node và không còn next progression

Kết quả nhìn từ phía user:
- popup đóng lại
- màn hình vẫn ở khu vực cũ
- không còn node nào để bấm tiếp
- không có popup chúc mừng cuối flow
- không có CTA rời flow / restart / quay về chọn flow

Nên cảm giác thực tế là “game bị freeze”.

## Quyết định kỹ thuật đề xuất
### 1. Tách riêng nhánh `final area complete`
Thay vì reuse `flow2_area_map_ready` cho mọi trường hợp, khu vực cuối cần một nhánh terminal riêng, ví dụ:
- `flow2_all_areas_complete`
- hoặc `scripted_flow_finished`

### 2. Không trả user về map thường khi đã hết progression
Ở khu vực cuối, sau `Area Complete -> Continue` không nên chỉ rerender map.

Khuyến nghị:
- show popup cuối flow / end screen
- hoặc quay về flow selection
- hoặc mở màn summary / congratulations có CTA rõ ràng

Điểm quan trọng:
- user không được rơi về một màn không còn tương tác mà không có giải thích

### 3. End-state phải reset hoặc khóa các state progression cũ
Khi flow đã finish hoàn toàn:
- không giữ step là `flow2_area_map_ready`
- không giữ task notification / build requirement / pending region state
- nên set một terminal step rõ ràng để các guard khác không tiếp tục xử lý như một phiên chơi đang còn dang dở

## Phạm vi
### In scope
- bug “freeze” sau khi hoàn tất tất cả task của scripted flow
- terminal completion của khu vực cuối
- popup / CTA / route sau khi flow kết thúc

### Out of scope
- rebalance số lượng task hoặc crown economy
- đổi logic progression của các khu vực chưa phải vùng cuối
- refactor non-scripted castle mode

## Kế hoạch triển khai
1. Audit nhánh `Area Complete -> Continue` ở khu vực cuối
   - xác nhận chính xác behavior khi `nextRegionIdx >= state.regions.length`
   - xác nhận popup hiện đóng nhưng không mở nhánh kết thúc nào

2. Thêm terminal state riêng cho scripted flow finish
   - ví dụ `flow2_all_areas_complete`
   - dùng làm single source of truth cho trạng thái “đã hết content”

3. Tạo end popup hoặc completion screen riêng
   - copy rõ ràng kiểu:
     - hoàn thành toàn bộ khu vực
     - kết thúc flow
   - CTA có thể là:
     - quay về chọn flow
     - hoặc ở lại map nhưng có overlay kết thúc

4. Sửa `handleFlow2AreaCompleteContinue()` cho khu vực cuối
   - nếu còn vùng tiếp theo: giữ flow hiện tại như bây giờ
   - nếu là vùng cuối:
     - set terminal step
     - mở end popup / route rõ ràng
     - không chỉ `renderScreen()` trần

5. Rà lại các guard map / task / castle sau khi flow finish
   - đảm bảo end-state không bị các helper như `openFlow2TaskPanel()`, `onFlow2NodeClick()`, `travelToRegion()` kéo về map flow thường

## Rủi ro / điểm cần lưu ý
1. Nếu chỉ thêm popup cuối nhưng không set terminal state, các interaction cũ vẫn có thể chen vào sau khi popup đóng.
2. Nếu auto quay về flow selection quá sớm, user có thể không thấy cảm giác “đã finish”.
3. Nếu vẫn render map cuối ở background, cần đảm bảo overlay end-state đủ rõ để không bị hiểu là UI treo.

## Checklist QA
- Build xong task cuối của vùng chưa phải cuối:
  - vẫn unlock và travel sang vùng mới như cũ
- Build xong task cuối của vùng cuối:
  - không quay về map dead-end như hiện tại
  - có popup hoặc end screen chúc mừng rõ ràng
  - có CTA rõ ràng để user tiếp tục hoặc thoát flow
- Sau khi finish toàn flow:
  - không còn task panel tự bật lại
  - không còn node / build gate cũ chen vào
  - không bị cảm giác freeze vì thiếu tương tác
