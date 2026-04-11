import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { TimeoutError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  loginForm: FormGroup;
  errorMessage: string = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });

    if (this.authService.isAuthenticated) {
      this.router.navigate(['/profile']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.loginForm.valid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    this.isSubmitting = true;

    this.authService.login(email, password)
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          this.loginForm.reset();
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error, 'Login failed. Please check your credentials.');
        }
      });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof TimeoutError) {
      return 'The server did not respond in time. Please make sure backend is running on port 3000.';
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Cannot reach the server. Please make sure backend is running on port 3000.';
      }

      return error.error?.message || fallback;
    }

    return fallback;
  }
}