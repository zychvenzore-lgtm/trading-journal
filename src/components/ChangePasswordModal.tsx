'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength states
  const [hasLength, setHasLength] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);
  
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  useEffect(() => {
    setHasLength(newPassword.length >= 8);
    setHasUpper(/[A-Z]/.test(newPassword));
    setHasNumber(/[0-9]/.test(newPassword));
    setHasSpecial(/[^A-Za-z0-9]/.test(newPassword));
  }, [newPassword]);

  const isPasswordStrong = hasLength && hasUpper && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (!isPasswordStrong) {
      setError('Please ensure your new password meets all strength requirements.');
      return;
    }
    if (!isMatch) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect.');
      }

      // 2. Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Success
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-base-900 border border-base-700 rounded-xl w-full max-w-md shadow-2xl animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-700 flex justify-between items-center bg-base-800">
          <h3 className="text-lg font-bold text-text-primary">Change Password</h3>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-base-800 border border-base-600 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-base-800 border border-base-600 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter new password"
            />
            
            {/* Password Strength Indicators */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center gap-1.5 ${hasLength ? 'text-green-500' : 'text-text-muted'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasLength ? 'bg-green-500' : 'bg-base-600'}`} />
                8+ Characters
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-green-500' : 'text-text-muted'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasUpper ? 'bg-green-500' : 'bg-base-600'}`} />
                1 Uppercase
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-green-500' : 'text-text-muted'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-green-500' : 'bg-base-600'}`} />
                1 Number
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-green-500' : 'text-text-muted'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasSpecial ? 'bg-green-500' : 'bg-base-600'}`} />
                1 Special Char
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-base-800 border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none transition-colors ${
                confirmPassword 
                  ? isMatch 
                    ? 'border-green-500/50 focus:border-green-500' 
                    : 'border-red-500/50 focus:border-red-500'
                  : 'border-base-600 focus:border-accent'
              }`}
              placeholder="Re-enter new password"
            />
            {confirmPassword && !isMatch && (
              <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || !isPasswordStrong || !isMatch || !currentPassword}
            >
              {loading ? 'Verifying...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
