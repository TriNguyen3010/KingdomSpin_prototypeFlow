# Plan: Hệ Thống Task Xây Nhà Theo Khu Vực

## Mục tiêu
Thiết kế lại hệ `task xây nhà` để trở thành một gameplay loop rõ ràng theo từng khu vực:
- thắng mỗi màn / node sẽ nhận `+1 crown`
- rương cũng thưởng thêm `crown`
- mỗi khu vực có đúng `1 nhà`
- mỗi nhà được chia thành `3` hoặc `4` phần xây dựng
- mỗi phần là `1 task`
- task build dùng `crown` làm chi phí
- khi không đủ crown, player vẫn vào xem được màn build để biết:
  - phần đang cần xây là gì
  - giá hiện tại là bao nhiêu
- khi hoàn thành toàn bộ nhà của khu vực:
  - hiện popup chúc mừng hoàn thành khu vực
  - chuyển player sang khu vực mới

Kết quả mong muốn:
- `task modal`, `crown economy`, `castle/house screen`, và `area progression` cùng nói một ngôn ngữ gameplay
- không còn cảm giác task build chỉ là một nhánh tutorial cứng
- reward từ thắng màn và rương có mục đích rõ: nuôi tiến độ xây nhà

## Hiện trạng code liên quan
### 1. Reward crown hiện đã có, nhưng loop còn rời rạc
Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2864), nhánh clear node hiện đã cộng `+1 crown`.

Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2663), `claimChest(...)` cũng cộng thêm `chest.reward.crowns`.

Điều này nghĩa là economy nền tảng đã có, nhưng mới dừng ở mức “có crown”, chưa được tổ chức thành một task system thống nhất.

### 2. Task build hiện còn là danh sách cứng 2 mission
Trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L23), `FLOW2_CASTLE_MISSIONS` hiện chỉ có:
- `build_castle`
- `build_fountain`

Danh sách này:
- không đại diện cho `1 nhà / mỗi khu vực`
- không support `3-4 phần / mỗi nhà`
- không gắn với house part cụ thể theo từng khu vực

### 3. Màn build hiện có 2 hệ tách rời nhau
Code hiện đang có:
- hệ scripted task/build ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L505), [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1152)
- hệ castle upgrade chung theo slot ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2146), [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L2987)

Nói ngắn gọn:
- một bên là `task mission list`
- một bên là `slot-based building`
- hai hệ chưa thật sự là một loop thống nhất

### 4. Completion của khu vực hiện chưa bám đúng “xây xong nhà”
Hiện scripted flow đang dùng các step kiểu:
- `area_complete_pending`
- `area_complete`

và popup ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L612) vẫn mô tả theo logic cũ:
- clear boss
- complete castle

Yêu cầu mới cần một semantics khác:
- hoàn thành `toàn bộ house parts` của khu vực
- hiện popup hoàn thành khu vực
- chuyển player qua khu vực kế tiếp

## Yêu cầu nghiệp vụ
### 1. Crown economy
- thắng mỗi màn / node: `+1 crown`
- rương: thưởng thêm crown
- build task: tiêu crown

### 2. House theo khu vực
- mỗi khu vực có `1 nhà`
- nhà có `3` hoặc `4` phần
- ví dụ:
  - `Foundation`
  - `Main Hall`
  - `Roof`
  - `Decoration`

Không yêu cầu mọi khu vực phải giống hệt nhau về số phần hoặc tên phần.

### 3. Task system
- mỗi phần của nhà là `1 task`
- chỉ có `1 task active` tại một thời điểm
- xây xong phần hiện tại thì mở khóa phần tiếp theo
- task modal phải phản ánh đúng:
  - phần nào đã xong
  - phần nào đang active
  - phần nào còn locked

### 4. Build screen
- player luôn vào được màn build để xem tiến độ và giá
- nếu đủ crown:
  - có thể bấm build
- nếu không đủ crown:
  - vẫn xem được phần đang active
  - thấy giá crown
  - thấy thông tin “cần thắng thêm màn / claim chest để build tiếp”

### 5. Hoàn thành khu vực
- khi phần cuối của nhà được build xong:
  - hiện popup chúc mừng hoàn thành khu vực
  - unlock khu vực mới
  - chuyển player sang khu vực mới

## Quyết định thiết kế đề xuất
### 1. Thống nhất model thành `regional house build tasks`
Khuyến nghị không giữ song song:
- `FLOW2_CASTLE_MISSIONS` dạng cứng
- và `castle.slots` dạng upgrade riêng

Thay vào đó, tạo một model chung cho mỗi khu vực, ví dụ:

```js
region.house = {
  id: "home_house",
  name: "Home House",
  completed: false,
  tasks: [
    { id: "foundation", title: "Build foundation", cost: 1, status: "active" },
    { id: "hall", title: "Build main hall", cost: 2, status: "locked" },
    { id: "roof", title: "Build roof", cost: 2, status: "locked" },
    { id: "decor", title: "Add decorations", cost: 3, status: "locked" }
  ]
}
```

Điểm quan trọng:
- task nằm dưới `region`
- không dùng một list global 2 item cho mọi nơi nữa

### 2. House progress là ground truth của khu vực
Tiến độ khu vực nên được đọc từ:
- `house.tasks`
- hoặc `house.completedParts`

chứ không nên dựa vào nhiều cờ step rời rạc.

### 3. Build screen chỉ là viewer + executor cho task active
Màn build cần luôn mở được.

Nếu đủ crown:
- nút `Build` active

Nếu không đủ crown:
- nút `Build` disabled hoặc đổi copy
- hiện:
  - `Need X more crowns`
  - `Win nodes or claim chests to continue`

### 4. Task modal là view của cùng một dữ liệu
Task modal không giữ dữ liệu riêng.
Nó chỉ render từ cùng nguồn `region.house.tasks`.

Như vậy:
- modal
- build screen
- progress pill
- completion popup

đều đồng bộ theo cùng một house progression.

### 5. Khu vực hoàn thành khi nhà hoàn thành
Yêu cầu mới cho thấy `hoàn thành khu vực` phải gắn chặt với `xây xong nhà`.

Khuyến nghị logic:
- node clear cho crown
- chest cho crown bonus
- house build dùng crown
- task cuối cùng build xong => `region complete`

Nếu vẫn cần boss/node gate, gate đó nên là điều kiện mở task hoặc mở khu vực, không phải điều kiện cạnh tranh mơ hồ với house completion.

## Phạm vi
### In scope
- Model task xây nhà theo khu vực
- Crown economy cho build
- Build screen cho trạng thái đủ/thiếu crown
- Completion popup khi hoàn thành nhà
- Auto move/unlock sang khu vực mới

### Out of scope
- Thiết kế mỹ thuật cuối cùng cho từng căn nhà
- Balancing kinh tế crown chi tiết cho toàn game
- Viết thêm nhiều loại reward ngoài crown/chest
- Refactor toàn bộ flow system ngoài phần liên quan task build

## Kế hoạch triển khai
1. Định nghĩa data model cho nhà theo khu vực
   - thêm `region.house` hoặc tương đương
   - mỗi `house` có `3-4 tasks`
   - xác định task đầu `active`, các task sau `locked`

2. Thay list task cứng bằng task theo khu vực
   - loại bỏ dependency vào `FLOW2_CASTLE_MISSIONS` kiểu 2 item chung
   - `getFlow2CastleMissions()` hoặc helper tương tự phải trả task của khu vực hiện tại

3. Gắn crown economy vào build loop
   - giữ `+1 crown` khi thắng node
   - giữ chest crown reward
   - build task trừ crown theo `task.cost`

4. Cập nhật task modal
   - render progress theo house tasks
   - show `Done / Active / Locked`
   - show cost của task active

5. Cập nhật build screen
   - luôn cho vào xem
   - nếu thiếu crown thì vẫn thấy:
     - task active là gì
     - giá bao nhiêu
     - còn thiếu bao nhiêu crown
   - nếu đủ crown thì cho bấm build

6. Hoàn tất 1 task build
   - trừ crown
   - đánh dấu task hiện tại là `done`
   - mở task tiếp theo
   - update visual của nhà tương ứng với số phần đã xây

7. Hoàn tất task cuối cùng của nhà
   - đánh dấu `house completed`
   - mở popup chúc mừng hoàn thành khu vực
   - unlock khu vực kế tiếp
   - chuyển player sang khu vực mới

8. Dọn logic completion cũ
   - audit `area_complete_pending`, `area_complete`, `castle completed`, `claimCastleCompletionBonus()`
   - bỏ hoặc hạ cấp các branch không còn khớp với loop mới

9. Retest theo 1 vòng đầy đủ
   - thắng node
   - nhận crown
   - claim chest
   - mở task/build screen khi thiếu crown
   - build từng phần nhà
   - hoàn thành nhà
   - xem popup hoàn thành khu vực
   - auto chuyển sang khu vực mới

## Rủi ro / điểm cần lưu ý
1. Hiện code đang có 2 hệ build (`scripted mission` và `castle slot upgrade`); nếu không chốt một nguồn dữ liệu duy nhất thì UI sẽ lệch trạng thái.
2. Nếu task build vẫn phụ thuộc step tutorial cũ, sau này qua khu vực 2 trở đi sẽ rất khó scale.
3. `unlock khu vực mới` hiện đang xuất hiện ở nhiều nhánh node/boss; cần gom lại để không bị unlock hai lần.
4. Nếu build screen vẫn cấm vào khi thiếu crown, loop “vào xem để biết giá và cần xây gì tiếp” sẽ không đạt.
5. Nếu popup hoàn thành khu vực không nằm đúng ở task cuối của nhà, player sẽ thấy mốc hoàn thành khó hiểu.

## Checklist QA
- Mỗi node thắng được `+1 crown`.
- Rương cộng thêm crown đúng như config.
- Mỗi khu vực chỉ có `1 nhà`.
- Mỗi nhà có `3` hoặc `4` task build riêng.
- Mỗi lần chỉ có `1 task active`.
- Khi thiếu crown vẫn vào xem build screen được.
- Build screen cho biết rõ task hiện tại và cost crown.
- Build xong 1 phần thì mở task tiếp theo.
- Build xong phần cuối thì hiện popup hoàn thành khu vực.
- Sau popup, player được chuyển sang khu vực mới.
- Không còn trạng thái task/build/completion nói mâu thuẫn nhau giữa modal và build screen.
