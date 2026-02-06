export interface Book {
  id: number;
  title: string;
  author?: string;
  description?: string;
  cover?: string;
  highlightsAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
