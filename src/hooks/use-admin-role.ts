
'use client';

import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * Custom hook to check if the current user has an admin role.
 * It encapsulates the logic of checking the /roles_admin/{uid} document.
 * @returns { a: boolean; isRoleLoading: boolean } An object containing the admin status and loading state.
 */
export function useAdminRole() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const adminRoleRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'roles_admin', user.uid) : null),
    [firestore, user]
  );
  
  const { data: adminRoleDoc, isLoading: isRoleDocLoading } = useDoc(adminRoleRef);

  const isAdmin = !!adminRoleDoc;
  const isRoleLoading = isAuthLoading || (!!user && isRoleDocLoading);

  return { isAdmin, isRoleLoading };
}
