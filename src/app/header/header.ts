import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  private readonly authService = inject(AuthService);
  isMenuOpen = false;

  constructor(
    private router: Router
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  get currentUserName(): string {
    return this.authService.currentUser?.username ?? 'Account';
  }
  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.authService.restoreSession().subscribe({
        error: () => this.authService.clearSession()
      });
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  goTo(path: string): void {
    this.closeMenu();
    this.router.navigateByUrl(path);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.closeMenu();
        this.router.navigate(['/']);
      },
      error: () => {
        this.authService.clearSession();
        this.closeMenu();
        this.router.navigate(['/login']);
      }
    });
  }
}
