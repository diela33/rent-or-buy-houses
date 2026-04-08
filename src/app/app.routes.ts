import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from './auth.guard';
import { ListingsComponent } from './listings/listings.component';
import { ListingEditorComponent } from './listing-editor/listing-editor.component';
import { listingOwnerGuard } from './listing-owner.guard';
import { ListingDetailsComponent } from './listing-details/listing-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'calculator', component: CalculatorComponent },
  { path: 'about', component: AboutComponent },
  { path: 'listings', component: ListingsComponent },
  { path: 'listings/create', component: ListingEditorComponent, canActivate: [authGuard] },
  { path: 'listings/:id/edit', component: ListingEditorComponent, canActivate: [authGuard, listingOwnerGuard] },
  { path: 'listings/:id', component: ListingDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
