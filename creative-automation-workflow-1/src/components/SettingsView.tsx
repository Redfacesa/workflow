import React, { useState, useEffect } from 'react';
import {
  Settings, User, Palette, Link2, Key, Bell, Shield, HardDrive,
  Check, X, Eye, EyeOff, Save, Loader2, ChevronRight, Globe,
  Trash2, Plus, Upload, Camera, Moon, Sun, Monitor, ExternalLink,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type SettingsTab = 'account' | 'brand' | 'integrations' | 'notifications' | 'billing';

interface BrandKit {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  is_default: boolean;
}

interface SettingsViewProps {
  onNavigate?: (view: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const { profile, updateProfile, updatePassword, driveConnected, connectGoogleDrive, disconnectGoogleDrive, checkDriveConnection } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null);

  // Account settings
  const [displayName, setDisplayName] = useState(profile?.full_name || 'Creator');
  const [email, setEmail] = useState(profile?.email || '');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('English');

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Notification settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Integration states
  const [driveChecking, setDriveChecking] = useState(false);
  const [driveDisconnecting, setDriveDisconnecting] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);
  const [zapierConnected, setZapierConnected] = useState(false);

  useEffect(() => {
    loadBrandKits();
  }, []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || 'Creator');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const loadBrandKits = async () => {
    const { data } = await supabase.from('brand_kits').select('*').order('created_at');
    if (data) setBrandKits(data);
    else setBrandKits([{
      id: '1', name: 'Default Brand', primary_color: '#6366f1',
      secondary_color: '#ec4899', accent_color: '#06b6d4',
      font_heading: 'Inter', font_body: 'Inter', is_default: true
    }]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: displayName,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    const { error } = await updatePassword(newPassword);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  };

  const handleDriveConnect = async () => {
    setDriveChecking(true);
    try {
      await connectGoogleDrive();
    } catch {
      setDriveChecking(false);
    }
  };

  const handleDriveDisconnect = async () => {
    setDriveDisconnecting(true);
    try {
      await disconnectGoogleDrive();
    } finally {
      setDriveDisconnecting(false);
    }
  };

  const saveBrandKit = async (kit: BrandKit) => {
    if (kit.id.startsWith('new-')) {
      const { data } = await supabase.from('brand_kits').insert({
        name: kit.name, primary_color: kit.primary_color,
        secondary_color: kit.secondary_color, accent_color: kit.accent_color,
        font_heading: kit.font_heading, font_body: kit.font_body, is_default: kit.is_default
      }).select().single();
      if (data) setBrandKits(prev => [...prev.filter(k => k.id !== kit.id), data]);
    } else {
      await supabase.from('brand_kits').update({
        name: kit.name, primary_color: kit.primary_color,
        secondary_color: kit.secondary_color, accent_color: kit.accent_color,
        font_heading: kit.font_heading, font_body: kit.font_body
      }).eq('id', kit.id);
      setBrandKits(prev => prev.map(k => k.id === kit.id ? kit : k));
    }
    setEditingKit(null);
  };

  const deleteBrandKit = async (id: string) => {
    await supabase.from('brand_kits').delete().eq('id', id);
    setBrandKits(prev => prev.filter(k => k.id !== id));
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'brand', label: 'Brand Kits', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: Shield },
  ];

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-purple-600' : 'bg-gray-700'}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform`}
        style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }} />
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-400" />
            Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account, brand, and integrations</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {passwordSaved && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          <Check className="w-4 h-4" /> Password updated successfully!
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-[#1a1a2e]/60 rounded-xl border border-gray-800/50 p-2 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    activeTab === tab.id ? 'bg-purple-600/20 text-purple-300' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#1a1a2e]/60 rounded-xl border border-gray-800/50 overflow-hidden">
          {activeTab === 'account' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">Account Settings</h2>
              
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className="w-20 h-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center border-2 border-[#1a1a2e] hover:bg-purple-500 transition-colors">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{displayName}</p>
                  <p className="text-xs text-gray-500">{email}</p>
                  <p className="text-[10px] text-gray-600 mt-1">Plan: {profile?.plan || 'Free'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Name</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                  <input type="email" value={email} disabled
                    className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-500 cursor-not-allowed" />
                  <p className="text-[10px] text-gray-600 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Timezone</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
                    {['UTC', 'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'IST', 'JST', 'AEST'].map(tz => <option key={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
                    {['English', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Korean', 'Chinese'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Password change */}
              <div className="pt-4 border-t border-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Password</h3>
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    {showPasswordChange ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
                {showPasswordChange && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">New Password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm Password</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50" />
                    </div>
                    {passwordError && (
                      <div className="flex items-center gap-2 text-xs text-red-400">
                        <AlertCircle className="w-3.5 h-3.5" /> {passwordError}
                      </div>
                    )}
                    <button onClick={handlePasswordChange}
                      className="px-4 py-2 rounded-lg bg-purple-600/20 text-purple-300 text-xs font-medium hover:bg-purple-600/30 transition-colors">
                      Update Password
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-800/50">
                <h3 className="text-sm font-bold text-white mb-3">Danger Zone</h3>
                <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div>
                    <p className="text-sm font-medium text-red-400">Delete Account</p>
                    <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'brand' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Brand Kits</h2>
                <button onClick={() => setEditingKit({
                  id: `new-${Date.now()}`, name: 'New Brand Kit', primary_color: '#6366f1',
                  secondary_color: '#ec4899', accent_color: '#06b6d4',
                  font_heading: 'Inter', font_body: 'Inter', is_default: false
                })} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/20 text-purple-300 text-xs font-medium hover:bg-purple-600/30 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> New Brand Kit
                </button>
              </div>

              <div className="space-y-3">
                {brandKits.map(kit => (
                  <div key={kit.id} className="p-4 rounded-xl bg-gray-800/20 border border-gray-800/30 hover:border-gray-700/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {[kit.primary_color, kit.secondary_color, kit.accent_color].map((c, i) => (
                            <div key={i} className="w-6 h-6 rounded-md border border-gray-700" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{kit.name}</p>
                          <p className="text-[10px] text-gray-500">{kit.font_heading} / {kit.font_body}</p>
                        </div>
                        {kit.is_default && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold">Default</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingKit(kit)} className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-500 hover:text-white transition-colors">
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        {!kit.is_default && (
                          <button onClick={() => deleteBrandKit(kit.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {editingKit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEditingKit(null)}>
                  <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/50 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">{editingKit.id.startsWith('new-') ? 'New' : 'Edit'} Brand Kit</h3>
                        <button onClick={() => setEditingKit(null)} className="p-2 rounded-lg hover:bg-gray-800"><X className="w-4 h-4 text-gray-400" /></button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                        <input type="text" value={editingKit.name} onChange={e => setEditingKit({ ...editingKit, name: e.target.value })}
                          className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {(['primary_color', 'secondary_color', 'accent_color'] as const).map(key => (
                          <div key={key}>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">{key.replace('_', ' ').replace('color', '').trim()}</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={editingKit[key]} onChange={e => setEditingKit({ ...editingKit, [key]: e.target.value })}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                              <input type="text" value={editingKit[key]} onChange={e => setEditingKit({ ...editingKit, [key]: e.target.value })}
                                className="flex-1 px-2 py-1.5 bg-gray-800/30 border border-gray-700/50 rounded text-xs text-gray-300 focus:outline-none" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Heading Font</label>
                          <select value={editingKit.font_heading} onChange={e => setEditingKit({ ...editingKit, font_heading: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800/30 border border-gray-700/50 rounded-lg text-xs text-gray-300 focus:outline-none">
                            {['Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Roboto', 'Open Sans', 'Lato'].map(f => <option key={f}>{f}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Body Font</label>
                          <select value={editingKit.font_body} onChange={e => setEditingKit({ ...editingKit, font_body: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800/30 border border-gray-700/50 rounded-lg text-xs text-gray-300 focus:outline-none">
                            {['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro', 'Nunito'].map(f => <option key={f}>{f}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-700/30" style={{ background: `linear-gradient(135deg, ${editingKit.primary_color}15, ${editingKit.secondary_color}15)` }}>
                        <p className="text-xs text-gray-500 mb-2">Preview</p>
                        <div className="flex gap-2 mb-2">
                          {[editingKit.primary_color, editingKit.secondary_color, editingKit.accent_color].map((c, i) => (
                            <div key={i} className="w-10 h-10 rounded-lg" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <p className="text-sm font-bold" style={{ color: editingKit.primary_color }}>Heading Text</p>
                        <p className="text-xs text-gray-400">Body text example with your brand fonts</p>
                      </div>
                      <button onClick={() => saveBrandKit(editingKit)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all">
                        Save Brand Kit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">Integrations</h2>
              <div className="space-y-3">
                {/* Google Drive - Real integration */}
                <div className="p-4 rounded-xl bg-gray-800/20 border border-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10">
                        <HardDrive className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">Google Drive</p>
                          {driveConnected && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {driveConnected
                            ? 'Your generated content is saved to Google Drive'
                            : 'Save all creative assets to your Drive'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {driveConnected && onNavigate && (
                        <button
                          onClick={() => onNavigate('drive')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 text-xs hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Drive
                        </button>
                      )}
                      {driveConnected ? (
                        <button
                          onClick={handleDriveDisconnect}
                          disabled={driveDisconnecting}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          {driveDisconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={handleDriveConnect}
                          disabled={driveChecking}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                        >
                          {driveChecking ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          )}
                          Connect Google Drive
                        </button>
                      )}
                    </div>
                  </div>
                  {driveConnected && (
                    <div className="mt-3 pt-3 border-t border-gray-800/30">
                      <div className="flex items-center gap-4 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" /> Auto-save enabled
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" /> RedFace folder created
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" /> drive.file scope
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Other integrations */}
                {[
                  { name: 'Slack', desc: 'Get notifications and share content', icon: Globe, color: '#e11d48', connected: slackConnected, toggle: () => setSlackConnected(!slackConnected) },
                  { name: 'Zapier', desc: 'Connect to 5000+ apps', icon: Link2, color: '#f97316', connected: zapierConnected, toggle: () => setZapierConnected(!zapierConnected) },
                ].map(integration => {
                  const Icon = integration.icon;
                  return (
                    <div key={integration.name} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/20 border border-gray-800/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: integration.color + '15' }}>
                          <Icon className="w-5 h-5" style={{ color: integration.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{integration.name}</p>
                          <p className="text-xs text-gray-500">{integration.desc}</p>
                        </div>
                      </div>
                      <button onClick={integration.toggle}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                          integration.connected
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white'
                        }`}>
                        {integration.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-800/50">
                <h3 className="text-sm font-bold text-white mb-3">API Access</h3>
                <div className="p-4 rounded-xl bg-gray-800/20 border border-gray-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-400">Your API Key</p>
                    <button className="text-xs text-purple-400 hover:text-purple-300">Regenerate</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-900/50 rounded-lg text-xs text-gray-500 font-mono">
                      rf_sk_••••••••••••••••••••••••
                    </code>
                    <button className="px-3 py-2 rounded-lg bg-gray-800/50 text-gray-400 text-xs hover:text-white transition-colors">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', desc: 'Receive updates via email', value: emailNotifs, onChange: setEmailNotifs },
                  { label: 'Push Notifications', desc: 'Browser push notifications', value: pushNotifs, onChange: setPushNotifs },
                  { label: 'Weekly Digest', desc: 'Summary of your activity', value: weeklyDigest, onChange: setWeeklyDigest },
                  { label: 'Marketing Emails', desc: 'Tips, features, and offers', value: marketingEmails, onChange: setMarketingEmails },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/20 border border-gray-800/30">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Toggle value={item.value} onChange={item.onChange} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">Billing & Subscription</h2>
              
              <div className="p-5 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Current Plan</p>
                    <p className="text-2xl font-black text-white mt-1">{profile?.plan === 'pro' ? 'Pro' : profile?.plan === 'enterprise' ? 'Enterprise' : 'Free'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">
                      {profile?.plan === 'pro' ? '$79' : profile?.plan === 'enterprise' ? '$199' : '$0'}
                      <span className="text-sm text-gray-400 font-normal">/mo</span>
                    </p>
                    <p className="text-xs text-gray-500">Billed annually</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.min(((profile?.credits || 0) / 1000) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{profile?.credits || 0} / 1,000 credits</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-3">Usage This Month</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Text Generations', used: 156, total: 500 },
                    { label: 'Image Generations', used: 67, total: 200 },
                    { label: 'Video Generations', used: 12, total: 50 },
                    { label: 'Analyses', used: 12, total: 'Unlimited' },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl bg-gray-800/20 border border-gray-800/30">
                      <p className="text-lg font-bold text-white">{item.used}</p>
                      <p className="text-[10px] text-gray-500">{item.label}</p>
                      <p className="text-[10px] text-gray-600">of {item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all">
                  Upgrade Plan
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 text-sm hover:text-white transition-colors">
                  Manage Billing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
