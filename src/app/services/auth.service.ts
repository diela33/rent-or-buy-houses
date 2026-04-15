import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthUser {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  tel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly authOptions = { withCredentials: true };
  private readonly storageKey = 'rent-or-buy-user';
  private currentUserValue: AuthUser | null = this.readStoredUser();

  constructor(private http: HttpClient) {}

  get currentUser(): AuthUser | null {
    return this.currentUserValue;
  }

  get isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  get currentUserId(): string | null {
    return this.currentUserValue?._id || this.currentUserValue?.id || null;
  }

  register(username: string, email: string, password: string, rePassword: string, tel?: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(
      `${this.apiUrl}/register`,
      { username, email, password, repeatPassword: rePassword, tel },
      this.authOptions
    ).pipe(
      timeout(10000),
      tap((user) => this.setCurrentUser(user))
    );
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/login`, { email, password }, this.authOptions).pipe(
      timeout(10000),
      tap((user) => this.setCurrentUser(user))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, this.authOptions).pipe(
      tap(() => this.clearCurrentUser())
    );
  }

  getThemes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/themes`, this.authOptions);
  }

  createTheme(themeName: string, postText: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/themes`, { themeName, postText }, this.authOptions);
  }

  postComment(themeId: string, postText: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/themes/${themeId}`, { postText }, this.authOptions);
  }

  subscribeToTheme(themeId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/themes/${themeId}`, {}, this.authOptions);
  }

  getLatestPosts(limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts?limit=${limit}`, this.authOptions);
  }

  editPost(themeId: string, postId: string, postText: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/themes/${themeId}/posts/${postId}`, { postText }, this.authOptions);
  }

  deletePost(themeId: string, postId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/themes/${themeId}/posts/${postId}`, this.authOptions);
  }

  likePost(postId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/likes/${postId}`, {}, this.authOptions);
  }

  getUserProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/users/profile`, this.authOptions).pipe(
      timeout(10000),
      tap((user) => this.setCurrentUser(user))
    );
  }

  updateUserProfile(username: string, email: string, tel?: string): Observable<AuthUser> {
    return this.http.put<AuthUser>(`${this.apiUrl}/users/profile`, { username, email, tel }, this.authOptions).pipe(
      timeout(10000),
      tap((user) => this.setCurrentUser(user))
    );
  }

  restoreSession(): Observable<AuthUser> {
    return this.getUserProfile();
  }

  clearSession(): void {
    this.clearCurrentUser();
  }

  private setCurrentUser(user: AuthUser | null): void {
    const normalizedUser = this.normalizeUser(user);
    this.currentUserValue = normalizedUser;

    if (normalizedUser) {
      localStorage.setItem(this.storageKey, JSON.stringify(normalizedUser));
      return;
    }

    localStorage.removeItem(this.storageKey);
  }

  private clearCurrentUser(): void {
    this.setCurrentUser(null);
  }

  private readStoredUser(): AuthUser | null {
    const rawUser = localStorage.getItem(this.storageKey);

    if (!rawUser) {
      return null;
    }

    try {
      return this.normalizeUser(JSON.parse(rawUser) as AuthUser);
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private normalizeUser(user: AuthUser | null): AuthUser | null {
    if (!user) {
      return null;
    }

    const normalizedId = user._id || user.id;
    return {
      ...user,
      _id: normalizedId,
      id: normalizedId
    };
  }
}
