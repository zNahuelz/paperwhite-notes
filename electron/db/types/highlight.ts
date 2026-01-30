export interface Highlight {
  id: number;
  bookId: number;
  date: Date;
  location?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
