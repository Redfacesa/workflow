import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  plan: string;
  credits: number;
  google_connected: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  driveConnected: boolean;

  // Auth methods
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; needsVerification: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;

  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;

  // Drive methods
  connectGoogleDrive: () => Promise<void>;
  disconnectGoogleDrive: () => Promise<void>;
  checkDriveConnection: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [driveConnected, setDriveConnected] = useState(false);

  const isAuthenticated = !!user && !!session;

  // Fetch or create user profile from profiles table
  const fetchProfile = useCallback(async (userId: string, userEmail?: string, userMeta?: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const newProfile = {
          id: userId,
          email: userEmail || '',
          full_name: userMeta?.full_name || userMeta?.name || '',
          avatar_url: userMeta?.avatar_url || null,
          plan: 'free',
          credits: 1000,
          google_connected: false,
          onboarding_completed: false,
        };
        const { data: created, error: createErr } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        
        if (createErr) {
          console.error('Error creating profile:', createErr);
          // Return a local profile object even if DB insert fails
          return { ...newProfile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as UserProfile;
        }
        return created as UserProfile;
      }
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as UserProfile;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  }, []);


  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
      setDriveConnected(profileData.google_connected);
    }
  }, [user, fetchProfile]);

  // Store Google provider token for Drive access
  const storeProviderToken = useCallback(async (newSession: Session) => {
    if (!newSession?.provider_token) return;
    
    try {
      const { error } = await supabase.functions.invoke('google-drive', {
        body: {
          action: 'store-token',
          access_token: newSession.provider_token,
          refresh_token: newSession.provider_refresh_token || null,
          expires_in: 3600,
        },
      });

      if (!error) {
        setDriveConnected(true);
        console.log('Google Drive token stored successfully');
      } else {
        console.error('Error storing Drive token:', error);
      }
    } catch (err) {
      console.error('Error in storeProviderToken:', err);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // If we have a provider token (fresh Google OAuth), store it
          if (currentSession.provider_token) {
            await storeProviderToken(currentSession);
          }
          
          // Fetch or create profile
          const profileData = await fetchProfile(
            currentSession.user.id,
            currentSession.user.email,
            currentSession.user.user_metadata
          );
          if (mounted && profileData) {
            setProfile(profileData);
            setDriveConnected(profileData.google_connected);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };


    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          // Store provider token if available (Google OAuth sign-in)
          if (newSession.provider_token) {
            await storeProviderToken(newSession);
          }

          // Small delay to allow trigger to create profile
          setTimeout(async () => {
            if (!mounted) return;
            const profileData = await fetchProfile(newSession.user.id);
            if (mounted && profileData) {
              setProfile(profileData);
              setDriveConnected(profileData.google_connected);
            }
          }, 500);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setDriveConnected(false);
        }

        if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          // If provider token is refreshed, store it
          if (newSession.provider_token) {
            await storeProviderToken(newSession);
          }
          const profileData = await fetchProfile(newSession.user.id);
          if (mounted && profileData) {
            setProfile(profileData);
            setDriveConnected(profileData.google_connected);
          }
        }

        if (event === 'USER_UPDATED' && newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          if (mounted && profileData) {
            setProfile(profileData);
            setDriveConnected(profileData.google_connected);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, storeProviderToken]);

  // Sign in with Google OAuth (requests Drive scope)
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'openid email profile https://www.googleapis.com/auth/drive.file',
      },
    });
    return { error };
  };

  // Connect Google Drive (re-auth with Drive scope if needed)
  const connectGoogleDrive = async () => {
    // Trigger Google OAuth with Drive scope
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}?drive_connected=true`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'openid email profile https://www.googleapis.com/auth/drive.file',
      },
    });
  };

  // Disconnect Google Drive
  const disconnectGoogleDrive = async () => {
    try {
      const { error } = await supabase.functions.invoke('google-drive', {
        body: { action: 'disconnect' },
      });
      if (!error) {
        setDriveConnected(false);
        if (profile) {
          setProfile({ ...profile, google_connected: false });
        }
      }
    } catch (err) {
      console.error('Error disconnecting Drive:', err);
    }
  };

  // Check Drive connection status
  const checkDriveConnection = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('google-drive', {
        body: { action: 'check-connection' },
      });
      if (error) {
        setDriveConnected(false);
        return false;
      }
      const connected = data?.connected ?? false;
      setDriveConnected(connected);
      return connected;
    } catch {
      setDriveConnected(false);
      return false;
    }
  };

  // Sign in with email/password
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // Sign up with email/password
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
        },
        emailRedirectTo: `${window.location.origin}`,
      },
    });

    // Check if email confirmation is needed
    const needsVerification = !error && data?.user && !data.user.confirmed_at;

    return { error, needsVerification: !!needsVerification };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setDriveConnected(false);
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?reset=true`,
    });
    return { error };
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  // Deduct credits
  const deductCredits = async (amount: number): Promise<boolean> => {
    if (!user || !profile) return false;
    if (profile.credits < amount) return false;

    const newCredits = profile.credits - amount;
    const { error } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, credits: newCredits } : null);
      return true;
    }
    return false;
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
    driveConnected,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    deductCredits,
    connectGoogleDrive,
    disconnectGoogleDrive,
    checkDriveConnection,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
