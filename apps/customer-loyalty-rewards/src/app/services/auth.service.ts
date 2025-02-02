import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, from, map, of, tap } from 'rxjs';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private supabase: SupabaseClient;

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  isAuthenticated$ = this.user$.pipe(
    map(user => !!user)
  );

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    this.initializeSession();
  }

  private async initializeSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session) {
      this.userSubject.next(session.user);
    }

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.userSubject.next(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        this.userSubject.next(null);
      }
    });
  }

  login(email: string, password: string): Observable<User | null> {
    return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
      map(response => response.data.user),
      tap(user => {
        if (user) {
          this.userSubject.next(user);
        }
      })
    );
  }

  register(email: string, password: string): Observable<any> {
    return from(this.supabase.auth.signUp({ email, password })).pipe(
      map(response => response.data.user),
      catchError(error => {
        console.error('Registration error:', error);
        return of(null);
      })
    );
  }

  logout(): Observable<void> {
    return from(this.supabase.auth.signOut()).pipe(
      map(() => void 0),    
      tap(() => {
        this.userSubject.next(null);
        this.router.navigate(['/login']);
      })
    );
  }

  // Add other auth-related methods as needed
}