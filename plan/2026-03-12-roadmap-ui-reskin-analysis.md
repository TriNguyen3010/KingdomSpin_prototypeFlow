# Plan: Phân Tích UI Roadmap Để Reskin

## Mục tiêu
Phân tích đầy đủ các phần tử UI trong màn roadmap (table + timeline) để chuẩn bị reskin mà không làm mất hành vi cốt lõi.

## Phạm vi
- In scope:
  - Inventory toàn bộ thành phần UI nhìn thấy trong ảnh.
  - Tách phần nào là `functional invariant` (không đổi hành vi) và phần nào là `skin surface` (đổi visual).
  - Đề xuất token/tier reskin: màu, typography, spacing, radius, border, elevation, state.
  - Đưa ra checklist QA cho reskin.
- Out of scope:
  - Thay đổi logic business (gating task, progress rule, permission).
  - Thiết kế lại flow nghiệp vụ hoặc IA tổng thể.
  - Thay đổi data model backend.

## Phân tích phần tử UI (component inventory)
1. Global top bar
   - Brand block bên trái: logo + tên workspace/phiên bản.
   - View switcher: `Web / App / Reported`.
   - Time granularity/filter: `Week`.
   - Action cluster bên phải: `Editor`, `Filter`, `Save`, `Setting`.
2. Grid shell
   - Bảng trái dạng cột cố định: `ID`, `FEATURES`, `STATUS`, `WEEK` + icon cột phụ.
   - Timeline phải dạng calendar grid theo tuần/ngày.
   - Đường phân tách dọc giữa table và timeline.
3. Timeline header
   - Header tuần (`Week 1`, `Week 2`) có màu nền phân đoạn.
   - Header mốc thời gian (`W09`, `W10`, ...).
   - Header ngày trong tuần (`M/T/W/T/F/SA/SU`) với cuối tuần tô màu khác.
4. Row system (hierarchy + grouping)
   - Row cấp cao (epic/group) nền xanh nhạt.
   - Row nhóm trung gian (Web/App/Core) nền xanh lá nhạt.
   - Row task chi tiết nền trung tính.
   - Expand/collapse indicator.
5. Task metadata cell
   - Status pill: `Dev In Progress`, `PD In Progress`, `Not Started`, ...
   - Week chip: `Week 1`, `Week 2`.
   - Icon trạng thái/phụ trợ (link, note, issue, check, ...).
6. Timeline body
   - Task bar nằm trên trục thời gian (xanh dương/cam).
   - Vùng tuần tô nền (xanh/xám) theo phase.
   - Vạch “today” màu đỏ.
7. Floating action
   - Nút tròn góc dưới phải (quick action/calendar).

## Functional invariants vs skin surfaces
1. Functional invariants (giữ nguyên)
   - Cấu trúc bảng trái + timeline phải.
   - Khả năng đọc hierarchy theo indent/cấp row.
   - Mapping task row <-> timeline bar.
   - Trạng thái task qua pill/chip/badge.
   - Vạch today và vùng tuần.
2. Skin surfaces (reskin được)
   - Bảng màu tổng thể (neutral + semantic).
   - Typography family/scale/weight.
   - Radius, border thickness, shadow, độ đậm separator.
   - Kiểu pill/chip/button/icon button.
   - Màu và hình dạng task bar.
   - Nền header/timeline/weekend/today highlight.

## Gợi ý hệ token cho reskin
1. Color tokens
   - `bg.canvas`, `bg.surface`, `bg.elevated`, `bg.row.group`, `bg.row.section`.
   - `text.primary`, `text.secondary`, `text.muted`.
   - `border.subtle`, `border.strong`, `divider`.
   - `accent.primary`, `accent.success`, `accent.warning`, `accent.info`.
   - `timeline.today`, `timeline.weekend`, `timeline.phase`.
2. Typography tokens
   - `font.family.ui`, `font.family.data`.
   - `text.xs/sm/md/lg`, `weight.regular/medium/semibold/bold`.
3. Shape & spacing tokens
   - `radius.sm/md/lg/pill`.
   - `space.2/4/6/8/12/16/20/24`.
4. Motion/state tokens
   - `duration.fast/base`, `easing.standard`.
   - `state.hover`, `state.active`, `state.selected`, `state.focus`.

## Kế hoạch triển khai reskin
1. Chuẩn hóa component map
   - Chốt naming cho các khối: `TopBar`, `ViewTabs`, `ActionButtons`, `RoadmapTable`, `TimelineHeader`, `TimelineBar`, `StatusPill`.
2. Tách semantic color khỏi hardcode
   - Đổi màu cứng trong CSS/JS thành token variable.
3. Reskin theo tầng
   - Tầng 1: shell + top bar + button/tab.
   - Tầng 2: table rows + header + divider.
   - Tầng 3: status pill/chip + timeline bar + today line.
4. Kiểm tra density
   - So sánh readability ở 100% zoom và khi data dày.
5. A11y pass
   - Contrast, focus ring, keyboard traversal cho top actions/filter.

## Checklist QA
- Hierarchy row vẫn đọc rõ sau reskin (epic/group/task).
- Task bar vẫn align đúng row và đúng mốc thời gian.
- Vạch today luôn nổi bật nhưng không gây nhiễu.
- Status pill/chip phân biệt rõ các trạng thái.
- Header tuần/ngày dễ đọc ở mọi zoom phổ biến (90%/100%/110%).
- Hover/active/focus nhất quán giữa button, tab, row và icon action.
- Không giảm contrast dưới mức chấp nhận cho text nhỏ.

