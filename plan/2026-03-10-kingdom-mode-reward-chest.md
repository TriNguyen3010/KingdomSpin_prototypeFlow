# Plan: Kingdom Mode - Reward Chest Giữa Node

## Mục tiêu
Thêm `reward chest` nằm giữa các node trong Kingdom map, có thể claim khi đủ điều kiện.

## Phạm vi
- In scope:
  - Data model chest theo region
  - Render chest trên map giữa node
  - Logic claim reward (coins + crowns)
  - CSS trạng thái `locked/claimable/claimed`
  - Cập nhật flow docs
- Out of scope (MVP):
  - Buff/tạm thời theo thời gian
  - Reset theo ngày
  - Persistence localStorage/server

## Thiết kế rule
1. Mỗi khoảng `node i -> node i+1` có 1 chest (`nodes - 1` chest/region).
2. Chest unlock khi đã clear node trước đó (`clearedNodes >= i`).
3. Chest claim 1 lần duy nhất.
4. Reward mặc định MVP: `coins + crowns`.

## Kế hoạch triển khai
1. State & helpers trong `app.js`
2. Refactor render map để tránh duplicate code
3. Chèn chest giữa node trong UI map
4. Thêm `claimChest(chestIdx)` + feedback (`toast`, floating reward)
5. Style cho chest trong `styles.css`
6. Cập nhật `docs/kingdom-mode-flow.md` và `.mmd`

## Checklist QA
- Chest đang locked thì không claim được.
- Sau khi clear node, chest tương ứng chuyển sang claimable.
- Claim xong cộng đúng reward, không claim lặp.
- Không ảnh hưởng logic clear node/boss và unlock region/castle.
- Render đúng ở cả `home` (kingdom mode) và `kingdom-map` screen.
