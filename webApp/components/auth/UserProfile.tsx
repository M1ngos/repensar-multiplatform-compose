'use client';

import { useAuth } from '@/lib/api';

export function UserProfile() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">User Profile</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Verified:</strong> {user?.is_verified ? 'Yes' : 'No'}</p>
        <p><strong>Member since:</strong> {user?.created_at && new Date(user.created_at).toLocaleDateString()}</p>
      </div>
      <button
        onClick={() => logout()}
        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}