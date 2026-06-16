'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

export default function ProfileSettings() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage(null);

    try {
      // 1. Update Profile (Display Name)
      if (displayName !== profile?.display_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // 2. Update Password if provided
      if (password) {
        const { error: authError } = await supabase.auth.updateUser({
          password: password
        });

        if (authError) throw authError;
        setPassword(''); // Clear password field on success
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent shrink-0">
          {displayName ? displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="overflow-hidden">
          <h3 className="text-lg font-bold text-text-primary truncate">
            {displayName || 'User'}
          </h3>
          <p className="text-sm text-text-muted truncate">{user?.email}</p>
        </div>
      </div>

      {message && (
        <div className={`p-3 mb-6 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                     : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-base-800 border border-base-600 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-base-800 border border-base-600 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
            placeholder="Leave blank to keep current"
          />
          <p className="text-xs text-text-muted mt-1">
            Only fill this if you want to change your password.
          </p>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
