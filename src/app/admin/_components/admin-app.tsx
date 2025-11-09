
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Tags,
  MessageSquareQuote,
  Megaphone,
  ImageIcon,
  Settings,
  Users,
  LogOut,
  Menu,
  Search,
  Bell,
  Package,
  LogIn,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FirebaseClientProvider } from '@/firebase';
import { LoaderCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';


// This hook should be defined in a separate file in a real app, e.g., hooks/use-dummy-auth.ts
// For this fix, we'll define it here to be self-contained with the component using it.
const useDummyUser = () => {
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [isUserLoading, setIsLoading] = useState(true); // Start as loading

    useEffect(() => {
        // Simulate checking session storage on component mount
        const storedUser = sessionStorage.getItem('dummyUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);

        // Listen for changes from other tabs
        const handleStorageChange = () => {
            const updatedUser = sessionStorage.getItem('dummyUser');
            setUser(updatedUser ? JSON.parse(updatedUser) : null);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);


    const logout = () => {
        sessionStorage.removeItem('dummyUser');
        setUser(null);
        window.dispatchEvent(new Event('storage'));
        return Promise.resolve();
    };

    return { user, logout, isUserLoading };
};


const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/admin/promos', label: 'Promos', icon: Megaphone },
  { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
];

const settingsItems = [
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/users', label: 'Users & Roles', icon: Users },
];

function SidebarMenuContent() {
  const pathname = usePathname();
  const { user, logout } = useDummyUser();
  const router = useRouter();


  const handleLogout = () => {
    logout().then(() => {
        router.push('/admin/login');
    });
  };

  const handleLogin = () => {
    router.push('/admin/login');
  }

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 font-semibold">
          <Logo />
          <span>PrintSwift Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className="w-full justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                   className="w-full justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
           <SidebarMenuItem>
            {user ? (
                <SidebarMenuButton onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="h-5 w-5" />
                    Logout
                </SidebarMenuButton>
            ) : (
                <SidebarMenuButton onClick={handleLogin} className="w-full justify-start">
                    <LogIn className="h-5 w-5" />
                    Login
                </SidebarMenuButton>
            )}
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs p-0 flex flex-col">
        <SidebarMenuContent />
      </SheetContent>
    </Sheet>
  );
}

function AdminHeader() {
  const { user, logout } = useDummyUser();
  const router = useRouter();

  const handleLogout = () => {
    logout().then(() => {
        router.push('/admin/login');
    });
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <MobileSidebar />
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                />
            </div>
        </form>
        <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                <AvatarImage src={''} alt="User avatar" />
                <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
                </Avatar>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/admin/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
   </header>
  );
}

export default function AdminApp({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useDummyUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (!isUserLoading && !user && pathname !== '/admin/login') {
            router.replace('/admin/login');
        }
    }
  }, [user, isUserLoading, router, pathname]);

  if (pathname === '/admin/login') {
    return (
      <FirebaseClientProvider>
        <div className="bg-background">{children}</div>
      </FirebaseClientProvider>
    );
  }

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If loading is finished and there's still no user, redirect.
  // This prevents rendering the admin shell for a split second before redirecting.
  if (!user) {
     return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
          <Sidebar>
             <SidebarMenuContent />
          </Sidebar>
          <div className="flex flex-col flex-1">
            <AdminHeader />
            <main className="flex-1 gap-4 p-4 sm:px-6 md:gap-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
