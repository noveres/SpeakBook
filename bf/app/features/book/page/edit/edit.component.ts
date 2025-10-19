import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UploadImageComponent, UploadedImage } from '../../edit/steps/upload-image/upload-image.component';
import { ImageEditorComponent, Hotspot } from '../../edit/steps/image-editor/image-editor.component';
import { BookSettingsComponent, BookSettings } from '../../edit/steps/book-settings/book-settings.component';
import { BookPreviewComponent } from '../../edit/steps/book-preview/book-preview.component';

@Component({
  selector: 'app-edit',
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    UploadImageComponent,
    ImageEditorComponent,
    BookSettingsComponent,
    BookPreviewComponent
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild(ImageEditorComponent) imageEditor!: ImageEditorComponent;

  selectedImage: UploadedImage | null = null;
  hotspots: Hotspot[] = [];
  bookSettings: BookSettings = {
    title: '',
    author: '',
    description: '',
    category: '童話故事',
    pages: 0,
    targetAge: '3-6歲',
    difficulty: '簡單'
  };
  
  isEditMode = false;
  bookId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 檢查是否為編輯模式
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.bookId = +id;
      this.loadBookData(this.bookId);
    }
  }

  loadBookData(id: number): void {
    // 這裡應該從後端 API 加載教材數據
    // 模擬數據加載
    console.log('加載教材數據，ID:', id);
    
    // 模擬已有的教材數據
    this.bookSettings = {
      title: '小紅帽',
      author: '格林兄弟',
      description: '一個關於小女孩與大野狼的經典童話故事',
      category: '童話故事',
      pages: 32,
      targetAge: '3-6歲',
      difficulty: '簡單'
    };
  }

  onImageSelected(image: UploadedImage): void {
    this.selectedImage = image;
  }

  onSettingsChange(settings: BookSettings): void {
    this.bookSettings = settings;
  }

  onNextToPreview(): void {
    // 從圖片編輯器獲取熱區數據
    if (this.imageEditor) {
      this.hotspots = this.imageEditor.hotspots;
    }
  }

  onPublish(): void {
    // 收集所有數據
    const bookData = {
      image: this.selectedImage,
      hotspots: this.hotspots,
      settings: this.bookSettings,
      publishDate: new Date().toISOString()
    };

    console.log('發布教材:', bookData);
    
    // 模擬發布過程
    setTimeout(() => {
      alert('教材發布成功！');
      this.router.navigate(['/book']);
    }, 1500);
  }

  onSaveDraft(): void {
    // 收集所有數據
    const draftData = {
      image: this.selectedImage,
      hotspots: this.hotspots,
      settings: this.bookSettings,
      savedDate: new Date().toISOString()
    };

    console.log('儲存草稿:', draftData);
    
    // 模擬儲存過程
    setTimeout(() => {
      alert('草稿儲存成功！');
      this.router.navigate(['/book']);
    }, 1000);
  }
}
