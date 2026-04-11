import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TimeoutError } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  showSuccessToast = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      rePassword: ['', [Validators.required]],
      tel: ['']
    }, { validators: this.passwordMatchValidator() });

    if (this.authService.isAuthenticated) {
      this.router.navigate(['/profile']);
    }
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const rePassword = control.get('rePassword')?.value;

      if (!password || !rePassword) {
        return null;
      }

      return password === rePassword ? null : { mismatch: true };
    };
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.registerForm.valid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, email, password, rePassword, tel } = this.registerForm.value;
    this.isSubmitting = true;

    this.authService.register(username, email, password, rePassword, tel || undefined)
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          this.showSuccessToast = true;
          this.successMessage = 'Registration successful! Redirecting to your profile...';
          this.registerForm.reset();

          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 1200);
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error, 'Registration failed. Please try again.');
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