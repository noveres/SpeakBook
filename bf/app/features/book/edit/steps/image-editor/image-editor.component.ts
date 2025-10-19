import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadedImage } from '../upload-image/upload-image.component';
import { VirtualSelectComponent, SelectOption } from '@shared/components/ui/virtual-select/virtual-select.component';

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  audioUrl?: string;
}

@Component({
  selector: 'app-image-editor',
  imports: [CommonModule, FormsModule, VirtualSelectComponent],
  templateUrl: './image-editor.component.html',
  styleUrl: './image-editor.component.scss'
})
export class ImageEditorComponent implements OnChanges {
  @Input() selectedImage: UploadedImage | null = null;

  hotspots: Hotspot[] = [];
  isDrawing = false;
  startX = 0;
  startY = 0;
  currentHotspot: Hotspot | null = null;
  selectedHotspot: Hotspot | null = null;

  canvasWidth = 0;
  canvasHeight = 0;

  // 音訊選項
  audioOptions: SelectOption[] = [
    { id: '1', name: '小紅帽的故事', value: 'audio/little-red-story.mp3' },
    { id: '2', name: '大野狼的聲音', value: 'audio/wolf-sound.mp3' },
    { id: '3', name: '奶奶的聲音', value: 'audio/grandma-voice.mp3' },
    { id: '4', name: '森林背景音', value: 'audio/forest-ambient.mp3' },
    { id: '5', name: '開門聲', value: 'audio/door-open.mp3' },
    { id: '6', name: '脚步聲', value: 'audio/footsteps.mp3' },
    { id: '7', name: '鳥叫聲', value: 'audio/birds.mp3' },
    { id: '8', name: '風聲', value: 'audio/wind.mp3' }
  ];
  selectedAudioId: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedImage'] && this.selectedImage) {
      // 清空熱區當切換圖片時
      this.hotspots = [];
      this.selectedHotspot = null;
      this.currentHotspot = null;
    }
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.canvasWidth = img.clientWidth;
    this.canvasHeight = img.clientHeight;
  }

  onMouseDown(event: MouseEvent): void {
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    this.startX = event.clientX - rect.left;
    this.startY = event.clientY - rect.top;
    this.isDrawing = true;

    this.currentHotspot = {
      id: this.generateId(),
      x: this.startX,
      y: this.startY,
      width: 0,
      height: 0,
      label: `熱區 ${this.hotspots.length + 1}`
    };
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing || !this.currentHotspot) return;

    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    this.currentHotspot.width = currentX - this.startX;
    this.currentHotspot.height = currentY - this.startY;
  }

  onMouseUp(): void {
    if (this.isDrawing && this.currentHotspot) {
      // 只保存有效的熱區（寬高都大於10px）
      if (Math.abs(this.currentHotspot.width) > 10 && Math.abs(this.currentHotspot.height) > 10) {
        // 標準化負數寬高
        if (this.currentHotspot.width < 0) {
          this.currentHotspot.x += this.currentHotspot.width;
          this.currentHotspot.width = Math.abs(this.currentHotspot.width);
        }
        if (this.currentHotspot.height < 0) {
          this.currentHotspot.y += this.currentHotspot.height;
          this.currentHotspot.height = Math.abs(this.currentHotspot.height);
        }

        this.hotspots.push(this.currentHotspot);
        this.selectedHotspot = this.currentHotspot;
      }
      this.currentHotspot = null;
    }
    this.isDrawing = false;
  }

  selectHotspot(hotspot: Hotspot): void {
    this.selectedHotspot = hotspot;
    this.updateSelectedAudioId();
  }

  deleteHotspot(hotspot: Hotspot): void {
    const index = this.hotspots.indexOf(hotspot);
    if (index > -1) {
      this.hotspots.splice(index, 1);
      if (this.selectedHotspot?.id === hotspot.id) {
        this.selectedHotspot = null;
      }
    }
  }

  clearAllHotspots(): void {
    if (confirm('確定要清除所有熱區嗎？')) {
      this.hotspots = [];
      this.selectedHotspot = null;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  onAudioSelect(optionId: any): void {
    if (this.selectedHotspot && optionId) {
      const selectedOption = this.audioOptions.find(opt => opt.id === optionId);
      if (selectedOption) {
        this.selectedHotspot.audioUrl = selectedOption['value'] as string;
        this.selectedAudioId = optionId;
        console.log('選擇音訊:', selectedOption.name, selectedOption['value']);
      }
    }
  }

  updateSelectedAudioId(): void {
    if (!this.selectedHotspot?.audioUrl) {
      this.selectedAudioId = '';
      return;
    }
    const option = this.audioOptions.find(opt => opt['value'] === this.selectedHotspot?.audioUrl);
    this.selectedAudioId = option ? option.id : '';
  }
}
