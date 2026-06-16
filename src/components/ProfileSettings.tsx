'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export default function ProfileSettings() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
            Password & Security
          </label>
          <div className="flex items-center justify-between p-4 bg-base-800 border border-base-600 rounded-lg">
            <div>
              <p className="text-sm font-bold text-text-primary">Change Password</p>
              <p className="text-xs text-text-muted mt-1">Update your password securely.</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Change
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-base-700">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Saving Profile...' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>

      {isPasswordModalOpen && (
        <ChangePasswordModal 
          onClose={() => setIsPasswordModalOpen(false)}
          onSuccess={() => {
            setIsPasswordModalOpen(false);
            setMessage({ type: 'success', text: 'Password successfully updated!' });
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}
    </div>
  );
}
