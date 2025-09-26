export interface Expense {
  id: number;
  name: string;
  description: string;
  amount: number;
  date: Date;
  categoryId: number;
  subCategoryId: number;
  categoryName?: string;
  subCategoryName?: string;
}
