
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ZoomIn,
  ZoomOut,
  FileCheck2,
  Download,
  File as FileIcon,
  LoaderCircle,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useState } from 'react';
import Link from 'next/link';
import { useAdminRole } from '@/hooks/use-admin-role';

const preflightChecks = [
    { text: 'Size matches product (90x54mm + 3mm bleed)', status: 'pass' },
    { text: 'Colour space CMYK', status: 'warn', details: 'RGB objects found' },
    { text: 'Resolution ≥ 300dpi', status: 'pass' },
    { text: 'Fonts outlined/embedded', status: 'fail', details: 'Missing XYZ font' },
]

const getStatusIcon = (status:string) => {
    switch (status) {
        case 'pass': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'warn': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        case 'fail': return <XCircle className="h-5 w-5 text-destructive" />;
        default: return null;
    }
}

export default function ArtworkPage() {
    const firestore = useFirestore();
    const { isAdmin, isRoleLoading } = useAdminRole();
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const ordersWithArtworkQuery = useMemoFirebase(
        () => (firestore && isAdmin) ? query(collection(firestore, 'quotes'), where('status', '==', 'won'), where('artworkUrls', '!=', [])) : null,
        [firestore, isAdmin]
    );

    const { data: artworkQueue, isLoading: isLoadingQueue } = useCollection<any>(ordersWithArtworkQuery);
    
    const isLoading = isRoleLoading || (isAdmin && isLoadingQueue);

    if (isRoleLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    if (!isAdmin) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert /> Permission Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have the required permissions to view this page.</p>
          </CardContent>
        </Card>
      );
    }


  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Artwork</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manual Artwork Upload</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UploadCloud className="w-6 h-6" />
              <span className="font-semibold">Drop files / Browse</span>
            </div>
            <Input type="file" className="hidden" />
          </label>
          <div className="flex items-center gap-2">
            <Label htmlFor="link-order">Link to Order:</Label>
            <Input id="link-order" placeholder="#ID" className="w-24" />
          </div>
        </CardContent>
      </Card>
      <Sheet>
        <Card>
          <CardHeader>
            <CardTitle>Artwork Queue</CardTitle>
            <CardDescription>Orders with customer-supplied artwork awaiting review.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Assignee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                        </TableCell>
                    </TableRow>
                ) : artworkQueue && artworkQueue.length > 0 ? (
                    artworkQueue.map((item) => (
                    <SheetTrigger asChild key={item.id} onClick={() => setSelectedOrder(item)}>
                        <TableRow className="cursor-pointer">
                            <TableCell>#{item.id.substring(0, 6)}</TableCell>
                            <TableCell>{item.company || item.email}</TableCell>
                            <TableCell>{item.artworkUrls?.length || 0}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{item.productionStatus || 'Awaiting Artwork'}</Badge>
                            </TableCell>
                            <TableCell>Unassigned</TableCell>
                        </TableRow>
                    </SheetTrigger>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No orders with artwork in the queue.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {selectedOrder && (
        <SheetContent className="w-full sm:max-w-2xl p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>Artwork for Order #{selectedOrder.id.substring(0,6)}</SheetTitle>
            <SheetDescription>
                Review artwork, run preflight checks, and manage versions for this order.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6 space-y-6">
            <Card>
                <CardHeader><CardTitle>Artwork Files</CardTitle></CardHeader>
                <CardContent>
                    {selectedOrder.artworkUrls && selectedOrder.artworkUrls.length > 0 ? (
                        <ul className="space-y-2">
                            {selectedOrder.artworkUrls.map((url: string, index: number) => {
                                const fileName = decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'file');
                                return (
                                    <li key={index} className="flex items-center justify-between p-2 rounded-md border text-sm">
                                        <Link href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 truncate hover:underline">
                                            <FileIcon className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{fileName}</span>
                                        </Link>
                                        <Button asChild variant="ghost" size="icon" className="h-6 w-6">
                                           <a href={url} download={fileName}><Download className="h-4 w-4" /></a>
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No artwork files for this order.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Preflight Checks (Coming Soon)</CardTitle></CardHeader>
                <CardContent className="space-y-3 opacity-50">
                    {preflightChecks.map(check => (
                        <div key={check.text} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(check.status)}
                                <span>{check.text}</span>
                            </div>
                            {check.details && <Badge variant={check.status === 'fail' ? 'destructive' : 'secondary'}>{check.details}</Badge>}
                        </div>
                    ))}
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Versioning & Proofing (Coming Soon)</CardTitle></CardHeader>
                <CardContent className="space-y-4 opacity-50">
                    <div className="flex items-center gap-2 text-sm">
                        <span>Current: <Badge>v1</Badge></span>
                        <Button variant="outline" size="sm" disabled>Upload New Version</Button>
                        <Button variant="ghost" size="sm" disabled>Compare v1↔v2</Button>
                    </div>
                     <div className="flex items-center gap-2 text-sm">
                        <span>Proof:</span>
                        <Button variant="outline" size="sm" disabled>Send for Approval</Button>
                        <Button variant="outline" size="sm" className="border-green-500 text-green-500" disabled>Approved ✓</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader><CardTitle>Comments (Coming Soon)</CardTitle></CardHeader>
                 <CardContent>
                    <Textarea placeholder="Add a comment, @mention to notify..." disabled/>
                    <Button className="mt-2" disabled>Post Comment</Button>
                 </CardContent>
            </Card>
          </div>
        </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
