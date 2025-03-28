
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UserProfile {
  username: string;
  weight?: number;
  height?: number;
}

interface PasswordChange {
  oldPassword: string;
  newPassword: string;
}

const updateProfile = async ({ profile, token }: { profile: UserProfile, token: string }) => {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profile)
  });

  if (!response.ok) {
    let errorMessage = 'Failed to update profile';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      console.error('Error parsing error response:', e);
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

const updatePassword = async ({ passwordData, token }: { passwordData: PasswordChange, token: string }) => {
  const response = await fetch('/api/users/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(passwordData)
  });

  if (!response.ok) {
    let errorMessage = 'Failed to update password';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      console.error('Error parsing error response:', e);
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update password');
    },
  });
};

export type { UserProfile, PasswordChange };
