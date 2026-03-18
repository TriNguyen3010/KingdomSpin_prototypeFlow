# Plan: Remove House Summary Strip Khỏi Flow 3 Home

## Mục tiêu
Bỏ block thông tin ở màn `Home` của scripted flow đang hiển thị:
- `HOUSE`
- subtitle task hiện tại như `Raise the walls`
- pill progress như `1/3 TASKS`

Kết quả mong muốn:
- màn `Home` gọn lại, không còn top strip này
- map node là trọng tâm chính của màn hình
- flow build/task vẫn còn đường vào hợp lệ, không làm user bị kẹt

## Hiện trạng code liên quan
### 1. Block này đang được render ở header của `Home`
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1443), `renderFlow2KingdomHome(...)` đang render:
- `renderFlow2MapCastleAnchor()`
- `flow2-map-progress-pill`

Toàn bộ nằm trong `flow2-map-top-strip`.

### 2. Phần `HOUSE / subtitle` không chỉ là thông tin, mà còn là CTA
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L1379), `renderFlow2MapCastleAnchor()` hiện trả về:
- button `flow2-map-castle-anchor`
- `onclick="openFlow2ActiveMission()"`

Tức là nếu xóa block này mà không dời CTA sang nơi khác, user sẽ mất đường mở `House task popup`.

### 3. CSS layout của cụm này đang chiếm riêng một strip trên header
Ở [styles.css](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/styles.css#L2344), `flow2-map-top-strip` đang layout riêng:
- house summary card bên trái
- progress pill bên phải

Việc remove block này sẽ kéo theo cleanup layout/header spacing.

## Nhận định
Bug/issue ở đây không chỉ là dư thông tin, mà là dư một surface UI lớn ngay trên map:
- làm phân tán focus khỏi node progression
- trùng vai trò với `House task popup`
- chiếm chỗ dọc ở `Home`

Nhưng cần lưu ý:
- block này đang đồng thời đóng vai trò manual entry vào house task
- nếu remove hoàn toàn mà không có fallback, user có thể không biết mở task ở đâu sau khi đã đóng popup

## Quyết định kỹ thuật đề xuất
### 1. Remove toàn bộ `house summary strip` khỏi `Home`
Bỏ:
- `renderFlow2MapCastleAnchor()`
- `flow2-map-progress-pill`
- wrapper `flow2-map-top-strip`

### 2. Không dùng `Home header` làm entry point cho task nữa
Đề xuất với scripted Flow 3:
- `House task popup` được mở theo các trigger flow
- các bước cần build sẽ tự bật popup đúng lúc

Nếu vẫn cần manual reopen về sau, nên dùng CTA khác nhỏ hơn và ít gây nhiễu hơn, không giữ lại summary strip cũ.

### 3. Cleanup spacing/layout sau khi bỏ strip
Sau khi remove:
- `flow2-map-header` cần co lại
- `flow2-map-content` cần nhích lên để map không bị hẫng
- responsive rules liên quan tới top strip cần cleanup

## Phạm vi
### In scope
- remove block `HOUSE / task subtitle / x/y TASKS` khỏi scripted `Home`
- cleanup markup và CSS liên quan
- đảm bảo flow task/build vẫn tiếp tục được

### Out of scope
- redesign toàn bộ entry UX cho house task ngoài scripted flow
- đổi nội dung task popup
- đổi progression/task system

## Kế hoạch triển khai
1. Gỡ render top strip khỏi `renderFlow2KingdomHome(...)`
   - remove `renderFlow2MapCastleAnchor()`
   - remove `flow2-map-progress-pill`
   - remove `flow2-map-top-strip`

2. Cleanup helper không còn dùng
   - audit `renderFlow2MapCastleAnchor()`
   - nếu scripted branch không còn dùng, gỡ hẳn hoặc để dead-code cleanup cùng lúc

3. Chỉnh layout CSS của `Home`
   - bỏ style của top strip nếu không còn dùng
   - cân lại khoảng cách giữa tabs, title vùng và map stage
   - kiểm tra mobile breakpoint

4. Retest flow build/task
   - node win -> task popup
   - close popup -> step tiếp theo có còn trigger đúng không
   - khi cần build tiếp, user còn được dẫn vào task popup bằng flow hay không

## Rủi ro / điểm cần lưu ý
1. Xóa strip này mà không còn CTA thay thế có thể làm user mất đường manual access vào build task.
2. Một số tutorial arrow cũ có thể từng gắn vào `flow2-map-castle-anchor`; cần audit để tránh arrow trỏ vào node không còn tồn tại.
3. Nếu chỉ xóa markup mà không cleanup spacing CSS, header có thể để lại khoảng trống vô nghĩa.

## Checklist QA
- Màn `Home` không còn thấy block `HOUSE / Raise the walls / 1/3 TASKS`.
- Header/map không bị hẫng layout sau khi bỏ strip.
- Flow 3 vẫn tự mở `House task popup` đúng lúc khi cần build.
- Không còn mũi tên/tutorial nào trỏ vào block đã bị remove.
- Không có bước nào của Flow 3 bị kẹt vì mất entry từ `flow2-map-castle-anchor`.
