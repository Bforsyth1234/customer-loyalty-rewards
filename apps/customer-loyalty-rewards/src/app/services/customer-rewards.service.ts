import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

interface CustomerRewards {
  phone: string;
  total_points: number;
  first_name: string;
  last_name: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerRewardsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async lookupRewards(phone: string): Promise<{ data: CustomerRewards | null; error: any }> {
    const { data, error } = await this.supabase
      .from('customer_rewards')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      console.error('Error looking up rewards:', error);
      return { data: null, error };
    }

    return { data, error: null };
  }

  async addCustomer(customerRewards: CustomerRewards): Promise<{ data: CustomerRewards | null; error: any }> {
    const { data, error } = await this.supabase
      .from('customer_rewards')
      .insert([customerRewards])
      .select()
      .single();

    if (error) {
      console.error('Error adding customer:', error);
      return { data: null, error };
    }

    return { data, error: null };
  }
}