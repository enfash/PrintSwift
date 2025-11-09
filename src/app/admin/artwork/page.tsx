
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
  SheetTrigger,
} from '@/components/ui/sheet';

const artworkQueue = [
  {
    id: 201,
    orderId: '#412',
    customer: 'Ada Ventures',
    file: 'card-v1.pdf',
    stage: 'Preflight',
    assignee: 'Tola',
  },
  {
    id: 202,
    orderId: '#413',
    customer: 'Jide Stores',
    file: 'banner.ai',
    stage: 'Proofing',
    assignee: 'Uche',
  },
];

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
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Artwork</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload / Queue</CardTitle>
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Assignee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artworkQueue.map((item) => (
                  <SheetTrigger asChild key={item.id}>
                    <TableRow className="cursor-pointer">
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.orderId}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell>{item.file}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.stage}</Badge>
                      </TableCell>
                      <TableCell>{item.assignee}</TableCell>
                    </TableRow>
                  </SheetTrigger>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <SheetContent className="w-full sm:max-w-2xl p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>Artwork Detail (ID 201)</SheetTitle>
          </SheetHeader>
          <div className="p-6 space-y-6">
            <Card>
                <CardContent className="p-2 bg-muted aspect-[4/3] flex items-center justify-center">
                    <FileCheck2 className="h-24 w-24 text-muted-foreground" />
                </CardContent>
                <CardContent className="p-2 border-t flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon"><ZoomIn/></Button>
                    <Button variant="ghost" size="icon"><ZoomOut/></Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="ghost" size="sm">Soft-Proof CMYK</Button>
                    <Button variant="ghost" size="sm">Check Overprint</Button>
                    <Button variant="ghost" size="sm">Bleed Guides</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Preflight Checks</CardTitle></CardHeader>
                <CardContent className="space-y-3">
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
                <CardHeader><CardTitle>Versioning & Proofing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span>Current: <Badge>v3</Badge></span>
                        <Button variant="outline" size="sm">Upload New Version</Button>
                        <Button variant="ghost" size="sm">Compare v2↔v3</Button>
                        <Button variant="ghost" size="sm">Restore v2</Button>
                    </div>
                     <div className="flex items-center gap-2 text-sm">
                        <span>Proof:</span>
                        <Button variant="outline" size="sm">Generate Proof PDF</Button>
                        <Button variant="outline" size="sm">Send for Approval</Button>
                        <Button variant="outline" size="sm" className="border-green-500 text-green-500">Approved ✓</Button>
                        <Button variant="outline" size="sm" className="border-destructive text-destructive">Rejected ✗</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader><CardTitle>Comments</CardTitle></CardHeader>
                 <CardContent>
                    <Textarea placeholder="Add a comment, @mention to notify..."/>
                    <Button className="mt-2">Post Comment</Button>
                 </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
