import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'https://localhost:3000/api';
  private readonly authOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string, rePassword: string, tel?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/register`,
      { username, email, password, rePassword, tel },
      this.authOptions
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }, this.authOptions);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, this.authOptions);
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

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/profile`, this.authOptions);
  }

  updateUserProfile(username: string, email: string, tel?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/profile`, { username, email, tel }, this.authOptions);
  }
}