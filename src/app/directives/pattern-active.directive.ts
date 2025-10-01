import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

@Directive({
  selector: "[appPatternActive]",
  standalone: true,
})
export class PatternActiveDirective implements OnInit, OnDestroy {
  @Input() matchType: "exact" | "contains" | "startsWith" | "regex" = "exact";
  @Input() patternValue: string = "";

  private routerSubscription?: Subscription;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnInit() {
    // Check initial route
    this.updateActiveClass();

    // Subscribe to router events
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveClass();
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateActiveClass() {
    const currentUrl = this.router.url;
    const isActive = this.isPatternMatch(
      currentUrl,
      this.patternValue,
      this.matchType
    );

    if (isActive) {
      this.renderer.addClass(this.elementRef.nativeElement, "active");
      this.addExpandedToChildren();
    } else {
      this.renderer.removeClass(this.elementRef.nativeElement, "active");
      this.removeExpandedFromChildren();
    }
  }

  private addExpandedToChildren() {
    // This prevents auto-opening when parent link is active
    // const element = this.elementRef.nativeElement;
    // const parent = element.parentElement;
    // const children = parent?.querySelectorAll("ul, .nav-expand-icon");
    // children.forEach((child: Element) => {
    //   this.renderer.addClass(child, "expanded");
    // });
  }

  private removeExpandedFromChildren() {
 
    // This prevents auto-closing when parent link is not active
    // const element = this.elementRef.nativeElement;
    // const parent = element.parentElement;
    // const children = parent?.querySelectorAll("ul, .nav-expand-icon");
    // children.forEach((child: Element) => {
    //   this.renderer.removeClass(child, "expanded");
    // });
  }

  private isPatternMatch(
    url: string,
    pattern: string,
    matchType: string
  ): boolean {
    if (!pattern) {
      return false;
    }

    switch (matchType) {
      case "exact":
        return url === pattern;
      case "contains":
        return url.includes(pattern);
      case "startsWith":
        return url.startsWith(pattern);
      case "regex":
        try {
          const regex = new RegExp(pattern);
          return regex.test(url);
        } catch (error) {
          console.warn("Invalid regex pattern:", pattern);
          return false;
        }
      default:
        return url === pattern;
    }
  }
}
