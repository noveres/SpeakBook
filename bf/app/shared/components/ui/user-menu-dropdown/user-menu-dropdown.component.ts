import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-menu-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './user-menu-dropdown.component.html',
  styleUrls: ['./user-menu-dropdown.component.scss']
})
export class UserMenuDropdownComponent implements OnInit, OnDestroy {
  @Input() userName: string = '';
  @Input() userRole: string = '';
  @Input() avatarUrl: string | null = null;
  @Input() showDefaultAvatar: boolean = false;
  @Input() hideOnMobile: boolean = false; // 控制在移動端是否隱藏

  @Output() logoutEvent = new EventEmitter<void>();

  // 是否為移動設備
  isMobile: boolean = false;
  // 是否顯示完整菜單模式
  isFullMenuMode: boolean = true;

  // 用於取消訂閱
  private destroy$ = new Subject<void>();

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    // 監聽螢幕尺寸變化
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.TabletPortrait])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        // 如果符合移動設備的斷點
        this.isMobile = result.matches;
        // 根據 hideOnMobile 設置和當前設備類型決定是否顯示
        this.updateVisibility();
      });
  }

  ngOnDestroy(): void {
    // 取消訂閱以避免記憶體洩漏
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 更新組件可見性
  updateVisibility(): void {
    // 如果是移動設備且設置為在移動設備上隱藏，則不顯示完整菜單
    this.isFullMenuMode = !(this.isMobile && this.hideOnMobile);
    // 這裡可以添加其他邏輯來決定菜單模式
  }

  handleAvatarError(): void {
    this.showDefaultAvatar = true;
  }

  logout(): void {
    this.logoutEvent.emit();
  }
}
