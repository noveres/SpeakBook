import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, NavigationStart, RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import { LanguageSelectorComponent } from '@shared/components/ui/language-selector/language-selector.component';
import { UserMenuDropdownComponent } from '@shared/components/ui/user-menu-dropdown/user-menu-dropdown.component';
import { AuthService } from '../../services/auth/auth.service'; // 導入 AuthService
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '@core/services/i18n/language.service';
import { LoadingSpinnerComponent } from "@shared/components/ui";


@Component({
  selector: 'sidebar-navmenu-drop-down',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    TranslateModule,
    LanguageSelectorComponent,
    UserMenuDropdownComponent,
    LoadingSpinnerComponent
],
  templateUrl: './sidebar-navmenu-drop-down.component.html',
  styleUrl: './sidebar-navmenu-drop-down.component.scss'
})
export class SidebarNAVmenuDropDownComponent implements OnInit, OnDestroy {

  //客製化組件選擇，調整true/false決定使用那些組件樣式
  isPCMenuToggleEnabled = false; //使否啟用PC漢堡選單
  isMobileMenuToggleEnabled = false; //使否啟用移動端漢堡選單
  isMenuToggleOnVisible = true; //是否啟用關閉狀態的menu-toggle
  isMenuToggleOffVisible = true; //是否啟用開啟狀態的menu-toggle
  isHoverTriggerEnabled = false; //是否啟用懸停觸發側邊欄功能

  // 側邊欄相關
  isSidebarActive = true;
  isLoginPage = false;

  // 路由導航加載狀態
  isNavigating = false;
  currentPage = '儀表板';
  activeSubmenu: string | null = null; // 當前活動的子菜單
  expandedMenus: string[] = []; // 存儲所有展開的子選單
  isHovering = false; // 是否正在懸停

  // 用戶信息
  userName: string = '';
  userRole: string = '';
  avatarUrl: string | null = null;
  showDefaultAvatar = false;

  // 權限檢查
  hasAssetFinanceRead: boolean = false;
  hasInventoryRead: boolean = false;

  // 訂閱頭像和用戶名更新
  private avatarSubscription: Subscription | null = null;
  private userNameSubscription: Subscription | null = null;
  private languageSubscription: Subscription | null = null;
  private permissionSubscription: Subscription | null = null;

  @ViewChild('drawer') drawer: any;
  constructor(
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService,
    private languageService: LanguageService,
  ) {
    // 初始化 TranslateService 使用當前語言
    this.translate.use(this.languageService.getCurrentLanguage());
    // 監聽路由變化
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        // 路由開始導航時顯示加載動畫
        this.isNavigating = true;
      } else if (event instanceof NavigationEnd) {
        // 路由導航結束時隱藏加載動畫
        this.isNavigating = false;

        // 判斷是否為登錄頁面或403頁面（需要隱藏側邊欄）
        const url = event.url.replace(/[#?].*$/, '').trim();
        this.isLoginPage = url === '/login' || url === '/403';

        // 每次路由變化時更新用戶信息
        this.updateUserInfo();
      }
    });
  }



  ngOnInit(): void {

    // 訂閱用戶名變化
    this.userNameSubscription = this.authService.userName$.subscribe(name => {
      if (name && name.trim() !== '') {
        this.userName = name;
      } else {
        this.userName = this.translate.instant('USER.DEFAULT_USER');
      }
    });

    // 初始化預設顯示（避免屬性初始化階段 translate 尚未注入）
    if (!this.userName) {
      this.userName = this.translate.instant('USER.DEFAULT_USER');
    }
    if (!this.userRole) {
      // 若無角色資料，預設顯示底線
      this.userRole = '_';
    }

    // 從 localStorage 獲取用戶信息 (角色等其他信息)
    this.updateUserInfo();

    // 監聽語言變更
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(language => {
      this.translate.use(language);
      // 重新載入資料以確保 UI 文案與日期格式能跟著更新
      this.updateUserInfo();
    });

    // 從 localStorage 獲取側邊欄狀態
    const savedSidebarState = localStorage.getItem('sidebarActive');
    if (savedSidebarState !== null) {
      this.isSidebarActive = savedSidebarState === 'true';
    }

    // 從 localStorage 獲取子選單展開狀態
    const savedExpandedMenus = localStorage.getItem('expandedMenus');
    if (savedExpandedMenus) {
      try {
        const parsedMenus = JSON.parse(savedExpandedMenus);
        // 確保是有效的數組
        if (Array.isArray(parsedMenus)) {
          this.expandedMenus = parsedMenus;
          // 如果有已保存的展開子選單，設置 activeSubmenu 為最後一個
          // 使用最後一個作為活動菜單，因為這通常是用戶最後點擊的菜單
          if (this.expandedMenus.length > 0) {
            this.activeSubmenu = this.expandedMenus[this.expandedMenus.length - 1];
          }
        }
      } catch (error) {
        console.error('解析展開菜單狀態失敗:', error);
        this.expandedMenus = [];
        localStorage.removeItem('expandedMenus');
      }
    }

    // 檢查並清除刷新標記
    const isRefreshing = sessionStorage.getItem('isRefreshing');
    if (isRefreshing) {
      sessionStorage.removeItem('isRefreshing');
      console.log('頁面刷新，不執行登出');
    }

    // 添加頁面關閉事件監聽
    window.addEventListener('beforeunload', this.handleBeforeUnload);


  }

  ngOnDestroy(): void {
    // 移除事件監聽器
    window.removeEventListener('beforeunload', this.handleBeforeUnload);

    // 取消訂閱
    if (this.avatarSubscription) {
      this.avatarSubscription.unsubscribe();
    }
    if (this.userNameSubscription) {
      this.userNameSubscription.unsubscribe();
    }
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.permissionSubscription) {
      this.permissionSubscription.unsubscribe();
    }
  }

  // 處理頁面關閉事件
  handleBeforeUnload = (event: BeforeUnloadEvent): void => {
    // 標記頁面正在刷新
    sessionStorage.setItem('isRefreshing', 'true');

    // 使用 setTimeout 來判斷是否真的是關閉視窗
    // 如果是刷新，setTimeout 內的代碼將不會執行，因為頁面會在超時前重新載入
    // 如果是關閉，sessionStorage 中的標記將不會被清除
    setTimeout(() => {
      const isRefreshing = sessionStorage.getItem('isRefreshing');
      if (isRefreshing) {
        // 如果標記仍存在，表示這是視窗關閉而不是刷新
        const sessionToken = sessionStorage.getItem('token');
        if (sessionToken) {
          this.logout();
        }
      }
    }, 0);
  }
  // 登出方法
  logout(): void {
    // 調用 AuthService 的登出方法
    this.authService.logout();
  }

  // 切換側邊欄狀態
  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
    // 保存側邊欄狀態到 localStorage
    localStorage.setItem('sidebarActive', this.isSidebarActive.toString());
  }

  // 切換子菜單
  toggleSubmenu(menuName: string): void {
    // 檢查當前菜單是否已經展開
    const isExpanded = this.isSubmenuExpanded(menuName);

    if (isExpanded) {
      // 如果已經展開，則關閉它
      this.expandedMenus = this.expandedMenus.filter(menu => menu !== menuName);
    } else {
      // 如果未展開，則打開它
      if (!this.expandedMenus.includes(menuName)) {
        this.expandedMenus.push(menuName);
      }
    }

    // 更新活動菜單狀態
    this.activeSubmenu = isExpanded ? null : menuName;

    // 保存展開狀態到 localStorage
    this.saveExpandedMenusState();
  }

  // 保存展開菜單狀態到 localStorage
  private saveExpandedMenusState(): void {
    localStorage.setItem('expandedMenus', JSON.stringify(this.expandedMenus));
  }

  // 檢查子選單是否展開
  isSubmenuExpanded(menuName: string): boolean {
    return this.expandedMenus.includes(menuName);
  }

  // 根據 URL 獲取頁面標題

  // 處理頭像加載錯誤
  handleAvatarError(): void {
    console.log('頭像加載失敗，顯示默認頭像');
    this.showDefaultAvatar = true;
  }

  // 處理語言變更
  onLanguageChange(language: string): void {
    console.log('語言已變更為:', language);
    // 這裡可以添加語言切換的邏輯
  }

  // 更新用戶信息
  private updateUserInfo(): void {
    console.log('更新用戶角色等其他信息');
    console.log('localStorage userRole:', localStorage.getItem('userRole'));

    const userRole = localStorage.getItem('userRole');

    if (userRole && userRole.trim() !== '') {
      // 優先顯示 localStorage 中的 userRole 值
      this.userRole = userRole;
    } else {
      // 若沒有資料則顯示底線
      this.userRole = '_';
    }
    // 設置用戶頭像（如未來有頭像服務可在此處接入）
  }

}
