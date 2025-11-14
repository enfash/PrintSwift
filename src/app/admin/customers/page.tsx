
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import CustomerTable from '@/components/admin/customers/CustomerTable';

export default function CustomersPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Button asChild>
          <Link href="/admin/customers/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
          </Link>
        </Button>
      </div>
      <CustomerTable />
    </>
  );
}
