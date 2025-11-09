
'use client';

import React from 'react';
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
  ChevronDown,
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
import { FirebaseClientProvider, useUser, useAuth } from '@/firebase';
import { LoaderCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import LoginPage from '../login/page';
import { signOut } from 'firebase/auth';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { 
    href: '/admin/products', 
    label: 'Products', 
    icon: Package,
    subItems: [
        { href: '/admin/products', label: 'All Products' },
        { href: '/admin/products/new', label: 'Add New' },
    ]
  },
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
  const auth = useAuth();
  const router = useRouter();


  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
    }
  };

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 font-semibold">
          <Logo />
          <span className="text-lg">Bomedia Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
             item.subItems ? (
                <Collapsible key={item.label} className="w-full" defaultOpen={pathname.startsWith(item.href)}>
                    <CollapsibleTrigger asChild className="w-full">
                        <SidebarMenuButton
                            isActive={pathname.startsWith(item.href) && !item.subItems.some(si => si.href === pathname)}
                            className="w-full justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </div>
                            <ChevronDown className="h-4 w-4" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6">
                        <SidebarMenu>
                         {item.subItems.map(subItem => (
                            <SidebarMenuItem key={subItem.label}>
                                <Link href={subItem.href}>
                                    <SidebarMenuButton
                                        variant="ghost"
                                        isActive={pathname === subItem.href}
                                        className="w-full justify-start"
                                    >
                                    {subItem.label}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                         ))}
                         </SidebarMenu>
                    </CollapsibleContent>
                </Collapsible>
             ) : (
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
             )
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
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
                <SidebarMenuButton onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="h-5 w-5" />
                    Logout
                </SidebarMenuButton>
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
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
    }
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <MobileSidebar />
        <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ''} alt="User avatar" />
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
   </header>
  );
}


function AdminProtectedContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  React.useEffect(() => {
    if (!isUserLoading) {
      if (!user && !isLoginPage) {
          router.replace('/admin/login');
      }
      if (user && isLoginPage) {
          router.replace('/admin/dashboard');
      }
    }
  }, [user, isUserLoading, router, pathname, isLoginPage]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user && isLoginPage) {
      return <LoginPage />;
  }

  if (user) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
          <Sidebar className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-card sm:flex">
            <SidebarMenuContent />
          </Sidebar>
          <div className="flex flex-col sm:pl-60 flex-grow">
            <AdminHeader />
            <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-4 md:gap-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <LoaderCircle className="h-8 w-8 animate-spin" />
    </div>
  );
}


export default function AdminApp({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
        <AdminProtectedContent>{children}</AdminProtectedContent>
    </FirebaseClientProvider>
  );
}
