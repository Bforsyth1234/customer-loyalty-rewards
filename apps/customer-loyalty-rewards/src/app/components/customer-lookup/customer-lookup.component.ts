import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CustomerRewardsService } from '../../services/customer-rewards.service';

interface Rewards {
  phone: string;
  total_points: number;
  first_name: string;
  last_name: string;
}

@Component({
  selector: 'app-customer-lookup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, FontAwesomeModule],
  providers: [provideNgxMask()],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Look Up Customer Rewards
          </h2>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="lookupForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="phone-number" class="sr-only">Phone Number</label>
              <input id="phone-number" name="phone" type="text" formControlName="phone" required 
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm" 
                     placeholder="Phone Number" mask="(000) 000-0000">
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="lookupForm.invalid"
                    class="btn-gradient group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200">
              <fa-icon [icon]="faSearch" class="mr-2"></fa-icon> Look Up
            </button>
          </div>
        </form>
        <button (click)="openAddCustomerModal()"
                class="btn-gradient group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg hover:shadow-xl transition-all duration-200 mt-4">
          <fa-icon [icon]="faUserPlus" class="mr-2"></fa-icon> Add Customer
        </button>
        <div *ngIf="rewards" class="mt-8 p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold">Rewards for {{ rewards.phone }}</h3>
          <p>Total Points: {{ rewards.total_points }}</p>
        </div>
        <p *ngIf="errorMessage" class="mt-2 text-center text-sm text-red-600">
          {{ errorMessage }}
        </p>
      </div>
    </div>

    <!-- Add Customer Modal -->
    <div *ngIf="isAddCustomerModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Add Customer</h2>
        <form [formGroup]="addCustomerForm" (ngSubmit)="onAddCustomerSubmit()">
          <div class="mb-4">
            <label for="first-name" class="block text-sm font-medium text-gray-700">First Name</label>
            <input id="first-name" name="firstName" type="text" formControlName="firstName" required 
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" 
                   placeholder="First Name">
          </div>
          <div class="mb-4">
            <label for="last-name" class="block text-sm font-medium text-gray-700">Last Name</label>
            <input id="last-name" name="lastName" type="text" formControlName="lastName" required 
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" 
                   placeholder="Last Name">
          </div>
          <div class="mb-4">
            <label for="add-phone-number" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input id="add-phone-number" name="phone" type="text" formControlName="phone" required 
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" 
                   placeholder="Phone Number" mask="(000) 000-0000">
          </div>
          <div class="mb-4">
            <label for="total-points" class="block text-sm font-medium text-gray-700">Total Points</label>
            <input id="total-points" name="totalPoints" type="number" formControlName="totalPoints" required 
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" 
                   placeholder="Total Points">
          </div>
          <div class="flex justify-end">
            <button type="button" (click)="closeAddCustomerModal()"
                    class="mr-4 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              Cancel
            </button>
            <button type="submit" [disabled]="addCustomerForm.invalid"
                    class="btn-gradient py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CustomerLookupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private customerRewardsService = inject(CustomerRewardsService);
  private router = inject(Router);

  lookupForm = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
  });

  addCustomerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    totalPoints: ['', [Validators.required, Validators.min(0)]]
  });

  rewards: Rewards | null = null;
  errorMessage = '';
  isAddCustomerModalOpen = false;

  onSubmit(): void {
    if (this.lookupForm.valid) {
      const phone = this.lookupForm.value.phone?.replace(/\D/g, '') ?? '';
      this.lookupRewards(phone);
    }
  }

  async lookupRewards(phone: string) {
    const { data, error } = await this.customerRewardsService.lookupRewards(phone);

    if (error) {
      this.errorMessage = 'No rewards found for this phone number.';
      this.rewards = null;
    } else {
      this.rewards = data;
      this.errorMessage = '';
      this.lookupForm.reset();
      this.addCustomerForm.reset();
      // Navigate to the dashboard with the user's data
      this.router.navigate(['/dashboard'], { state: { userData: data } });
    }
  }

  openAddCustomerModal() {
    this.isAddCustomerModalOpen = true;
  }

  closeAddCustomerModal() {
    this.isAddCustomerModalOpen = false;
  }

  onAddCustomerSubmit(): void {
    if (this.addCustomerForm.valid) {
      const phone = this.addCustomerForm.value.phone?.replace(/\D/g, '') ?? '';
      const totalPointsString = this.addCustomerForm.value.totalPoints ?? '0';
      const total_points = parseInt(totalPointsString, 10);
      const first_name = this.addCustomerForm.value.firstName ?? '';
      const last_name = this.addCustomerForm.value.lastName ?? '';
      this.addCustomer({ phone, total_points, first_name, last_name });
    }
  }

  async addCustomer(customerRewards: Rewards) {
    const user = await this.authService.user$.pipe(take(1)).toPromise();
    if (user) {
      const rewardsWithEmail = { ...customerRewards, email: user.email };
      const { data, error } = await this.customerRewardsService.addCustomer(rewardsWithEmail);

      if (error) {
        console.error('Error adding customer:', error);
        this.errorMessage = 'Failed to add customer.';
      } else {
        this.closeAddCustomerModal();
        this.errorMessage = '';
        this.lookupForm.reset();
        this.addCustomerForm.reset();
        // Navigate to the dashboard with the new customer's data
        this.router.navigate(['/dashboard'], { state: { userData: data } });
      }
    } else {
      this.errorMessage = 'User not authenticated';
    }
  }

  faSearch = faSearch;
  faUserPlus = faUserPlus;
}