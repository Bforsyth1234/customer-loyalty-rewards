import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <nav class="bg-gradient-to-r from-red-500 to-pink-500 p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <a routerLink="/" class="text-white text-2xl font-bold">Loyalty Rewards</a>
        <div class="space-x-4">
          <ng-container *ngIf="authService.isAuthenticated$ | async; else loginLink">
            <a routerLink="/dashboard" routerLinkActive="bg-white bg-opacity-20" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition duration-300">Dashboard</a>
            <a routerLink="/customer-lookup" routerLinkActive="bg-white bg-opacity-20" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition duration-300">Customer Lookup</a>
            <button (click)="logout()" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition duration-300">Logout</button>
          </ng-container>
          <ng-template #loginLink>
            <a routerLink="/login" routerLinkActive="bg-white bg-opacity-20" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition duration-300">Login</a>
          </ng-template>
        </div>
      </div>
    </nav>
    <main class="container mx-auto mt-4">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f3f4f6;
    }
  `]
})
export class AppComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout().subscribe();
  }
}
