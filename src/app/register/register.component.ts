import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rePassword: ['', [Validators.required]],
      tel: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const rePassword = form.get('rePassword');
    if (password && rePassword && password.value !== rePassword.value) {
      rePassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { username, email, password, rePassword, tel } = this.registerForm.value;
      this.authService.register(username, email, password, rePassword, tel || undefined).subscribe({
        next: (response) => {
          this.successMessage = 'Registration successful! You can now log in.';
          this.registerForm.reset();
          console.log('Registration successful', response);
        },
        error: (error) => {
          this.errorMessage = 'Registration failed. Please try again.';
          console.error('Registration error', error);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all fields correctly.';
      // Mark all fields as touched to show errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}