# Plan: Relayout Màn Home Flow 3 Khi Nội Dung Đang Chồng Lên Nhau

## Mục tiêu
Layout lại màn `Home` của `Flow 3` để các khối nội dung không còn chồng lên nhau, đặc biệt ở vùng đầu màn hình.

Kết quả mong muốn:
- `Casino / Kingdom` tabs, title `Home`, castle CTA và progress pill có thứ tự rõ ràng, không đè nhau.
- `map nodes` được đẩy xuống đúng vùng hiển thị thay vì ăn vào header area.
- Khi mở task panel, layout tổng thể vẫn ổn định.
- Không làm hỏng layout của `Flow 2` và `Flow 1`.

## Hiện trạng code liên quan
Markup của màn `Home` scripted flow đang được render trong [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L898):
- `modeCenterTabsHtml()`
- `.map-region-nav` chứa title vùng (`Home`)
- `.flow2-map-top-strip` chứa castle CTA và progress pill
- `.map-nodes`
- `renderFlow2TaskPanel()`

CSS đang chia các block này theo nhiều hệ positioning khác nhau:
- tabs ở normal flow tại [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L153)
- title vùng `.map-region-nav` là `absolute` tại [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L874) và override cho Flow 3 ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2296)
- top strip là `absolute` tại [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2300)
- map nodes là `absolute` tại [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L912)
- task panel là `absolute` tại [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2376)

Nói ngắn gọn: cùng một màn nhưng đang trộn `normal flow` với nhiều block `absolute`, nên chỉ cần một block tăng chiều cao là các block còn lại đè lên nhau.

## Giả thuyết nguyên nhân
1. `mode tabs` nằm trong flow bình thường, nhưng title và top strip lại neo bằng `top` cố định.
2. `map-nodes` đang neo ở `top: 55%`, không hề biết header phía trên cao bao nhiêu.
3. `task panel` cũng neo tuyệt đối vào góc phải, nên khi header cao hơn hoặc viewport thấp hơn sẽ làm màn nhìn bị chật và chồng.
4. Responsive rules hiện tại chỉ wrap `flow2-map-top-strip`, chưa giải quyết vấn đề phân vùng bố cục tổng thể.

## Phạm vi
- In scope:
  - Sắp xếp lại layout màn `Home` của `Flow 3`.
  - Tạo khoảng không rõ ràng cho header area và map area.
  - Giữ logic gameplay, tutorial, node/chest progression như cũ.
- Out of scope:
  - Đổi art/UI theme của màn map.
  - Refactor toàn bộ map system cho mọi flow nếu không cần.
  - Đổi thứ tự gameplay hoặc state machine.

## Định hướng layout đề xuất
### Hướng ưu tiên: Header stack + map stage
1. Tạo một vùng `header stack` ở đầu màn gồm:
   - mode tabs
   - region title
   - castle CTA + progress pill
2. Bên dưới là một vùng `map stage` chiếm phần còn lại của màn.
3. `map-nodes` phải canh giữa trong `map stage`, không canh theo toàn màn nữa.
4. `task panel` cần có vị trí riêng:
   - hoặc nằm như floating panel nhưng tránh đè header
   - hoặc chuyển sang bám cạnh/phần dưới có khoảng đệm rõ ràng

### Vì sao nên làm cách này
- Sửa được gốc vấn đề thay vì tiếp tục vá `top: 34px`, `top: 112px`, `top: 55%`.
- Flow 3 đang có thêm tabs so với Flow 2, nên layout cũ của Flow 2 không còn đủ chỗ theo chiều dọc.
- Sau này thêm tutorial arrow hay state card khác sẽ ít vỡ hơn.

## Kế hoạch triển khai
1. Audit lại cấu trúc layout màn Home scripted flow
   - xác định block nào nên ở header
   - block nào nên ở map stage

2. Tách layout thành 2 vùng rõ ràng
   - header stack
   - map body / map stage

3. Đổi positioning của các block header
   - giảm phụ thuộc vào `absolute`
   - chỉ giữ `absolute` cho những phần thật sự cần overlay

4. Neo lại `map-nodes`
   - canh theo vùng map body
   - thêm khoảng đệm để node row đầu không đè lên CTA/title

5. Rà lại task panel
   - tránh chồng với header stack
   - giữ được usability khi panel mở

6. Retest trên Flow 3
   - Home mặc định
   - Home khi chest đầu đã claim
   - Home khi task panel mở
   - Home trong tutorial force-click states

7. Smoke test cho Flow 2
   - chắc rằng kingdom-only layout không bị regression nặng

## Phương án kỹ thuật khả thi
### Phương án A: Chỉ CSS relayout
- Giữ markup gần như cũ.
- Dùng thêm wrapper/layout rules để phân tầng header-map.

Ưu điểm:
- Diff nhỏ hơn

Rủi ro:
- Nếu markup hiện tại thiếu wrapper phù hợp, CSS sẽ phải “bẻ” nhiều selector và dễ để lại nợ kỹ thuật.

### Phương án B: Chỉnh nhẹ markup + CSS
- Thêm wrapper kiểu:
  - `flow2-map-header`
  - `flow2-map-body`
- Sau đó cho CSS layout rõ ràng theo hai vùng này.

Ưu điểm:
- Sạch hơn, dễ bảo trì hơn
- Hợp với bug này vì đây là lỗi cấu trúc

Khuyến nghị:
- MVP nên đi theo `Phương án B`.

## Rủi ro / điểm cần lưu ý
1. `Flow 2` và `Flow 3` đang dùng chung renderer `renderFlow2KingdomHome(...)`, nên mọi đổi layout phải có ý thức giữ compatibility.
2. `tutorial-arrow-target` có pseudo-element, nên khi đổi wrapper cần kiểm tra lại z-index và overflow.
3. `map-nodes` đang dùng positioning liên quan tới chest/path line; đổi parent container cần retest alignment kỹ.
4. Nếu task panel tiếp tục là `absolute`, phải kiểm tra các breakpoint thấp chiều cao.

## Checklist QA
- Tabs `Casino / Kingdom` không đè lên title `Home`.
- Title `Home` không đè lên castle CTA.
- Castle CTA và progress pill không đè lên node row đầu.
- Task panel mở ra không che phần header chính.
- Node/chest/path line vẫn đúng vị trí.
- Tutorial arrows ở Flow 3 vẫn chỉ đúng target.
- Flow 2 không bị vỡ layout rõ rệt sau khi share renderer.
