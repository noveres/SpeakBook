# Virtual Select（Base）元件說明

本文件從設計原理到落地使用，完整說明 Virtual Select 基礎版元件在專案中的核心功能、實作機制與實際應用場景，並提供最佳實務與常見坑位說明。

- 來源檔案：
  - 元件類別：<mcfile name="virtual-select.component.ts" path="e:\VS_Code\KAS_WEB_2_0\rewrite\src\app\shared\components\virtual-select\Base\virtual-select.component.ts"></mcfile>
  - 樣板：<mcfile name="virtual-select.component.html" path="e:\VS_Code\KAS_WEB_2_0\rewrite\src\app\shared\components\virtual-select\Base\virtual-select.component.html"></mcfile>
  - 樣式：<mcfile name="virtual-select.component.scss" path="e:\VS_Code\KAS_WEB_2_0\rewrite\src\app\shared\components\virtual-select\Base\virtual-select.component.scss"></mcfile>

---

## 一、要解決的問題與核心能力

在需要處理大量選項（例如：部門、使用者、地點）時，傳統下拉選單一次載入全部資料會造成：
- 初次載入慢、記憶體與 DOM 壓力大
- 搜尋體驗不一致（前後端混雜）

Virtual Select 目標：
- 以「分頁 + 滾動載入 + 搜尋」的模式，只顯示「可見清單」visibleOptions
- 與響應式表單 ControlValueAccessor 無縫整合（支援 formControlName）
- 支援「預設值在伺服器尚未回傳」的情境，仍能在 UI 顯示預設選項

---

## 二、架構與運作原理（重點）

1) ControlValueAccessor 整合
- writeValue(value) 接收外部表單值（即選項 id），元件會：
  - 優先在 options 中尋找對應選項
  - 若找不到，先用 { id: value, name: `${value}` } 建立暫時項目標記為 __isPreset，讓視圖可先顯示
  - 如啟用分頁，會觸發第一次載入或搜尋，待真正資料回來再取代

2) 分頁與載入
- 父層負責真正的資料請求，元件透過三個事件/屬性協作：
  - (loadMore) 發射 { page, pageSize, searchTerm } 由父層請求資料
  - 父層回填 [options]、[hasMore]、[totalPageCount]、[loading]
  - 元件負責維護 visibleOptions 與 currentPage、isReachedEnd 狀態

3) 搜尋機制
- 以按 Enter 觸發 performSearch()（保留使用者輸入過程的流暢度）
- 清空搜尋框會重載為初始清單
- 分頁模式下，搜尋直接重置 page=0 並向父層發送 (loadMore)

4) 「只在視圖層」合併預設值 ensurePresetInView
- 當 selectedOption 或 presetId/presetOption 存在，但不在 options/visibleOptions 內時：
  - 只將該項以 __isPreset 標記合併進 visibleOptions 的最前端（不改動外部 options）
  - 透過 [ngClass] 套用自定義樣式（預設 preset-option）

5) 下拉開闔與邊界偵測
- openDropdown() 時才載入初始清單，避免不必要請求
- adjustDropdownPosition() 會根據視窗邊界決定向上/向下開啟
- 點擊外部區域自動關閉（HostListener document:click）

---

## 三、API 介面

介面 SelectOption：
```
interface SelectOption {
  id: any;
  name: string;
  [key: string]: any;
}
```

Inputs：
- options: SelectOption[] = []
- placeholder: string = '請選擇'
- searchPlaceholder: string = '搜尋...'
- disabled: boolean = false
- searchable: boolean = true
- pageSize: number = 10
- loading: boolean = false
- enablePagination: boolean = true
- totalCount: number = 0
- hasMore: boolean = true
- totalPageCount: number = 0
- debounceTime: number = 300
- showEndIndicator: boolean = true
- presetId?: any                       // 視圖層預設 id
- presetOption: SelectOption | null     // 若給完整物件，優先使用
- mergePresetIntoView: boolean = true   // 僅合併到視圖，不改變 options
- presetClass: string = 'preset-option' // 預設樣式 class 名稱

Outputs：
- selectionChange: EventEmitter<SelectOption | null>
- searchChange: EventEmitter<string>
- loadMore: EventEmitter<{ page: number; pageSize: number; searchTerm: string }>

---

## 四、實際使用場景

1) 遠端分頁（大量資料）
```
<app-virtual-select
  [options]="pageState.currentOptions | convertToSelectOptions:'id':'name'"
  [loading]="pageState.isLoading"
  [enablePagination]="true"
  [hasMore]="pageState.hasMore"
  [totalPageCount]="pageState.totalPageCount"
  (loadMore)="loadPage($event)">
</app-virtual-select>
```
父層在 loadPage 內呼叫服務取回對應頁資料，並更新 pageState 與 options。

2) 本地模式（小量資料）
```
<app-virtual-select
  [options]="allOptions"
  [enablePagination]="false">
</app-virtual-select>
```

3) 有預設值但資料尚未回來（常見於編輯頁）
- 傳入 presetId 或 presetOption，元件會把該選項以 __isPreset 合併到視圖頂部供使用者辨識
- 預設樣式透過 [ngClass] 套用 presetClass，例如：
```
<div class="option" [ngClass]="option['__isPreset'] === true ? presetClass : null">
  {{ option.name }}
</div>
```
（注意：Angular 模板不支援物件計算屬性 key，務必用條件類字串寫法）

---

## 五、與表單整合（ControlValueAccessor）

```
<form [formGroup]="form">
  <app-virtual-select formControlName="departmentId"
    [options]="departmentOptions"
    [enablePagination]="true"
    [loading]="departmentState.isLoading"
    [hasMore]="departmentState.hasMore"
    [totalPageCount]="departmentState.totalPageCount"
    [presetOption]="getDepartmentPresetOption(form.get('departmentId')?.value)"
    [mergePresetIntoView]="true"
    (loadMore)="loadDepartmentPage($event)">
  </app-virtual-select>
</form>
```
- 外部表單值改變 → writeValue(value) → 元件更新 selectedOption/預設視圖
- 使用者選取 → selectionChange.emit(option) + onChange(option.id) → 外部表單值更新

---

## 六、最佳實務

- 分頁大小 pageSize 建議 20（效能與體驗折衷）
- 後端搜尋建議支援以 id/name 同時查詢，對應 writeValue 時以 id 當搜尋詞的情境
- 回填 options 時務必維持資料格式 { id, name }，異名欄位請用 convertToSelectOptions pipe 轉換
- 當 enablePagination=true：
  - 初次開啟才載入（避免無用請求）
  - (loadMore) 中以 page、pageSize、searchTerm 回傳資料
  - 正確回填 hasMore 與 totalPageCount，讓元件能正確停止載入
- 不要在模板使用 ES6 計算屬性 key（如 { [presetClass]: ... }），Angular 模板不支援，請改用條件類字串

---

## 七、常見問題（FAQ）

Q1：預設值為何會帶著不同底色/樣式？
- 因為視圖層合併時，元件會在該選項上標記 __isPreset，並套用 presetClass，方便使用者辨識這是「尚未從後端載入的臨時項」。

Q2：為什麼按 Enter 才會觸發搜尋？
- 為了避免每次輸入都打後端 API，保留使用者輸入的流暢度；清空搜尋框也會回復初始資料。

Q3：如何避免列表一直載入？
- 正確計算並回填 hasMore 與 totalPageCount；到達最後一頁時元件會顯示「已顯示全部資料」。

Q4：我只想一次載入所有資料？
- 設為 [enablePagination]="false"，並一次性提供完整 options。

---

## 八、實例：資產新增明細的部門選擇

在資產新增頁中，明細的部門選擇器會將表頭選擇的部門帶入做為預設值：
- 使用 [presetOption]="getDepartmentPresetOption(assetForm.get('departmentId')?.value)"
- 並開啟 [mergePresetIntoView] 以顯示於視圖清單頂端
- 分頁載入由 (loadMore) → loadDepartmentPage() 串接服務取得下一頁

這個模式讓使用者即使在資料尚未回填前，也能立即看到「預設部門」被套用與高亮顯示，並可直接更改。

---

## 九、樣式客製與無障礙

- 主要外掛點：.virtual-select-container、.select-trigger、.dropdown、.option 等 CSS 類名
- 可透過 presetClass 自訂預設項目的視覺（例如加上邊框/底色）
- 支援鍵盤 Enter 觸發搜尋；你也可以擴充方向鍵導航/ARIA 標籤以強化可近用性

---

如需更進一步的範例或想擴充多選模式，歡迎在元件基礎上延伸。