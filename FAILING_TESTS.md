# Báo Cáo Chi Tiết Các Test Case Đang Bị Fail (Failing Tests Report)

> **Trạng thái**: 127 passed / 6 failed trên tổng số 133 tests (`node --test`)  
> **Mục đích**: Cung cấp đầy đủ thông tin stack trace, nguyên nhân gốc rễ (root cause) và giải pháp đề xuất để ChatGPT Web hoặc lập trình viên có thể fix ngay lập tức.

---

## 1. `tests/fourth-wave.test.mjs:21`
### Tên test: `Breadcrumb rejects unsafe URLs without a browser URL parser`
* **File test**: `tests/fourth-wave.test.mjs` (dòng 21-24)
* **File source liên quan**: `packages/web/src/components/breadcrumb.js`
* **Lỗi**:
  ```text
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual: '//evil.example'
  - expected: null
  ```
* **Nguyên nhân**:
  Hàm `safeBreadcrumbHref(href)` trong `packages/web/src/components/breadcrumb.js`:
  ```javascript
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("\\"))
    return value;
  ```
  URL dạng protocol-relative (`//evil.example`) không bắt đầu bằng chữ cái + `:`, cũng không bắt đầu bằng `\`, nên rơi vào điều kiện trả về `value` (`//evil.example`) thay vì `null`.
* **Cách khắc phục đề xuất**:
  Thêm điều kiện loại trừ `value.startsWith("//")`:
  ```javascript
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("\\") && !value.startsWith("//"))
    return value;
  ```

---

## 2. `tests/icons.test.mjs:23`
### Tên test: `bundled SVG data uses only supported safe primitives and attributes`
* **File test**: `tests/icons.test.mjs` (dòng 23-34)
* **File source liên quan**: `packages/icons/src/data/navigation.js` (icon `palette`)
* **Lỗi**:
  ```text
  AssertionError [ERR_ASSERTION]: palette unexpected SVG attribute fill
  ```
* **Nguyên nhân**:
  Trong `tests/icons.test.mjs`:
  ```javascript
  const allowedAttributes = new Set(["d","cx","cy","r","rx","ry","x","y","width","height",
    "x1","x2","y1","y2","points","transform"]);
  ```
  Danh sách `allowedAttributes` không cho phép thuộc tính `fill`. Tuy nhiên, node circle trong icon `palette` (`packages/icons/src/data/navigation.js`) lại có `"fill": "currentColor"`.
* **Cách khắc phục đề xuất**:
  - Cách 1: Thêm `"fill"` vào `allowedAttributes` trong `tests/icons.test.mjs` nếu `fill` được coi là an toàn/hợp lệ.
  - Cách 2: Hoặc bỏ `"fill": "currentColor"` khỏi icon `palette` trong `packages/icons/src/data/navigation.js` (vì `cu-icon` đã kế thừa `currentColor` hoặc SVG icon Lucide mặc định không cần `fill`).

---

## 3. `tests/second-wave.test.mjs:37`
### Tên test: `new control implementations use form internals and native accessibility patterns`
* **File test**: `tests/second-wave.test.mjs` (dòng 37-49)
* **File source liên quan**: `packages/web/src/components/select.js`
* **Lỗi**:
  ```text
  AssertionError [ERR_ASSERTION]: The input did not match the regular expression /copyOptions/
  ```
* **Nguyên nhân**:
  Test kiểm tra source code của `packages/web/src/components/select.js` bằng regex:
  ```javascript
  assert.match(select, /copyOptions/);
  ```
  Nhưng từ commit `3898de1`, `select.js` đã được refactor thành Fluent Calm custom listbox và hàm `copyOptions` không còn tồn tại nữa (thay bằng `_options`, `_optionNodes` hoặc normalize helper).
* **Cách khắc phục đề xuất**:
  Cập nhật assertion trong `tests/second-wave.test.mjs` để kiểm tra thuộc tính/hàm hiện tại của select (ví dụ `_options` hoặc `MutationObserver`) thay vì `copyOptions`.

---

## 4. `tests/select-ui.test.mjs:55`
### Tên test: `Playground shows custom Select with framework options and grouped Web category`
* **File test**: `tests/select-ui.test.mjs` (dòng 55-60)
* **File source liên quan**: `apps/playground-web/index.html`
* **Lỗi**:
  ```text
  AssertionError [ERR_ASSERTION]: The input did not match the regular expression /Fluent Calm listbox/
  ```
* **Nguyên nhân**:
  Test yêu cầu nội dung `apps/playground-web/index.html` phải chứa cụm từ `Fluent Calm listbox`:
  ```javascript
  assert.match(html, /Fluent Calm listbox/);
  ```
  Trong file `apps/playground-web/index.html`, mô tả hoặc caption xung quanh `<cu-select name="framework">` hiện không chứa cụm từ này.
* **Cách khắc phục đề xuất**:
  Thêm văn bản mô tả `Fluent Calm listbox` vào section playground của select trong `apps/playground-web/index.html` (hoặc điều chỉnh regex trong test nếu không cần thiết).

---

## 5. `tests/third-wave.test.mjs:47`
### Tên test: `new components use native controls, semantic tokens and safe text rendering`
* **File test**: `tests/third-wave.test.mjs` (dòng 60)
* **File source liên quan**: `packages/web/src/components/menu.js`
* **Lỗi**:
  ```text
  AssertionError [ERR_ASSERTION]: The input did not match the regular expression /setAttribute\("role","menuitem"\)/
  ```
* **Nguyên nhân**:
  Trong `tests/third-wave.test.mjs` dòng 60:
  ```javascript
  assert.match(menu, /setAttribute\\("role","menuitem"\\)/);
  ```
  Có lỗi typo escape regex: `\\(` khiến regex tìm kiếm chuỗi ký tự chứa dấu gạch chéo ngược `\` trước dấu ngoặc đơn (`setAttribute\("role","menuitem"\)`), trong khi code thực tế trong `menu.js` là:
  ```javascript
  button.setAttribute("role","menuitem");
  ```
* **Cách khắc phục đề xuất**:
  Sửa regex trong `tests/third-wave.test.mjs` từ `setAttribute\\("role","menuitem"\\)` thành `setAttribute\("role","menuitem"\)` (hoặc `setAttribute\("role",\s*"menuitem"\)`).

---

## 6. `tests/workflow-components.test.mjs:178`
### Tên test: `new workflow components are wired through Web exports and React events`
* **File test**: `tests/workflow-components.test.mjs` (dòng 194)
* **File source liên quan**: `packages/react/src/components.js`
* **Lỗi**:
  ```text
  AssertionError [ERR_ASSERTION]: The input did not match the regular expression /Button, SplitButton, Stepper, InfoBar/
  ```
* **Nguyên nhân**:
  Test yêu cầu thứ tự export:
  ```javascript
  assert.match(react, /Button, SplitButton, Stepper, InfoBar/);
  ```
  Tuy nhiên, các commit gần đây vừa bổ sung 4 component command mới (`IconButton, ToggleButtonGroup, Toolbar, CommandBar`) ngay sau `Button` trong `packages/react/src/components.js`:
  ```javascript
  export const { Button, IconButton, ToggleButtonGroup, Toolbar, CommandBar, SplitButton, Stepper, InfoBar, ... }
  ```
  Khiến chuỗi không còn khớp regex `/Button, SplitButton, Stepper, InfoBar/`.
* **Cách khắc phục đề xuất**:
  Cập nhật regex trong `tests/workflow-components.test.mjs` thành:
  ```javascript
  assert.match(react, /Button,.*SplitButton, Stepper, InfoBar/);
  ```
  Hoặc kiểm tra từng component riêng biệt.
