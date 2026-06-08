import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<AuthResponse | null>(this.loadUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'Admin');
  readonly isBarber = computed(() => this._currentUser()?.role === 'Barber');
  readonly isClient = computed(() => this._currentUser()?.role === 'Client');

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => this.saveUser(response))
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(response => this.saveUser(response))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const user = this._currentUser();
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, {
      accessToken: user?.accessToken,
      refreshToken: user?.refreshToken
    }).pipe(tap(response => this.saveUser(response)));
  }

  logout(): void {
    localStorage.removeItem('barberia_user');
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._currentUser()?.accessToken ?? null;
  }

  private saveUser(user: AuthResponse): void {
    localStorage.setItem('barberia_user', JSON.stringify(user));
    this._currentUser.set(user);
  }

  private loadUser(): AuthResponse | null {
    const stored = localStorage.getItem('barberia_user');
    return stored ? JSON.parse(stored) : null;
  }
}
