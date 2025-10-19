import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  audioUrl?: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  publishDate: string;
  pages: number;
  category: string;
  hotspots?: Hotspot[]; // 熱區數據
}

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss'
})
export class BookDetailComponent implements OnInit {
  book: Book | null = null;
  isLoading = true;
  hotspots: Hotspot[] = [];
  selectedHotspot: Hotspot | null = null;
  imageLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 從路由參數獲取教材 ID
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBook(+id);
    }
  }

  loadBook(id: number): void {
    this.isLoading = true;
    
    // 模擬從後端獲取教材數據
    // 實際應該調用 bookService.getBookById(id)
    setTimeout(() => {
      // 模擬數據
      const books: Book[] = [
        {
          id: 1,
          title: '小紅帽',
          author: '格林兄弟',
          coverImage: 'https://picsum.photos/seed/book1/300/400',
          description: '一個關於小女孩與大野狼的經典童話故事。小紅帽穿著紅色的斗篷去看望生病的奶奶，途中遇到了狡猾的大野狼。這個故事教導孩子們要小心陌生人，並且要聽從父母的教誨。',
          publishDate: '2024-01-15',
          pages: 32,
          category: '童話故事'
        },
        {
          id: 2,
          title: '三隻小豬',
          author: '經典童話',
          coverImage: 'https://picsum.photos/seed/book2/300/400',
          description: '三隻小豬建造房子抵抗大野狼的故事',
          publishDate: '2024-02-20',
          pages: 28,
          category: '童話故事'
        },
        {
          id: 3,
          title: '白雪公主',
          author: '格林兄弟',
          coverImage: 'https://picsum.photos/seed/book3/300/400',
          description: '美麗的公主與七個小矮人的冒險故事',
          publishDate: '2024-03-10',
          pages: 40,
          category: '童話故事'
        },
        {
          id: 4,
          title: '灰姑娘',
          author: '夏爾·佩羅',
          coverImage: 'https://picsum.photos/seed/book4/300/400',
          description: '善良的女孩在仙女教母幫助下參加舞會的故事',
          publishDate: '2024-04-05',
          pages: 36,
          category: '童話故事'
        },
        {
          id: 5,
          title: '醜小鴨',
          author: '安徒生',
          coverImage: 'https://picsum.photos/seed/book5/300/400',
          description: '一隻醜小鴨成長為美麗天鵝的勵志故事',
          publishDate: '2024-05-12',
          pages: 30,
          category: '童話故事'
        },
        {
          id: 6,
          title: '小美人魚',
          author: '安徒生',
          coverImage: 'https://picsum.photos/seed/book6/300/400',
          description: '美人魚公主為了愛情來到陸地的感人故事',
          publishDate: '2024-06-18',
          pages: 45,
          category: '童話故事'
        }
      ];

      const foundBook = books.find(b => b.id === id) || null;
      
      // 模擬從後端獲取的熱區數據
      if (foundBook) {
        foundBook.hotspots = [
          {
            id: '1',
            x: 50,
            y: 80,
            width: 120,
            height: 100,
            label: '小紅帽',
            audioUrl: 'audio/little-red.mp3'
          },
          {
            id: '2',
            x: 200,
            y: 150,
            width: 100,
            height: 90,
            label: '大野狼',
            audioUrl: 'audio/wolf.mp3'
          },
          {
            id: '3',
            x: 350,
            y: 100,
            width: 110,
            height: 95,
            label: '奶奶的房子',
            audioUrl: 'audio/house.mp3'
          }
        ];
      }
      
      this.book = foundBook;
      this.hotspots = this.book?.hotspots || [];
      this.isLoading = false;
    }, 500);
  }

  goBack(): void {
    this.router.navigate(['/book']);
  }

  onEdit(): void {
    if (this.book) {
      this.router.navigate(['/book/edit', this.book.id]);
    }
  }

  onDelete(): void {
    if (this.book && confirm(`確定要刪除教材「${this.book.title}」嗎？`)) {
      // 這裡應該調用後端 API 刪除教材
      // this.bookService.deleteBook(this.book.id).subscribe(...)
      
      alert('教材已成功刪除');
      this.router.navigate(['/book']);
    }
  }

  onImageLoad(event: Event): void {
    this.imageLoaded = true;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/300x400/e0e0e0/757575?text=No+Image';
  }

  selectHotspot(hotspot: Hotspot): void {
    this.selectedHotspot = hotspot;
    console.log('選中熱區:', hotspot);
  }

  playAudio(hotspot: Hotspot): void {
    if (hotspot.audioUrl) {
      console.log('播放音訊:', hotspot.audioUrl);
      // 實際應該創建 Audio 對象並播放
      // const audio = new Audio(hotspot.audioUrl);
      // audio.play();
      alert(`播放音訊: ${hotspot.label}\n音訊檔案: ${hotspot.audioUrl}`);
    } else {
      alert('此熱區沒有設置音訊');
    }
  }
}
