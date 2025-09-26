import { Routes } from "@angular/router";
import { CategoriesComponent } from "./categories/categories.component";
import { SubCategoriesComponent } from "./sub-categories/sub-categories.component";
import { ExpensesComponent } from "./expenses/expenses.component";

export const routes: Routes = [
  { path: "categories", component: CategoriesComponent },
  { path: "sub-categories", component: SubCategoriesComponent },
  { path: "expenses", component: ExpensesComponent },
  { path: "", redirectTo: "/categories", pathMatch: "full" },
];
