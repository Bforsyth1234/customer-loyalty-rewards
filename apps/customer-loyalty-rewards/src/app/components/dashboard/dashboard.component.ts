import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';

interface RecentActivity {
  description: string;
  date: string;
}

interface AvailableReward {
  id: number;
  description: string;
  point_cost: number;
}

interface CustomerRewards {
  id: number;
  first_name: string;
  last_name: string;
  total_points: number;
  phone: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div class="dashboard bg-gray-100 min-h-screen p-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">Welcome to Your Loyalty Dashboard</h1>
        <div *ngIf="authService.user$ | async as user" class="mb-8 p-4 bg-white rounded-lg shadow-md">
          <p class="text-lg">Hello, <span class="font-semibold">{{ user.email }}</span>!</p>
        </div>
        <div *ngIf="customerRewards" class="mb-8 p-4 bg-white rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">User Rewards Information</h2>
          <p class="text-lg">Name: <span class="font-bold">{{ customerRewards.first_name }} {{ customerRewards.last_name }}</span></p>
          <p class="text-lg">Phone: <span class="font-bold">{{ customerRewards.phone }}</span></p>
          <p class="text-lg">Total Points: <span class="font-bold">{{ customerRewards.total_points }}</span></p>
          <div class="flex space-x-4 mt-4">
            <button (click)="addGoogleReviewPoints()" class="btn-gradient py-2 px-4 rounded-md">
              Add 1000 Points for Google Review
            </button>
            <button (click)="addSocialSharingPoints()" class="btn-gradient py-2 px-4 rounded-md">
              Add 500 Points for Social Sharing
            </button>
          </div>
        </div>
        <div *ngIf="!customerRewards" class="mb-8 p-4 bg-white rounded-lg shadow-md">
          <p class="text-lg">No rewards information found. Please add a user first.</p>
        </div>
        <div class="dashboard-content space-y-8">
          <section class="available-rewards bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-xl font-semibold mb-4">Available Rewards</h2>
            <div class="flex flex-wrap gap-4">
              <button 
                *ngFor="let reward of availableRewards"
                (click)="redeemReward(reward)"
                [disabled]="!customerRewards || customerRewards.total_points < reward.point_cost"
                class="btn-gradient py-2 px-4 rounded-md text-sm flex-grow flex flex-col items-center justify-center min-w-[150px] h-24"
                [ngClass]="{'opacity-50 cursor-not-allowed': !customerRewards || customerRewards.total_points < reward.point_cost}"
              >
                <span class="font-semibold text-center">{{ reward.description }}</span>
                <span class="text-xs mt-2">({{ reward.point_cost }} points)</span>
              </button>
            </div>
          </section>
          <section class="recent-activity bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
            <ul class="space-y-2">
              <li *ngFor="let activity of recentActivities" class="text-gray-700">
                {{ activity.description }} <span class="text-sm text-gray-500">({{ activity.date }})</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-gradient {
      @apply bg-gradient-to-r from-red-500 to-pink-500 text-white transition-all duration-200 hover:from-red-600 hover:to-pink-600;
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private supabase: SupabaseClient;
  private router = inject(Router);

  customerRewards: CustomerRewards | null = null;
  recentActivities: RecentActivity[] = [];
  availableRewards: AvailableReward[] = [];

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.customerRewards = navigation.extras.state['userData'] as CustomerRewards;
    }
  }

  ngOnInit() {
    if (!this.customerRewards) {
      this.fetchCustomerRewards();
    }
    this.fetchRecentActivities();
    this.fetchAvailableRewards();
  }

  async fetchCustomerRewards() {
    const user = await this.authService.user$.pipe(take(1)).toPromise();
    if (user) {
      console.log('Fetching rewards for customer:', user.email);
      const { data, error } = await this.supabase
        .from('customer_rewards')
        .select('*')
        .eq('phone', user.phone);

      if (error) {
        console.error('Error fetching customer rewards:', error);
      } else if (data && data.length > 0) {
        console.log('Fetched customer rewards:', data[0]);
        this.customerRewards = data[0];
      } else {
        console.log('No rewards found for this customer');
        this.customerRewards = null;
      }
    } else {
      console.error('No authenticated user found');
    }
  }

  async fetchRecentActivities() {
    const { data, error } = await this.supabase
      .from('recent_activities')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent activities:', error);
    } else {
      this.recentActivities = data;
    }
  }

  async fetchAvailableRewards() {
    const { data, error } = await this.supabase
      .from('available_rewards')
      .select('*');

    if (error) {
      console.error('Error fetching available rewards:', error);
    } else {
      this.availableRewards = data;
    }
  }

  async addGoogleReviewPoints() {
    await this.addPoints(1000, 'Google review');
  }

  async addSocialSharingPoints() {
    await this.addPoints(500, 'social sharing');
  }

  private async addPoints(points: number, activity: string) {
    if (this.customerRewards) {
      const updatedPoints = this.customerRewards.total_points + points;
      console.log(`Attempting to add ${points} points for ${activity} to customer:`, this.customerRewards);
      
      const { data, error } = await this.supabase
        .from('customer_rewards')
        .update({ 
          total_points: updatedPoints
        })
        .eq('phone', this.customerRewards.phone)
        .select();
        
      if (error) {
        console.error(`Error adding ${activity} points:`, error);
      } else if (data && data.length > 0) {
        console.log('Update successful. New data:', data[0]);
        this.customerRewards = data[0];
        console.log(`${activity} points added successfully`);
        // Add a new recent activity
        await this.addRecentActivity(`Received ${points} points for ${activity}`);
        // Refresh recent activities
        await this.fetchRecentActivities();
      } else {
        console.error('No customer found with the given phone number:', this.customerRewards.phone);
      }
    } else {
      console.error('No customer rewards data available');
    }
  }

  async addRecentActivity(description: string) {
    const { error } = await this.supabase
      .from('recent_activities')
      .insert({ description, date: new Date().toISOString() });

    if (error) {
      console.error('Error adding recent activity:', error);
    }
  }

  async redeemReward(reward: AvailableReward) {
    if (this.customerRewards && this.customerRewards.total_points >= reward.point_cost) {
      const updatedPoints = this.customerRewards.total_points - reward.point_cost;
      console.log('Attempting to redeem reward for customer:', this.customerRewards);
      
      const { data, error } = await this.supabase
        .from('customer_rewards')
        .update({ 
          total_points: updatedPoints
        })
        .eq('phone', this.customerRewards.phone)
        .select();
        
      if (error) {
        console.error('Error redeeming reward:', error);
      } else if (data && data.length > 0) {
        console.log('Redemption successful. New data:', data[0]);
        this.customerRewards = data[0];
        console.log('Reward redeemed successfully');
        // Add a new recent activity
        await this.addRecentActivity(`Redeemed ${reward.description} for ${reward.point_cost} points`);
        // Refresh recent activities
        await this.fetchRecentActivities();
      } else {
        console.error('No customer found with the given phone number:', this.customerRewards.phone);
      }
    } else {
      console.error('Not enough points to redeem this reward');
    }
  }
}