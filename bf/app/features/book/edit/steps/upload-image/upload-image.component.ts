import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UploadedImage {
    id: string;
    file: File;
    url: string;
    name: string;
    size: number;
}

@Component({
    selector: 'app-upload-image',
    imports: [CommonModule],
    templateUrl: './upload-image.component.html',
    styleUrl: './upload-image.component.scss'
})
export class UploadImageComponent implements OnDestroy {
    @Output() imageSelected = new EventEmitter<UploadedImage>();

    uploadedImages: UploadedImage[] = [];
    selectedImage: UploadedImage | null = null;
    isDragging = false;
    readonly maxImages = 1; // 最大上傳數量

    get isMaxReached(): boolean {
        return this.uploadedImages.length >= this.maxImages;
    }

    get remainingSlots(): number {
        return this.maxImages - this.uploadedImages.length;
    }

    ngOnDestroy(): void {
        // 組件銷毀時清理所有 Blob URL
        this.cleanupAllImages();
    }

    private cleanupAllImages(): void {
        this.uploadedImages.forEach(image => {
            if (image.url.startsWith('blob:')) {
                URL.revokeObjectURL(image.url);
            }
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFiles(Array.from(input.files));
        }
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;

        if (event.dataTransfer?.files) {
            this.handleFiles(Array.from(event.dataTransfer.files));
        }
    }

    private handleFiles(files: File[]): void {
        // 檢查是否已達上限
        if (this.isMaxReached) {
            alert(`已達到上傳上限（${this.maxImages} 張圖片）`);
            return;
        }

        // 計算可以上傳的數量
        const availableSlots = this.remainingSlots;
        const filesToProcess = files.slice(0, availableSlots);

        // 如果有文件被截斷，提示用戶
        if (files.length > availableSlots) {
            alert(`只能再上傳 ${availableSlots} 張圖片，已自動選擇前 ${availableSlots} 張`);
        }

        filesToProcess.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const uploadedImage: UploadedImage = {
                        id: this.generateId(),
                        file: file,
                        url: e.target?.result as string,
                        name: file.name,
                        size: file.size
                    };
                    this.uploadedImages.push(uploadedImage);

                    // 自動選擇第一張圖片
                    if (this.uploadedImages.length === 1) {
                        this.selectImage(uploadedImage);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    selectImage(image: UploadedImage): void {
        this.selectedImage = image;
        this.imageSelected.emit(image);
    }

    removeImage(image: UploadedImage, event: Event): void {
        event.stopPropagation();
        const index = this.uploadedImages.indexOf(image);
        if (index > -1) {
            // 清理 Blob URL 釋放記憶體
            if (image.url.startsWith('blob:')) {
                URL.revokeObjectURL(image.url);
            }

            // 從陣列中移除
            this.uploadedImages.splice(index, 1);

            // 如果刪除的是選中的圖片，選擇下一張
            if (this.selectedImage?.id === image.id) {
                this.selectedImage = this.uploadedImages.length > 0 ? this.uploadedImages[0] : null;
                if (this.selectedImage) {
                    this.imageSelected.emit(this.selectedImage);
                }
            }
        }
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
