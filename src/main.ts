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
              <a
                routerLink="/categories"
                appPatternActive
                matchType="exact"
                patternValue="/categories"
                class="nav-link"
                data-tooltip="Manage Categories"
                (click)="closeMobileSidebar()"
              >
                <span class="nav-link-icon">📁</span>
                <span class="nav-link-text">Manage Categories</span>
              </a>
            </li>
            <li class="nav-item">
              <a
                routerLink="/sub-categories"
                appPatternActive
                matchType="exact"
                patternValue="/sub-categories"
                class="nav-link"
                data-tooltip="Manage Sub-categories"
                (click)="closeMobileSidebar()"
              >
                <span class="nav-link-icon">📂</span>
                <span class="nav-link-text">Manage Sub-categories</span>
              </a>
            </li>
            <li class="nav-item">
              <a
                routerLink="/expenses"
                appPatternActive
                matchType="exact"
                patternValue="/expenses"
                class="nav-link"
                data-tooltip="Manage Expenses"
                (click)="closeMobileSidebar()"
              >
                <span class="nav-link-icon">💰</span>
                <span class="nav-link-text">Manage Expenses</span>
              </a>
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

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }
}

bootstrapApplication(App, {
  providers: [provideRouter(routes), provideHttpClient()],
});
