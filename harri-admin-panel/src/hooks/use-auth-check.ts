"use client"
import { useState, useEffect } from 'react';
import { RootState } from './../redux/store';
import { useSelector } from 'react-redux';

export default function useAuthCheck() {
  const {user} = useSelector((state:RootState) => state.auth)
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    // Güvenlik gereği admin auth persistence cookie'den yüklenmiyor.
    // Session refresh sonrası kullanıcı yeniden login olur.
    setAuthChecked(true);
  }, [setAuthChecked]);

  return {
    authChecked,
    user,
  };
  
}
