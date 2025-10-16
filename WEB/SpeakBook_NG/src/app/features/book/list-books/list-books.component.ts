import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Book {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  publishDate: string;
  pages: number;
  category: string;
}

@Component({
  selector: 'app-list-books',
  imports: [CommonModule],
  templateUrl: './list-books.component.html',
  styleUrl: './list-books.component.scss'
})
export class ListBooksComponent implements OnInit {
  books: Book[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    // 模擬書籍數據
    this.books = [
      {
        id: 1,
        title: '小紅帽',
        author: '格林兄弟',
        coverImage: 'https://picsum.photos/seed/book1/300/400',
        description: '一個關於小女孩與大野狼的經典童話故事',
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
  }

  onBookClick(book: Book): void {
    console.log('點擊書籍:', book);
    // 這裡可以導航到書籍詳情頁面
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/300x400/e0e0e0/757575?text=No+Image';
  }
}
