import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { RouterOutlet, RouterLink } from "@angular/router";
import { routes } from "./app/app.routes";
import { PatternActiveDirective } from "./app/directives/pattern-active.directive";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <div class="app-container">
      <header class="header">
        <h1 class="header-title">Expense Tracker</h1>
        <div class="header-actions">
          <div class="header-user">
            <div class="user-avatar">👤</div>
            <span>Welcome, User</span>
          </div>
        </div>
      </header>
      <button class="mobile-toggle" (click)="toggleMobileSidebar()">
        {{ isMobileSidebarOpen ? "✕" : "☰" }}
      </button>
      <div
        class="overlay"
        [class.active]="isMobileSidebarOpen"
        (click)="closeMobileSidebar()"
      ></div>
      <aside
        class="sidebar"
        [class.collapsed]="isSidebarCollapsed"
        [class.mobile-visible]="isMobileSidebarOpen"
      >
        <div class="sidebar-header">
          <h1>Expense Manager</h1>
          <button class="toggle-btn" (click)="toggleSidebar()">
            {{ isSidebarCollapsed ? "→" : "←" }}
          </button>
        </div>
        <nav>
          <ul class="nav-menu">
            <li class="nav-item">
              <div class="nav-parent">
                <a
                  routerLink="/categories"
                  appPatternActive
                  matchType="exact"
                  patternValue="/categories"
                  class="nav-link"
                  data-tooltip="Categories"
                  (click)="handleCategoriesClick($event)"
                >
                  <span class="nav-link-icon">📁</span>
                  <span class="nav-link-text">Categories</span>
                  <span class="nav-expand-icon" [class.expanded]="isCategoriesExpanded">
                    {{ isCategoriesExpanded ? '▼' : '▶' }}
                  </span>
                </a>
                <ul class="nav-submenu" [class.expanded]="isCategoriesExpanded">
                  <li class="nav-subitem">
                    <a
                      routerLink="/categories/manage"
                      appPatternActive
                      matchType="startsWith"
                      patternValue="/categories/manage"
                      class="nav-sublink"
                      data-tooltip="Manage Categories"
                      (click)="closeMobileSidebar()"
                    >
                      <span class="nav-sublink-icon">⚙️</span>
                      <span class="nav-sublink-text">Manage</span>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
            <li class="nav-item">
              <div class="nav-parent">
                <a
                  routerLink="/sub-categories"
                  appPatternActive
                  matchType="exact"
                  patternValue="/sub-categories"
                  class="nav-link"
                  data-tooltip="Sub-categories"
                  (click)="handleSubCategoriesClick($event)"
                >
                  <span class="nav-link-icon">📂</span>
                  <span class="nav-link-text">Sub-categories</span>
                  <span class="nav-expand-icon" [class.expanded]="isSubCategoriesExpanded">
                    {{ isSubCategoriesExpanded ? '▼' : '▶' }}
                  </span>
                </a>
                <ul class="nav-submenu" [class.expanded]="isSubCategoriesExpanded">
                  <li class="nav-subitem">
                    <a
                      routerLink="/sub-categories/manage"
                      appPatternActive
                      matchType="startsWith"
                      patternValue="/sub-categories/manage"
                      class="nav-sublink"
                      data-tooltip="Manage Sub-categories"
                      (click)="closeMobileSidebar()"
                    >
                      <span class="nav-sublink-icon">⚙️</span>
                      <span class="nav-sublink-text">Manage</span>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
            <li class="nav-item">
              <div class="nav-parent">
                <a
                  routerLink="/expenses"
                  appPatternActive
                  matchType="exact"
                  patternValue="/expenses"
                  class="nav-link"
                  data-tooltip="Expenses"
                  (click)="handleExpensesClick($event)"
                >
                  <span class="nav-link-icon">💰</span>
                  <span class="nav-link-text">Expenses</span>
                  <span class="nav-expand-icon" [class.expanded]="isExpensesExpanded">
                    {{ isExpensesExpanded ? '▼' : '▶' }}
                  </span>
                </a>
                <ul class="nav-submenu" [class.expanded]="isExpensesExpanded">
                  <li class="nav-subitem">
                    <a
                      routerLink="/expenses/manage"
                      appPatternActive
                      matchType="startsWith"
                      patternValue="/expenses/manage"
                      class="nav-sublink"
                      data-tooltip="Manage Expenses"
                      (click)="closeMobileSidebar()"
                    >
                      <span class="nav-sublink-icon">⚙️</span>
                      <span class="nav-sublink-text">Manage</span>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      </aside>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <footer class="footer">
        <p>&copy; 2025 Expense Tracker. All rights reserved.</p>
      </footer>
    </div>
  `,
  imports: [RouterOutlet, RouterLink, PatternActiveDirective],
})
export class App {
  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;
  isCategoriesExpanded = false;
  isSubCategoriesExpanded = false;
  isExpensesExpanded = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  handleMenuClick(event: Event, menuType: 'categories' | 'subCategories' | 'expenses') {
    // Check if the click was on the expand icon
    const target = event.target as HTMLElement;
    if (target.classList.contains('nav-expand-icon') || target.closest('.nav-expand-icon')) {
      event.preventDefault();
      event.stopPropagation();
      
      // Close other submenus when opening this one
      this.closeAllSubmenus();
      
      // Toggle the clicked menu
      switch (menuType) {
        case 'categories':
          this.isCategoriesExpanded = !this.isCategoriesExpanded;
          break;
        case 'subCategories':
          this.isSubCategoriesExpanded = !this.isSubCategoriesExpanded;
          break;
        case 'expenses':
          this.isExpensesExpanded = !this.isExpensesExpanded;
          break;
      }
    } else {
      // If clicking on the main link, navigate normally and close all submenus
      this.closeAllSubmenus();
      this.closeMobileSidebar();
    }
  }

  handleCategoriesClick(event: Event) {
    this.handleMenuClick(event, 'categories');
  }

  handleSubCategoriesClick(event: Event) {
    this.handleMenuClick(event, 'subCategories');
  }

  handleExpensesClick(event: Event) {
    this.handleMenuClick(event, 'expenses');
  }

  private closeAllSubmenus() {
    this.isCategoriesExpanded = false;
    this.isSubCategoriesExpanded = false;
    this.isExpensesExpanded = false;
  }
}

bootstrapApplication(App, {
  providers: [provideRouter(routes), provideHttpClient()],
});
