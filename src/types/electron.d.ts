import type { Book } from '@/types/book';
import type { Highlight } from '@/types/highlight';

declare global {
  interface Window {
    api: {
      books: {
        list(): Promise<Book[]>;
        get(id: number): Promise<Book | null>;
        byTitle(title: string): Promise<Book | null>;
        create(data: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Book>;
        update(id: number, data: Partial<Book>): Promise<Book | null>;
        delete(id: number): Promise<boolean>;
      };
      highlights: {
        byBook(bookId: number): Promise<Highlight[]>;
        byContent(content: string): Promise<Highlight | null>;
        create(
          data: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
        ): Promise<Highlight>;
        update(id: number, data: Partial<Highlight>): Promise<Highlight | null>;
        delete(id: number): Promise<boolean>;
      };
    };
  }
}
