export interface Book {
  id: number;
  title: string;
  author?: string;
  description?: string;
  cover?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
