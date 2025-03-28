
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mockApiService } from './mockApiService';

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
  return await mockApiService.updateUserProfile(token, profile);
};

const updatePassword = async ({ passwordData, token }: { passwordData: PasswordChange, token: string }) => {
  return await mockApiService.updatePassword(token, passwordData.oldPassword, passwordData.newPassword);
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
