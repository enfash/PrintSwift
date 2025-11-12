
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, LoaderCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format } from 'date-fns';

const getPromoStatus = (promo: any) => {
  const now = new Date();
  const startDate = promo.startDate?.toDate();
  const endDate = promo.endDate?.toDate();

  if (endDate && endDate < now) return { label: 'Expired', variant: 'outline' };
  if (startDate && startDate > now) return { label: 'Scheduled', variant: 'secondary' };
  if (promo.active) return { label: 'Active', variant: 'default' };
  return { label: 'Inactive', variant: 'destructive' };
};

export default function PromosPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const promosRef = useMemoFirebase(() => firestore ? collection(firestore, 'promos') : null, [firestore]);
  const { data: promos, isLoading } = useCollection<any>(promosRef);

  const toggleActive = (id: string, currentStatus: boolean) => {
    if (!firestore) return;
    const promoDocRef = doc(firestore, 'promos', id);
    updateDocumentNonBlocking(promoDocRef, { active: !currentStatus });
    toast({
      title: 'Promo Updated',
      description: `Promotion status has been changed.`,
    });
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const promoDocRef = doc(firestore, 'promos', id);
    deleteDocumentNonBlocking(promoDocRef);
    toast({
      title: 'Promotion Deleted',
      description: 'The promotion has been successfully deleted.',
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
        <Button asChild>
            <Link href="/admin/promos/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Promo
            </Link>
        </Button>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Manage Promotions</CardTitle>
          <CardDescription>Control popups and top-bar announcements.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Active Toggle</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : promos && promos.length > 0 ? (
                promos.map((promo) => {
                  const status = getPromoStatus(promo);
                  return (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.title}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{promo.placement}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant as any}>{status.label}</Badge>
                    </TableCell>
                     <TableCell className="text-sm text-muted-foreground">
                        {promo.startDate ? format(promo.startDate.toDate(), 'PP') : 'N/A'} - {promo.endDate ? format(promo.endDate.toDate(), 'PP') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={promo.active}
                        onCheckedChange={() => toggleActive(promo.id, promo.active)}
                        aria-label="Toggle Active"
                      />
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/promos/${promo.id}`}>Edit</Link>
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this promotion. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(promo.id)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )})
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No promotions found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
