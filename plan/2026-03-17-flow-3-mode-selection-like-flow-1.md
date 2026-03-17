# Plan: Flow 3 - Thêm Chọn 2 Mode Casino / Kingdom Như Flow 1

## Mục tiêu
Điều chỉnh `Flow 3` để người chơi có thể chuyển giữa `Casino` và `Kingdom` giống trải nghiệm của `Flow 1`, thay vì bị khóa cứng vào `Kingdom` như `Flow 2`.

Kết quả mong muốn:
- Khi vào `Flow 3`, người chơi thấy UI chọn mode `Casino / Kingdom`.
- Có thể chuyển qua lại giữa 2 mode trong `Flow 3`.
- `Flow 2` vẫn giữ behavior kingdom-only như hiện tại.
- `Flow 1` không bị ảnh hưởng.

## Hiện trạng code liên quan
- `Flow 3` hiện đang dùng chung scripted-flow engine với `Flow 2`.
- Nhiều gate runtime đang dùng `isFlow2Active()`, nhưng thực tế helper này hiện đúng cho cả `Flow 2` lẫn `Flow 3`.
- Các điểm đang khiến `Flow 3` không có mode selection:
  - `modeCenterTabsHtml()` trả rỗng khi `isFlow2Active()`.
  - `switchMode()` chặn chuyển khỏi `kingdom` khi `isFlow2Active()`.
  - `startGame(flowId)` đang force scripted flow vào:
    - `state.mode = 'kingdom'`
    - `state.screen = 'home'`
  - top bar scripted-flow hiện render theo kiểu kingdom-only action set.

Nói ngắn gọn: `Flow 3` hiện đang bị “thừa hưởng nhầm” các rule kingdom-only của `Flow 2`.

## Phạm vi
- In scope:
  - Cho `Flow 3` hiển thị tab/màn chọn mode `Casino / Kingdom`.
  - Cho phép `switchMode('casino')` trong `Flow 3`.
  - Giữ `Flow 3` kingdom content hiện có khi chuyển sang mode `kingdom`.
  - Reuse casino home/slot hiện có từ flow gốc.
  - Giữ `Flow 2` kingdom-only.
- Out of scope (MVP):
  - Tạo casino content riêng biệt chỉ cho `Flow 3`.
  - Thiết kế flow onboarding mới cho nhánh casino của `Flow 3`.
  - Đồng bộ progression giữa casino và kingdom theo rule mới.

## Quyết định kỹ thuật đề xuất
1. Không nên tiếp tục dùng `isFlow2Active()` như cờ capability chung cho cả `Flow 2` và `Flow 3`.
2. Cần tách rõ:
   - `flow nào đang active`
   - `flow nào là scripted`
   - `flow nào là kingdom-only`
   - `flow nào được hiện mode tabs`
3. `Flow 2`:
   - vẫn kingdom-only
   - vẫn không hiện `Casino / Kingdom` tabs
4. `Flow 3`:
   - vẫn dùng scripted kingdom content khi vào `kingdom`
   - nhưng được hiện mode tabs và được chuyển sang `casino`

## Đề xuất capability flags
Trong `SCRIPTED_FLOW_CONFIGS` thêm các cờ:
- `kingdomOnly`
- `showModeTabs`
- `defaultMode`
- `defaultScreen`

Gợi ý config:
- `Flow 2`
  - `kingdomOnly: true`
  - `showModeTabs: false`
  - `defaultMode: 'kingdom'`
  - `defaultScreen: 'home'`
- `Flow 3`
  - `kingdomOnly: false`
  - `showModeTabs: true`
  - `defaultMode: 'casino'` hoặc `kingdom` tùy quyết định UX
  - `defaultScreen: 'home'`

Khuyến nghị MVP:
- `Flow 3` vào `casino` trước để người chơi lập tức thấy trải nghiệm “2 mode”.

## Helper mới cần có
Thay vì dựa hết vào `isFlow2Active()`, bổ sung helper rõ nghĩa:
- `isScriptedFlowActive()`
- `isKingdomOnlyFlow()`
- `shouldShowModeTabs()`
- `canUseCasinoMode()`
- `getActiveFlowConfig()`

Các helper cũ tên `Flow2...` có thể giữ tạm để giảm diff, nhưng các rule UI/capability nên đọc từ config mới.

## Kế hoạch triển khai
1. Tách gate capability khỏi gate active flow
   - Audit tất cả chỗ đang dùng `isFlow2Active()`.
   - Phân loại:
     - gate vì scripted flow
     - gate vì kingdom-only
     - gate vì Flow 2 onboarding

2. Mở mode tabs cho Flow 3
   - Sửa `modeCenterTabsHtml()` để không còn ẩn tabs cho toàn bộ scripted flow.
   - Chỉ ẩn tabs với flow có `showModeTabs: false`.

3. Mở `switchMode()` cho Flow 3
   - `switchMode()` chỉ chặn rời `kingdom` nếu flow hiện tại là `kingdomOnly`.
   - `Flow 3` phải chuyển được sang `casino`.

4. Sửa khởi tạo `startGame(3)`
   - Không force `Flow 3` vào kingdom-only như `Flow 2`.
   - Lấy `defaultMode/defaultScreen` từ config của flow.
   - `Flow 2` vẫn giữ setup hiện tại.

5. Render top bar theo mode thay vì scripted-only
   - Khi `Flow 3` ở `casino`, top bar phải dùng UI của casino mode.
   - Khi `Flow 3` ở `kingdom`, top bar có thể tiếp tục dùng scripted kingdom actions.

6. Giữ kingdom branch của Flow 3 nguyên vẹn
   - `renderFlow2KingdomHome`
   - `renderFlow2KingdomSlot`
   - `renderFlow2CastleScreen`
   vẫn tiếp tục được dùng khi `Flow 3` ở mode `kingdom`.

7. Reuse casino branch hiện có cho Flow 3
   - `Flow 3` ở `casino` dùng render `casino home` và `casino-slot` hiện tại.
   - Không cần content riêng trong MVP.

8. Dọn text và docs
   - Bổ sung mô tả rằng `Flow 3` là hybrid:
     - có mode tabs như `Flow 1`
     - có scripted kingdom branch như `Flow 2`

## Ảnh hưởng đến UX
### Flow 2
- Không đổi.
- Vẫn đi thẳng vào `kingdom`.
- Vẫn bị khóa khỏi `casino`.

### Flow 3
- Có tab `Casino / Kingdom`.
- Có thể vào `casino` như flow thường.
- Khi chuyển sang `kingdom`, tiếp tục dùng content/scripted loop của Flow 3 hiện tại.

## Rủi ro / điểm cần lưu ý
1. Hiện helper `isFlow2Active()` đang ôm nhiều ý nghĩa cùng lúc, nên sửa thiếu một chỗ sẽ làm `Flow 3` nửa mở mode, nửa còn bị khóa.
2. Nếu `startGame(3)` vẫn force `mode='kingdom'`, người chơi có thể thấy tabs nhưng không cảm nhận rõ “màn chọn mode”.
3. Top bar scripted-flow và top bar casino đang khác nhau; cần tránh render lẫn control sai mode.
4. Chuyển mode khi đang có popup/panel mở cần reset gọn để không mang panel kingdom sang casino.

## Checklist QA
- Vào `Flow 3` thấy tab `Casino / Kingdom` như `Flow 1`.
- `Flow 3` chuyển từ `casino -> kingdom -> casino` được.
- `Flow 3` ở `casino` dùng đúng casino home và casino slot.
- `Flow 3` ở `kingdom` vẫn giữ loop scripted kingdom hiện có.
- `Flow 2` vẫn không hiện mode tabs và vẫn bị khóa ở kingdom.
- `Flow 1` giữ nguyên behavior cũ.
