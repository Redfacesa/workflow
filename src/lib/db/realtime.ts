// Real-time subscription manager for Supabase
// Handles live updates for workflows, executions, and other data

import { supabase } from '../supabase';
import { RealtimeEvent, RealtimeEventHandler } from '../types/database';

interface Subscription {
  id: string;
  table: string;
  handler: RealtimeEventHandler;
  unsubscribe: () => Promise<void>;
}

class RealtimeManager {
  private subscriptions: Map<string, Subscription> = new Map();

  /**
   * Subscribe to changes on a specific table
   */
  subscribe(
    table: string,
    userId: string,
    handler: RealtimeEventHandler,
    subscriptionId?: string
  ): string {
    const id = subscriptionId || `${table}:${userId}:${Date.now()}`;

    // Check if already subscribed
    if (this.subscriptions.has(id)) {
      console.warn(`Already subscribed to ${id}`);
      return id;
    }

    // Build filter based on table
    let filter = `user_id=eq.${userId}`;

    // Add table-specific filters
    switch (table) {
      case 'workflows':
        filter = `user_id=eq.${userId}`;
        break;
      case 'workflow_executions':
        filter = `user_id=eq.${userId}`;
        break;
      case 'api_keys':
        filter = `user_id=eq.${userId}`;
        break;
      case 'audit_logs':
        filter = `user_id=eq.${userId}`;
        break;
      // Add other table-specific filters as needed
    }

    const subscription = supabase
      .channel(`${table}:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload: any) => {
          const event: RealtimeEvent = {
            type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            table,
            record: payload.new || payload.old,
          };

          handler(event);
        }
      )
      .subscribe(
        (status, err) => {
          if (status === 'CHANNEL_ERROR') {
            console.error(`Realtime error for ${table}:`, err);
          }
        }
      );

    // Store subscription
    this.subscriptions.set(id, {
      id,
      table,
      handler,
      unsubscribe: async () => {
        await supabase.removeChannel(subscription);
      },
    });

    return id;
  }

  /**
   * Unsubscribe from a specific subscription
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      console.warn(`Subscription ${subscriptionId} not found`);
      return;
    }

    await subscription.unsubscribe();
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Unsubscribe from all subscriptions for a table
   */
  async unsubscribeFromTable(table: string): Promise<void> {
    const idsToDelete: string[] = [];

    for (const [id, sub] of this.subscriptions.entries()) {
      if (sub.table === table) {
        await sub.unsubscribe();
        idsToDelete.push(id);
      }
    }

    idsToDelete.forEach(id => this.subscriptions.delete(id));
  }

  /**
   * Unsubscribe from all subscriptions (cleanup)
   */
  async unsubscribeAll(): Promise<void> {
    for (const [, sub] of this.subscriptions.entries()) {
      await sub.unsubscribe();
    }
    this.subscriptions.clear();
  }

  /**
   * Get list of active subscriptions (for debugging)
   */
  getActiveSubscriptions(): Array<{
    id: string;
    table: string;
  }> {
    return Array.from(this.subscriptions.values()).map(sub => ({
      id: sub.id,
      table: sub.table,
    }));
  }
}

// Singleton instance
let realtimeInstance: RealtimeManager | null = null;

export const getRealtimeManager = (): RealtimeManager => {
  if (!realtimeInstance) {
    realtimeInstance = new RealtimeManager();
  }
  return realtimeInstance;
};

export default RealtimeManager;
