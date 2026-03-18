# Plan: Điều Tra Và Fix Bug Finish Khu Vực Ở House Task System

## Mục tiêu
Tìm nguyên nhân và sửa bug ở bước `finish khu vực` sau khi chuyển sang hệ `house task`.

Kết quả mong muốn:
- điều kiện hoàn thành khu vực là rõ ràng và nhất quán
- popup `Area Complete` chỉ xuất hiện đúng lúc
- không còn state cũ chen vào làm flow finish khu vực bị sai, bị lặp, hoặc bị kẹt
- sau khi complete khu vực, unlock/travel sang khu vực mới chạy ổn định

## Hiện trạng code liên quan
### 1. Logic mới đang coi `house complete` là điều kiện hoàn thành khu vực
Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L904), `maybeCompleteFlow2Area()` hiện chỉ check:
- `isFlow2CastleCompleted()`
- `flow2.areaCompleteShown`

Nghĩa là semantics mới đang là:
- build xong toàn bộ house tasks
- => complete khu vực

### 2. Nhưng node-clear path cũ vẫn còn set step của hệ cũ
Ở boss clear path trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2956), code vẫn:
- thử `maybeCompleteFlow2Area()`
- nếu chưa complete thì set `flow2.step = 'area_complete_pending'`
- và show popup `Finish the house to complete the area.`

Ngoài ra ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L711), `handleFlow2NodeClearContinue()` vẫn có nhánh:
- `isRegionCleared(curRegion) && !isFlow2CastleCompleted()`
- rồi set `flow2.step = 'area_complete_pending'`

Điều này cho thấy code hiện có hai nguồn cùng can thiệp vào finish-area state:
- nguồn mới: `house complete`
- nguồn cũ: `boss clear / area_complete_pending`

### 3. Popup finish khu vực và travel đang ở một nhánh khác
`showFlow2AreaCompletePopup()` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L688) và `handleFlow2AreaCompleteContinue()` ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L726) đã là nhánh `complete area -> unlock next region -> travel`.

Nhánh này tương đối ổn, nhưng nó đang bị bao quanh bởi nhiều state chuyển tiếp cũ, nên rất dễ:
- bị gọi không đúng lúc
- bị block bởi step cũ
- hoặc bị lặp một nửa

## Nhận định nguyên nhân gốc có khả năng cao nhất
Bug finish khu vực nhiều khả năng đến từ xung đột semantics:

### Nguồn sự thật mới
- `house complete => area complete`

### Nguồn sự thật cũ vẫn còn tồn tại
- `boss clear => area_complete_pending`
- `node clear continue => area_complete_pending`

Khi cả hai cùng tồn tại:
- step machine có thể đang nói “khu vực chưa complete, đang pending”
- trong khi build system lại nói “house complete, khu vực đã complete”

Đây là kiểu bug state machine điển hình: hai nhánh cùng có quyền phát ngôn về cùng một cột mốc gameplay.

## Quyết định kỹ thuật đề xuất
### 1. Chốt một nguồn sự thật duy nhất cho finish khu vực
Với design mới đã chốt ở plan house-task, hoàn thành khu vực phải bám vào:
- `isFlow2CastleCompleted()` theo nghĩa mới = house task hoàn tất

Khuyến nghị:
- chỉ một nhánh được phép chuyển sang `area_complete`
- các nhánh node/boss cũ không còn được set state finish-area nữa

### 2. `area_complete_pending` không nên còn là step nghiệp vụ chính
Nếu hệ mới không còn dùng completion kiểu `boss xong nhưng house chưa xong`, thì `area_complete_pending` chỉ còn là legacy state.

Khuyến nghị:
- bỏ hẳn việc set `area_complete_pending` ở boss/node clear path
- hoặc hạ nó xuống informational only, không tham gia quyết định flow

### 3. Boss clear popup chỉ nên là informational
Nếu player clear boss mà house chưa xong:
- chỉ show thông tin kiểu “Finish the house to complete the area”
- không set step completion nào cả

Điểm quan trọng:
- boss clear không được quyền mutate state finish-area

### 4. Build-complete path là nơi duy nhất được trigger finish khu vực
Sau task build cuối cùng:
- `performFlow2CastleMissionBuild()`
- gọi `maybeCompleteFlow2Area()`
- nếu complete thì show popup
- continue thì unlock/travel

Đây nên là pipeline duy nhất cho `finish khu vực` trong hệ mới.

## Phạm vi
### In scope
- Bug hoàn thành khu vực trong house-task scripted flow
- Xung đột giữa `area_complete_pending` và `house complete`
- Popup finish khu vực và travel sang vùng mới

### Out of scope
- Refactor toàn bộ node progression
- Đổi logic non-scripted castle slot mode
- Rebalance crown economy

## Kế hoạch triển khai
1. Audit toàn bộ mutation của finish-area state
   - tìm tất cả chỗ set:
     - `area_complete`
     - `area_complete_pending`
     - `areaCompleteShown`

2. Chốt lại semantics mới
   - `house complete` là điều kiện hoàn thành khu vực
   - boss clear không còn là state completion

3. Gỡ mutation cũ ở node/boss clear path
   - bỏ hoặc trung hòa các đoạn:
     - set `area_complete_pending`
     - popup boss-clear đang đóng vai trò nửa completion

4. Giữ build-complete path làm entry duy nhất cho area finish
   - task cuối xong
   - gọi `maybeCompleteFlow2Area()`
   - show popup complete

5. Rà lại `handleFlow2NodeClearContinue()`
   - đảm bảo hàm này không vô tình đẩy step vào nhánh completion cũ
   - chỉ xử lý:
     - open task
     - chest ready
     - về map

6. Retest các case chính
   - clear boss khi house chưa xong
   - build xong house khi boss chưa clear, nếu semantics mới cho phép
   - build xong house khi boss đã clear
   - popup complete
   - unlock và travel sang vùng mới

## Rủi ro / điểm cần lưu ý
1. Nếu bỏ `area_complete_pending` thiếu chỗ, các popup/info sau boss clear có thể mất nhịp dẫn hướng.
2. Nếu vẫn để boss path set step completion nhưng build path cũng complete, bug double-trigger sẽ còn nguyên.
3. `travelToRegion()` đang reset một số scripted state; cần kiểm tra để không reset nhầm ngay trong lúc popup completion vừa mở.
4. Nếu area complete popup phụ thuộc vào state cũ nào đó ngoài `areaCompleteShown`, fix nửa vời có thể tạo bug “popup không mở lại” ở vùng kế tiếp.

## Checklist QA
- Clear boss khi house chưa xong không tự complete khu vực sai lúc.
- House complete trigger đúng popup `Area Complete`.
- Popup `Area Complete` chỉ xuất hiện một lần.
- Continue từ popup unlock và travel sang vùng mới đúng.
- Sang vùng mới không bị kéo theo step completion cũ của vùng trước.
- Không còn trạng thái `pending` mâu thuẫn với state `house complete`.
