import type { Book } from '@/types/book';
import type { Highlight } from '@/types/highlight';

declare global {
  interface Window {
    api: {
      books: {
        list(showDeleted: boolean): Promise<Book[]>;
        get(id: number): Promise<Book | null>;
        byTitle(title: string): Promise<Book | null>;
        create(data: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Book>;
        update(id: number, data: Partial<Book>): Promise<Book | null>;
        softDelete(id: number): Promise<boolean>;
        hardDelete(id: number): Promise<boolean>;
        restore(id: number): Promise<boolean>;
      };
      highlights: {
        byBook(bookId: number, showDeleted: boolean): Promise<Highlight[]>;
        byContent(content: string): Promise<Highlight | null>;
        create(
          data: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
        ): Promise<Highlight>;
        update(id: number, data: Partial<Highlight>): Promise<Highlight | null>;
        softDelete(id: number): Promise<boolean>;
        hardDelete(id: number): Promise<boolean>;
        restore(id: number): Promise<boolean>;
        exists(bookId: number, content: string): Promise<boolean>;
      };
    };
    electron: {
      selectCoverImage(): Promise<string | null>;
      openExternalUrl: (url: string) => Promise<void>;
      getDatabasePath: () => Promise<string>;
      openDatabaseFolder: () => Promise<void>;
      getCoversPath: () => Promise<string>;
      openCoversFolder: () => Promise<void>;
      cleanupCovers: () => Promise<number>;
    };
  }
}
