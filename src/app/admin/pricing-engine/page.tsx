
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

const addons = [
  { option: 'Lamination', value: 'Matte', type: 'per unit', cost: '3.50', active: true },
  { option: 'Lamination', value: 'Gloss', type: 'per unit', cost: '3.50', active: true },
  { option: 'Corners', value: 'Rounded', type: 'per order', cost: '2000', active: true },
  { option: 'Foil', value: 'Gold', type: 'per unit', cost: '12.00', active: true },
  { option: 'Turnaround', value: '24h Rush (x1.4)', type: 'multiplier', cost: '1.40', active: false },
];

const tiers = [
    { qty: 100, setup: 5000, unitCost: 95, margin: 35, customerPrice: 35000 },
    { qty: 500, setup: 5000, unitCost: 70, margin: 35, customerPrice: 120000 },
];

export default function PricingEnginePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pricing Engine</h1>
        <div className="flex items-center gap-2">
            <Button variant="destructive">Revert</Button>
            <Button variant="outline">Save Draft</Button>
            <Button>Publish Prices</Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label>Product:</Label>
                     <Select defaultValue="biz-cards">
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="biz-cards">Business Cards</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Label>Currency:</Label>
                    <Select defaultValue="ngn">
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="ngn">NGN</SelectItem></SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Label>Tax:</Label>
                <Input defaultValue="7.5%" className="w-20" />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Base</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Label>Paper Stock:</Label>
                <Select defaultValue="300gsm">
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="300gsm">300gsm Art Card</SelectItem></SelectContent>
                </Select>
            </div>
             <div className="flex items-center gap-2">
                <Label>Base Cost:</Label>
                <Input defaultValue="₦ 18.00 / unit" className="w-32"/>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Add-ons Matrix</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Option</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Cost Type</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Active</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {addons.map(addon => (
                                <TableRow key={addon.value}>
                                    <TableCell>{addon.option}</TableCell>
                                    <TableCell>{addon.value}</TableCell>
                                    <TableCell>{addon.type}</TableCell>
                                    <TableCell>₦ {addon.cost}</TableCell>
                                    <TableCell><Checkbox defaultChecked={addon.active}/></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Quantity Price Tiers</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Min Qty</TableHead>
                                <TableHead>Setup (₦)</TableHead>
                                <TableHead>Unit Cost (₦)</TableHead>
                                <TableHead>Margin %</TableHead>
                                <TableHead>Customer Price (₦)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {tiers.map(tier => (
                                <TableRow key={tier.qty}>
                                    <TableCell><Input defaultValue={tier.qty} className="w-20"/></TableCell>
                                    <TableCell><Input defaultValue={tier.setup.toLocaleString()} className="w-24"/></TableCell>
                                    <TableCell><Input defaultValue={tier.unitCost} className="w-20"/></TableCell>
                                    <TableCell><Input defaultValue={tier.margin} className="w-20"/></TableCell>
                                    <TableCell>{tier.customerPrice.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex gap-2">
                        <Button variant="outline">Add Tier</Button>
                        <Button variant="secondary">Bulk Import CSV</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
         <Card className="lg:sticky top-24">
            <CardHeader><CardTitle>Simulation Pane</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Label>Qty:</Label>
                    <Input defaultValue="500" className="w-24"/>
                    <Label>Options:</Label>
                    <div className="flex flex-wrap gap-1">
                        <Badge>Matte</Badge>
                        <Badge>Rounded</Badge>
                        <Badge variant="outline">Foil: None</Badge>
                        <Badge variant="outline">Turnaround: Standard</Badge>
                    </div>
                </div>
                <div className="p-4 bg-muted rounded-md text-sm">
                    <p className="font-mono">→ Price Breakdown: Setup ₦5,000 + Unit ₦70 x 500 + Margin 35% + VAT</p>
                    <p className="font-bold mt-2">→ Final: ₦120,000</p>
                </div>
                <Button className="w-full">Simulate</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
