# Plan: Thay Ảnh Story Popup Cho 3 Khu Vực Đầu Tiên

## Mục tiêu
Thay ảnh trong `region story popup` cho 3 khu vực đầu tiên bằng đúng ảnh user cung cấp:

- Area 1 / `home`
  - `https://res.cloudinary.com/db37npbp6/image/upload/v1773850606/Gemini_Generated_Image_b2ziwdb2ziwdb2zi_mzetm4.png`
- Area 2 / `forest`
  - `https://res.cloudinary.com/db37npbp6/image/upload/v1773488268/Concept_3_Story_Overall_cmtikp.png`
- Area 3 / `desert`
  - `https://res.cloudinary.com/db37npbp6/image/upload/v1773488235/Concept_2_Story_Overall_npidjt.png`

Kết quả mong muốn:
- popup story của 3 khu vực đầu dùng đúng ảnh external
- khu vực 4-5 vẫn hoạt động bình thường
- không làm hỏng flow `auto open story popup`

## Hiện trạng code liên quan
### 1. Story popup config đang chỉ chứa text/palette
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L77), `REGION_STORY_POPUPS` hiện có:
- `title`
- `caption`
- `ctaLabel`
- `palette`
- icon/comic tokens

Nhưng chưa có field riêng để truyền `imageUrl`.

### 2. Ảnh hiện đang generate runtime bằng SVG
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L593), `getRegionStoryImageSrc(region)` đang luôn build một SVG `data:` URL từ config.

Điều này nghĩa là:
- mọi area hiện dùng ảnh generate nội bộ
- chưa có nhánh ưu tiên ảnh external do user cung cấp

### 3. Render popup đã sẵn sàng để nhận `src`
Ở [app.js](/Users/nguyenminhtri/.gemini/antigravity/scratch/game-prototype/app.js#L649), `showRegionStoryPopup(...)` chỉ cần một `imageSrc` để render `<img ...>`.

Tức là thay đổi chính nằm ở:
- config data
- hàm resolve image source

## Nhận định nguyên nhân
Hệ hiện tại không “thiếu chỗ render ảnh”, mà thiếu một lớp config để override ảnh theo khu vực.

Nói ngắn gọn:
- UI popup đã đúng
- luồng mở popup đã đúng
- chỉ thiếu mapping `region.id -> external story image`

## Quyết định kỹ thuật đề xuất
### 1. Thêm field `imageUrl` vào `REGION_STORY_POPUPS`
Cho 3 vùng đầu:
- `home`
- `forest`
- `desert`

gắn trực tiếp URL user cung cấp.

### 2. `getRegionStoryImageSrc(region)` ưu tiên external image trước
Logic đề xuất:
1. nếu config có `imageUrl` thì return URL đó
2. nếu không có thì fallback về SVG generate như hiện tại

Cách này giữ an toàn cho:
- `snow`
- `volcano`
- mọi area mới nếu sau này chưa có ảnh thật

### 3. Không đổi markup popup
Không cần đổi `showRegionStoryPopup(...)` hoặc CSS chính,
vì `<img class="region-story-image" ...>` đã dùng được cho cả:
- external PNG
- external hosted image
- generated SVG

## Phạm vi
### In scope
- thêm config ảnh cho 3 area đầu
- cập nhật image resolver cho story popup
- QA popup hiển thị đúng ảnh ở `home / forest / desert`

### Out of scope
- redesign popup
- preload/cache strategy
- đổi story text/caption
- thay ảnh cho area 4 và 5

## Kế hoạch triển khai
1. Cập nhật `REGION_STORY_POPUPS`
   - thêm `imageUrl` cho `home`
   - thêm `imageUrl` cho `forest`
   - thêm `imageUrl` cho `desert`

2. Refactor `getRegionStoryImageSrc(region)`
   - check `config.imageUrl`
   - return external URL nếu có
   - fallback SVG nếu không có

3. Retest 3 case
   - start flow ở area 1
   - travel sang area 2
   - travel sang area 3

4. Smoke test fallback
   - area 4 / 5 vẫn mở popup bình thường bằng art generate

## Rủi ro / điểm cần lưu ý
1. Nếu external host chặn hotlink hoặc ảnh lỗi tải, popup sẽ ra khung trống.
2. Ảnh external có tỷ lệ khác ảnh generate, nên cần kiểm tra `object-fit: cover` hiện tại có crop quá nhiều không.
3. Nếu sau này cần offline/local bundle, cách dùng URL trực tiếp sẽ phải thay lại.

## Checklist QA
- Area 1 popup hiện đúng ảnh user cung cấp.
- Area 2 popup hiện đúng ảnh user cung cấp.
- Area 3 popup hiện đúng ảnh user cung cấp.
- Area 4-5 vẫn có story popup bằng fallback hiện tại.
- Popup không vỡ layout khi ảnh external load.
