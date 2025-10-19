import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadedImage } from '../upload-image/upload-image.component';
import { Hotspot } from '../image-editor/image-editor.component';
import { BookSettings } from '../book-settings/book-settings.component';
import { getAudioNameByUrl } from '@core/constants/audio-data';

@Component({
  selector: 'app-book-preview',
  imports: [CommonModule],
  templateUrl: './book-preview.component.html',
  styleUrl: './book-preview.component.scss'
})
export class BookPreviewComponent {
  @Input() uploadedImage: UploadedImage | null = null;
  @Input() hotspots: Hotspot[] = [];
  @Input() settings: BookSettings | null = null;

  @Output() publish = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<void>();

  isPublishing = false;
  isSavingDraft = false;

  get isValid(): boolean {
    return !!(
      this.uploadedImage &&
      this.settings?.title &&
      this.hotspots.length > 0
    );
  }

  get validationMessages(): string[] {
    const messages: string[] = [];
    
    if (!this.uploadedImage) {
      messages.push('尚未上傳圖片');
    }
    
    if (!this.settings?.title) {
      messages.push('尚未填寫教材標題');
    }
    
    if (this.hotspots.length === 0) {
      messages.push('尚未創建任何熱區');
    }
    
    return messages;
  }

  onPublish(): void {
    if (!this.isValid) {
      alert('請完成所有必填項目後再發布');
      return;
    }

    if (confirm('確定要發布此教材嗎？發布後將可供所有使用者查看。')) {
      this.isPublishing = true;
      this.publish.emit();
    }
  }

  onSaveDraft(): void {
    if (confirm('確定要儲存為草稿嗎？')) {
      this.isSavingDraft = true;
      this.saveDraft.emit();
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('zh-TW');
  }

  getAudioName(audioUrl: string): string {
    // 使用共享的函數獲取音訊名稱
    return getAudioNameByUrl(audioUrl);
  }
}
