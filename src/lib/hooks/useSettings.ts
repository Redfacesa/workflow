// React hooks for managing user settings (brand and account)

import { useEffect, useState, useCallback } from 'react';
import { BrandSettings, AccountSettings, DatabaseError } from '../types/database';
import { db } from './queries';

interface UseSettingsState<T> {
  settings: T | null;
  loading: boolean;
  error: DatabaseError | null;
  isSaving: boolean;
}

/**
 * Hook to fetch and manage brand settings for a user
 */
export const useBrandSettings = (userId: string) => {
  const [state, setState] = useState<UseSettingsState<BrandSettings>>({
    settings: null,
    loading: true,
    error: null,
    isSaving: false,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchBrandSettings = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await db.getBrandSettings(userId);
        setState(prev => ({
          ...prev,
          settings: data || {
            id: '',
            user_id: userId,
            brand_name: null,
            primary_color: null,
            secondary_color: null,
            accent_color: null,
            logo_url: null,
            font_family: 'Inter',
            font_size_base: 16,
            border_radius: 8,
            brand_voice: null,
            tagline: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          loading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
          loading: false,
        }));
      }
    };

    fetchBrandSettings();
  }, [userId]);

  const updateBrandSettings = useCallback(
    async (updates: Partial<Omit<BrandSettings, 'id' | 'created_at' | 'updated_at'>>) => {
      try {
        setState(prev => ({ ...prev, isSaving: true }));
        const updated = await db.upsertBrandSettings(userId, updates);
        setState(prev => ({
          ...prev,
          settings: updated,
          isSaving: false,
        }));
        return updated;
      } catch (error) {
        const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
        setState(prev => ({ ...prev, error: dbError, isSaving: false }));
        throw dbError;
      }
    },
    [userId]
  );

  const resetBrandSettings = useCallback(async () => {
    const defaultSettings: Omit<BrandSettings, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      brand_name: null,
      primary_color: '#000000',
      secondary_color: '#ffffff',
      accent_color: '#0066cc',
      logo_url: null,
      font_family: 'Inter',
      font_size_base: 16,
      border_radius: 8,
      brand_voice: 'professional',
      tagline: null,
    };

    return updateBrandSettings(defaultSettings);
  }, [userId, updateBrandSettings]);

  return {
    ...state,
    updateBrandSettings,
    resetBrandSettings,
  };
};

/**
 * Hook to fetch and manage account settings for a user
 */
export const useAccountSettings = (userId: string) => {
  const [state, setState] = useState<UseSettingsState<AccountSettings>>({
    settings: null,
    loading: true,
    error: null,
    isSaving: false,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchAccountSettings = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await db.getAccountSettings(userId);
        setState(prev => ({
          ...prev,
          settings: data || {
            id: '',
            user_id: userId,
            theme: 'auto',
            notifications_enabled: true,
            email_on_completion: true,
            email_on_error: true,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            language: navigator.language || 'en',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          loading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error)),
          loading: false,
        }));
      }
    };

    fetchAccountSettings();
  }, [userId]);

  const updateAccountSettings = useCallback(
    async (updates: Partial<Omit<AccountSettings, 'id' | 'created_at' | 'updated_at'>>) => {
      try {
        setState(prev => ({ ...prev, isSaving: true }));
        const updated = await db.upsertAccountSettings(userId, updates);
        setState(prev => ({
          ...prev,
          settings: updated,
          isSaving: false,
        }));
        return updated;
      } catch (error) {
        const dbError = error instanceof DatabaseError ? error : new DatabaseError('UNKNOWN', String(error));
        setState(prev => ({ ...prev, error: dbError, isSaving: false }));
        throw dbError;
      }
    },
    [userId]
  );

  const resetAccountSettings = useCallback(async () => {
    const defaultSettings: Omit<AccountSettings, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      theme: 'auto',
      notifications_enabled: true,
      email_on_completion: true,
      email_on_error: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      language: navigator.language || 'en',
    };

    return updateAccountSettings(defaultSettings);
  }, [userId, updateAccountSettings]);

  return {
    ...state,
    updateAccountSettings,
    resetAccountSettings,
  };
};
