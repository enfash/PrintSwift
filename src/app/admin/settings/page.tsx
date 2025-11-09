
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

export default function SettingsPage() {
    return (
        <>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Website Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Page Coming Soon</h3>
                        <p className="mt-1 text-sm text-muted-foreground">This feature is currently under construction.</p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
