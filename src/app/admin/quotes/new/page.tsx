
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Trash2,
  Copy,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const lineItems = [
  {
    id: 1,
    product: 'Business Cards',
    qty: 500,
    unit: 'pcs',
    options: '300gsm, Matte, RC',
    unitPrice: 120,
    sum: 60000,
  },
  {
    id: 2,
    product: 'Roll-up Banner',
    qty: 2,
    unit: 'pcs',
    options: '85x200, Eco Solvent',
    unitPrice: 30000,
    sum: 60000,
  },
];

export default function NewQuotePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">New Quote</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button>Submit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="col-span-1 space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer & Job Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Search/Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ada-ventures">Ada Ventures</SelectItem>
                    <SelectItem value="jide-stores">Jide Stores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="auto from customer" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="auto/override" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="auto/override" />
              </div>
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Pick a date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="draft">
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items (Products & Options)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="text-right">Unit ₦</TableHead>
                    <TableHead className="text-right">Sum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.options}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.sum.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
                <Button variant="ghost" size="sm">
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes-customer">Notes to Customer</Label>
                <Textarea id="notes-customer" />
              </div>
              <div>
                <Label htmlFor="notes-internal">Internal Notes</Label>
                <Textarea id="notes-internal" />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right Column */}
        <div className="col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₦ 120,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <Input className="h-8 max-w-24 text-right" defaultValue="10,000" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (7.5%)</span>
                <span>₦ 8,250</span>
              </div>
              <div className="flex justify-between">
                 <span className="text-muted-foreground">Delivery</span>
                <Input className="h-8 max-w-24 text-right" defaultValue="5,000" />
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL</span>
                <span>₦ 123,250</span>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground space-y-2">
                 <div className="flex justify-between">
                    <span>Requested By:</span>
                    <span className="font-medium text-foreground">Elijah</span>
                </div>
                 <div className="flex justify-between">
                    <span>Valid Until:</span>
                    <span className="font-medium text-foreground">{format(new Date(), "PP")}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="w-full">Recalculate</Button>
                <Button variant="outline" className="w-full">Add Deposit %</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
       <Card className="fixed bottom-0 left-0 right-0 border-t rounded-none sm:left-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar-wrapper:sm:left-[var(--sidebar-width)] transition-all duration-300 ease-in-out">
            <CardContent className="p-4 flex items-center justify-end gap-2">
                <Button variant="secondary">Send Quote Email</Button>
                <Button variant="secondary">Generate PDF</Button>
                <Button>Convert to Order</Button>
                <Button variant="ghost" className="text-muted-foreground">Archive</Button>
            </CardContent>
        </Card>
    </div>
  );
}
