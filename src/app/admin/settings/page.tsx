
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Update your business information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <Label htmlFor="business-name">Business Name</Label>
                        <Input id="business-name" defaultValue="Broad Options Media" />
                     </div>
                     <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" defaultValue="+2348022247567" />
                     </div>
                     <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="orders@bomedia.ng" />
                     </div>
                     <div>
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" defaultValue="Lagos, Nigeria" />
                     </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>Links to your social media profiles.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input id="instagram" placeholder="https://instagram.com/..." />
                     </div>
                     <div>
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input id="whatsapp" placeholder="https://wa.me/..." />
                     </div>
                     <div>
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input id="facebook" placeholder="https://facebook.com/..." />
                     </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>SEO Defaults</CardTitle>
                    <CardDescription>Default search engine optimization settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <Label htmlFor="seo-title">SEO Title</Label>
                        <Input id="seo-title" defaultValue="bomedia — Custom Print" />
                     </div>
                     <div>
                        <Label htmlFor="seo-description">SEO Description</Label>
                        <Textarea id="seo-description" defaultValue="Premium printing services..." />
                     </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button>Save Settings</Button>
            </div>
        </div>
    );
}

    