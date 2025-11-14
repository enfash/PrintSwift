
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, Download } from 'lucide-react';
import Link from 'next/link';
import CustomerTable from '@/components/admin/customers/CustomerTable';
import { useToast } from '@/hooks/use-toast';

export default function CustomersPage() {
    const { toast } = useToast();

    const exportCSV = () => {
        // In a real app, this would trigger a download from the CustomerTable component's state
        // or a server-side endpoint. For now, we link it conceptually.
        document.dispatchEvent(new CustomEvent('export-customers-csv'));
        toast({ title: 'Export Initiated', description: 'Your CSV download will begin shortly.'});
    }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast({ title: 'Coming Soon!', description: 'CSV import will be available in a future update.'})}>
                <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button asChild>
                <Link href="/admin/customers/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
                </Link>
            </Button>
        </div>
      </div>
      <CustomerTable />
    </>
  );
}
