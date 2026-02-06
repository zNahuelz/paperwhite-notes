export interface Highlight {
  id: number;
  bookId: number;
  date: Date | null;
  location?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
