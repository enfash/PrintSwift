'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function TempAdminSetupPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const firestore = useFirestore();

  const handleMakeAdmin = async () => {
    setError('');
    setMessage('');

    if (!auth?.currentUser || !firestore) {
      setError('You must be logged in to perform this action.');
      return;
    }

    const user = auth.currentUser;
    const adminRoleDocRef = doc(firestore, 'roles_admin', user.uid);

    try {
      await setDoc(adminRoleDocRef, {
        email: user.email,
        createdAt: serverTimestamp(),
      });
      setMessage(
        `Success! User ${user.email} (${user.uid}) has been granted admin privileges. You can now access the admin pages. You may need to refresh the page.`
      );
    } catch (e: any) {
      console.error('Error creating admin role:', e);
      setError(`An error occurred: ${e.message}`);
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>Temporary Admin Setup</h1>
      <p>
        Click the button below to grant your currently logged-in user
        administrator privileges.
      </p>
      {auth?.currentUser ? (
        <div>
          <p>
            Logged in as: <strong>{auth.currentUser.email}</strong> (
            {auth.currentUser.uid})
          </p>
          <button onClick={handleMakeAdmin}>Make Me Admin</button>
        </div>
      ) : (
        <p>
          <strong>Please log in to your application first.</strong>
        </p>
      )}

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
