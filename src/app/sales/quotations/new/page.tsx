'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectQuotationNew() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/sales/quotations/create');
  }, [router]);
  return null;
}
