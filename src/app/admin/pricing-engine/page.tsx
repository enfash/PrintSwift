
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function PricingEnginePage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Pricing Engine</h1>
                <Button>Save Changes</Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Global Settings</CardTitle>
                    <CardDescription>Set baseline pricing rules for your store.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="vat-toggle">Enable VAT</Label>
                            <p className="text-sm text-muted-foreground">Apply VAT to all orders.</p>
                        </div>
                        <Switch id="vat-toggle" defaultChecked />
                    </div>
                    <Separator />
                     <div>
                        <Label htmlFor="vat-rate">VAT Rate (%)</Label>
                        <Input id="vat-rate" type="number" defaultValue="7.5" className="max-w-xs" />
                     </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Quantity Discounts</CardTitle>
                    <CardDescription>Define discount tiers based on order quantity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                         <div>
                            <Label htmlFor="tier1-qty">Tier 1: Min. Quantity</Label>
                            <Input id="tier1-qty" placeholder="e.g., 100" />
                        </div>
                         <div>
                            <Label htmlFor="tier1-discount">Discount (%)</Label>
                            <Input id="tier1-discount" placeholder="e.g., 5" />
                        </div>
                        <Button variant="outline" className="w-full md:w-auto">Add Tier</Button>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Material Costs</CardTitle>
                    <CardDescription>Manage the cost of raw materials for accurate pricing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                         <div>
                            <Label htmlFor="material-name">Material</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select material"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="art-card">Art Card (300gsm)</SelectItem>
                                    <SelectItem value="vinyl">Flex Vinyl</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="material-cost">Cost per Unit</Label>
                            <Input id="material-cost" placeholder="e.g., 50" />
                        </div>
                        <Button variant="outline" className="w-full md:w-auto">Update Cost</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
