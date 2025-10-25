import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy, OnChanges, SimpleChanges, forwardRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '@core/services/i18n/language.service';

export interface SelectOption {
  id: any;
  name: string;
  [key: string]: any;
}

@Component({
  selector: 'app-virtual-select',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: `./virtual-select.component.html`,
  styleUrls: ['./virtual-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VirtualSelectComponent),
      multi: true
    }
  ]
})
export class VirtualSelectComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = '';
  @Input() searchPlaceholder: string = '';
  @Input() disabled: boolean = false;
  @Input() searchable: boolean = true;
  @Input() pageSize: number = 10; // 每次載入的項目數量
  @Input() loading: boolean = false;
  @Input() enablePagination: boolean = true; // 是否啟用分頁
  @Input() totalCount: number = 0; // 總資料筆數
  @Input() hasMore: boolean = true; // 是否還有更多資料
  @Input() totalPageCount: number = 0; // 總頁數
  @Input() debounceTime: number = 300; // 防抖延遲時間（毫秒）
  @Input() showEndIndicator: boolean = true; // 是否顯示「已顯示全部資料」
  @Input() presetId?: any; // 視圖層預設值：僅用於顯示與合併，不改動外部 inputs
  @Input() presetOption: SelectOption | null = null; // 若提供完整物件，優先使用
  @Input() mergePresetIntoView: boolean = true; // 是否把預設值合併到可視清單（不改變 options）
  @Input() presetClass: string = 'preset-option'; // 預設樣式 class 名稱
  // 新增：自動搜尋開關， true即時搜尋 false 只有在按下 Enter 鍵時執行搜尋
  @Input() autoSearchEnabled: boolean = true; // true即時搜尋 false 只有在按下 Enter 鍵時執行搜尋

  @Output() selectionChange = new EventEmitter<SelectOption | null>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<{page: number, pageSize: number, searchTerm: string}>();

  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('optionsContainer') optionsContainer!: ElementRef;

  isOpen = false;
  selectedOption: SelectOption | null = null;
  searchTerm = '';
  visibleOptions: SelectOption[] = [];
  currentPage = 0;
  highlightedIndex = -1;
  isLoading = false;
  isReachedEnd = false; // 是否已到底部
  
  // 新增：IME 組字狀態（行動裝置與中日韓輸入法）
  isComposing = false;

  private destroy$ = new Subject<void>();
  private onChange = (value: any) => {};
  private onTouched = () => {};
  private hasSearched = false; // 追蹤是否已經進行過搜尋
  // 新增：即時搜尋輸入流
  private searchInput$ = new Subject<string>();

  constructor(private cdr: ChangeDetectorRef, private elementRef: ElementRef, private translate: TranslateService, private languageService: LanguageService) {
    // 初始化翻譯服務
    this.translate.setDefaultLang(this.languageService.getCurrentLanguage());
    
    // 設定預設翻譯值
    this.setDefaultTranslations();
    
    // 監聽語言變更
    this.languageService.currentLanguage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.setDefaultTranslations();
      this.cdr.markForCheck(); // 使用 markForCheck 而非 detectChanges
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  ngOnInit() {
    this.isLoading = this.loading;
    // 移除自動載入，改為點擊時才載入

    // 建立即時搜尋訂閱（具備防抖與去重），確保在行動裝置上也流暢
    this.searchInput$
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((term) => {
        if (this.autoSearchEnabled) {
          this.performSearch(term);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['loading']) {
      this.isLoading = this.loading;
      this.cdr.markForCheck();
    }

    if (changes['options']) {
      if (this.enablePagination) {
        // 分頁模式：直接使用傳入的 options
        this.visibleOptions = [...this.options];
        // 檢查是否已經沒有更多資料
        if (this.visibleOptions.length > 0 && !this.hasMore) {
          this.isReachedEnd = true;
        }
        // 重置當前頁碼
        if (this.options.length === 0) {
          this.currentPage = 0;
          this.isReachedEnd = false;
        }
        // 僅在視圖層合併預設值
        this.ensurePresetInView();
        this.cdr.markForCheck();
      } else {
        // 本地模式：只有在沒有搜尋詞時才重新載入選項
        if (!this.searchTerm) {
          this.loadInitialOptions();
        }
      }
    }

    if (changes['hasMore']) {
      this.isReachedEnd = !this.hasMore && this.visibleOptions.length > 0;
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchInput$.complete();
  }

  // ControlValueAccessor 實作
  writeValue(value: any): void {
    if (value) {
      // 先嘗試從現有選項中查找
      let foundOption = this.options.find(option => option.id === value);

      if (foundOption) {
        this.selectedOption = foundOption;
      } else {
        // 如果在現有選項中找不到，創建一個臨時選項（視圖層使用）
        this.selectedOption = {
          id: value,
          name: `${value}`
        } as SelectOption;
        (this.selectedOption as any).__isPreset = true; // 標記為預設（臨時）

        // 如果啟用分頁，觸發載入以嘗試找到正確的選項
        if (this.enablePagination) {
          this.loadMore.emit({
            page: 0,
            pageSize: this.pageSize,
            searchTerm: value // 使用 ID 作為搜尋條件
          });
        }
      }
    } else {
      this.selectedOption = null;
    }
    // 僅合併到視圖，不觸碰外部 inputs
    this.ensurePresetInView();
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  toggleDropdown() {
    if (this.disabled) return;

    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.isOpen = true;

    // 只有在沒有資料或需要重新載入時才載入初始選項
    if (this.enablePagination) {
      // 分頁模式：如果已有選項資料，直接使用；否則載入初始資料
      if (this.visibleOptions.length === 0) {
        this.loadInitialOptions();
      }
    } else {
      // 本地模式：只有在沒有資料且沒有搜尋詞時才載入初始選項
      if (this.visibleOptions.length === 0 && !this.searchTerm) {
        this.loadInitialOptions();
      }
    }

    this.cdr.markForCheck();

    // 檢測邊緣並調整下拉選單位置
    setTimeout(() => {
      this.adjustDropdownPosition();

      // 聚焦到搜尋框
      const searchInput = this.dropdown.nativeElement.querySelector('.search-input');
      if (searchInput) {
        searchInput.focus();
      }
    });
  }

  closeDropdown() {
    this.isOpen = false;
    
    // 如果有搜尋詞，重置搜尋並通知父組件
    if (this.searchTerm) {
      this.searchTerm = '';
      this.currentPage = 0;
      this.isReachedEnd = false;
      
      // 通知父組件搜尋已重置
      this.searchChange.emit('');
      
      if (this.enablePagination) {
        // 分頁模式：重新載入第一頁資料
        this.loadMore.emit({
          page: 0,
          pageSize: this.pageSize,
          searchTerm: ''
        });
      } else {
        // 本地模式：重新載入選項
        this.loadInitialOptions();
      }
    }
    
    // 重置搜尋狀態
    this.hasSearched = false;
    
    this.highlightedIndex = -1;
    this.onTouched();
    this.cdr.markForCheck();
  }

  selectOption(option: SelectOption) {
    this.selectedOption = option;
    this.onChange(option.id);
    this.selectionChange.emit(option);
    this.closeDropdown();
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;

    if (this.autoSearchEnabled) {
      // IME 組字期間不觸發搜尋，待組字結束再觸發
      if (this.isComposing) {
        return;
      }
      // 啟用即時搜尋：以 debounce 方式自動觸發搜尋
      this.searchInput$.next(this.searchTerm);
      return; // 使用即時搜尋則不執行舊的清空重置邏輯
    }

    // 未啟用即時搜尋：維持原有行為
    // 只有在已經搜尋過且搜尋框被清空時，才自動觸發搜尋以顯示所有選項
    if (this.searchTerm === '' && this.hasSearched) {
      this.performSearch('');
      this.hasSearched = false; // 重置搜尋狀態
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    // 按 Enter 鍵時觸發搜尋
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      if (this.autoSearchEnabled) {
        // 即時搜尋開啟時，Enter 立即觸發（跳過 debounce）
        this.performSearch(this.searchTerm);
      } else {
        this.performSearch(this.searchTerm);
      }
    }
  }

  // 實際執行搜尋的方法
  private performSearch(searchTerm: string) {
    // 搜尋時先清空資料
    this.visibleOptions = [];
    this.cdr.markForCheck();
    
    this.searchChange.emit(searchTerm);
    this.currentPage = 0;
    this.isReachedEnd = false;

    // 只有在搜尋詞不為空時才標記為已搜尋
    if (searchTerm.trim() !== '') {
      this.hasSearched = true;
    }

    if (this.enablePagination) {
      // 分頁模式：發送搜尋事件給父組件
      this.loadMore.emit({
        page: 0,
        pageSize: this.pageSize,
        searchTerm: searchTerm
      });
    } else {
      // 本地模式：重新載入選項
      this.loadInitialOptions();
    }

    // 若為空字串搜尋（顯示全部），將預設值合併到可視清單（僅視圖層）
    if (searchTerm.trim() === '') {
      this.ensurePresetInView();
    }
  }

  onScroll(event: any) {
    const element = event.target;
    const threshold = 50; // 距離底部50px時觸發載入

    if (element.scrollTop + element.clientHeight >= element.scrollHeight - threshold) {
      this.loadMoreOptions();
    }
  }

  private loadInitialOptions() {
    this.currentPage = 0;
    this.isReachedEnd = false;

    if (this.enablePagination) {
      // 分頁模式：發送初始載入請求
      this.loadMore.emit({
        page: 0,
        pageSize: this.pageSize,
        searchTerm: this.searchTerm
      });
    } else {
      // 本地模式：從所有選項中取第一頁
      const filteredOptions = this.getFilteredOptions();
      this.visibleOptions = filteredOptions.slice(0, this.pageSize);
      this.isReachedEnd = this.visibleOptions.length >= filteredOptions.length;
    }

    // 視圖層合併預設值
    if (!this.searchTerm) {
      this.ensurePresetInView();
    }

    this.cdr.markForCheck();
  }

  private loadMoreOptions() {
    if (this.isReachedEnd || this.isLoading) {
      return;
    }

    if (this.enablePagination) {
      // 檢查是否已達到最後一頁
      if (this.totalPageCount > 0 && (this.currentPage + 1) >= this.totalPageCount) {
        this.isReachedEnd = true;
        this.cdr.markForCheck();
        return;
      }

      // 分頁模式：發送載入更多事件給父組件
      const nextPage = this.currentPage + 1;
      this.loadMore.emit({
        page: nextPage,
        pageSize: this.pageSize,
        searchTerm: this.searchTerm
      });

      // 更新當前頁碼
      this.currentPage = nextPage;
    } else {
      // 本地模式：從所有選項中載入下一頁
      const filteredOptions = this.getFilteredOptions();
      const startIndex = (this.currentPage + 1) * this.pageSize;

      if (startIndex >= filteredOptions.length) {
        this.isReachedEnd = true;
        this.cdr.markForCheck();
        return;
      }

      const newOptions = filteredOptions.slice(startIndex, startIndex + this.pageSize);
      this.visibleOptions = [...this.visibleOptions, ...newOptions];
      this.currentPage++;
      this.isReachedEnd = startIndex + newOptions.length >= filteredOptions.length;
      this.cdr.markForCheck();
    }

    // 每次擴充都嘗試合併預設值至視圖
    if (!this.searchTerm) {
      this.ensurePresetInView();
    }
  }

  private getFilteredOptions(): SelectOption[] {
    if (!this.searchTerm) {
      return this.options;
    }

    return this.options.filter(option =>
      option.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  trackByFn(index: number, item: SelectOption): any {
    return item.id;
  }

  private adjustDropdownPosition() {
    if (!this.dropdown?.nativeElement) return;

    const dropdown = this.dropdown.nativeElement;
    const container = this.elementRef.nativeElement;
    const rect = container.getBoundingClientRect();
    const dropdownHeight = 300; // 預設最大高度
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // 重置樣式
    dropdown.style.top = '';
    dropdown.style.bottom = '';
    dropdown.style.left = '';
    dropdown.style.right = '';
    dropdown.style.transform = '';

    // 垂直位置檢測
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      // 向上展開
      dropdown.style.bottom = '100%';
      dropdown.style.top = 'auto';
      dropdown.style.marginBottom = '4px';
      dropdown.style.marginTop = '0';
      dropdown.classList.add('dropdown-up');
    } else {
      // 向下展開（預設）
      dropdown.style.top = '100%';
      dropdown.style.bottom = 'auto';
      dropdown.style.marginTop = '4px';
      dropdown.style.marginBottom = '0';
      dropdown.classList.remove('dropdown-up');
    }

    // 水平位置檢測
    const spaceRight = viewportWidth - rect.left;
    const dropdownWidth = container.offsetWidth;

    if (spaceRight < dropdownWidth && rect.right > dropdownWidth) {
      // 向左對齊
      dropdown.style.left = 'auto';
      dropdown.style.right = '0';
    } else {
      // 向右對齊（預設）
      dropdown.style.left = '0';
      dropdown.style.right = '0';
    }
  }

  private ensurePresetInView() {
    if (!this.mergePresetIntoView) return;

    // 僅處理下拉清單顯示（不影響外部 options）
    const hasSelected = !!this.selectedOption;
    const presetFromInput = this.presetOption || (this.presetId !== undefined ? { id: this.presetId, name: String(this.presetId) } as SelectOption : null);

    const candidate: SelectOption | null = hasSelected
      ? this.selectedOption
      : (presetFromInput as SelectOption | null);

    if (!candidate) return;

    const inOptions = this.options.some(o => o.id === candidate.id);
    const inVisible = this.visibleOptions.some(o => o.id === candidate.id);

    if (!inOptions && !inVisible) {
      const merged = { ...candidate } as any;
      merged.__isPreset = true; // 視圖層標記
      this.visibleOptions = [merged as SelectOption, ...this.visibleOptions];
      this.cdr.markForCheck();
    }
  }

  // IME 組字結束事件：在即時搜尋模式下觸發一次搜尋
  handleCompositionEnd(event: CompositionEvent) {
    this.isComposing = false;
    // 組字結束後，如果啟用自動搜尋，觸發搜尋
    if (this.autoSearchEnabled) {
      this.searchInput$.next(this.searchTerm);
    }
  }

  private setDefaultTranslations() {
    // 只有在沒有設定 placeholder 時才使用翻譯
    if (!this.placeholder) {
      this.placeholder = this.translate.instant('VIRTUAL_SELECT.PLACEHOLDER');
    }
    if (!this.searchPlaceholder) {
      this.searchPlaceholder = this.translate.instant('VIRTUAL_SELECT.SEARCH_PLACEHOLDER');
    }
  }
}
