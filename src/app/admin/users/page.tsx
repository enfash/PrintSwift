
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function UsersPage() {
    return (
        <>
             <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Users & Roles</h1>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Manage Users</CardTitle>
                    <CardDescription>Add, remove, or edit user roles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Coming Soon</h3>
                        <p className="mt-1 text-sm text-muted-foreground">User management is under construction.</p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

    