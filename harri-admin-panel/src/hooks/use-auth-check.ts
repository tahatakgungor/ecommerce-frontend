"use client"
import { useState, useEffect } from 'react';
import { RootState } from './../redux/store';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useLazyGetCurrentAdminQuery } from '@/redux/auth/authApi';
import { userLoggedOut } from '@/redux/auth/authSlice';

export default function useAuthCheck() {
  const {user} = useSelector((state:RootState) => state.auth)
  const dispatch = useDispatch();
  const [fetchCurrentAdmin] = useLazyGetCurrentAdminQuery();
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    fetchCurrentAdmin()
      .unwrap()
      .catch(() => dispatch(userLoggedOut()))
      .finally(() => setAuthChecked(true));
  }, [dispatch, fetchCurrentAdmin]);

  return {
    authChecked,
    user,
  };
  
}
