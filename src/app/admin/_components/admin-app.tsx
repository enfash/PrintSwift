
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
  Palette,
  BarChart2,
  Activity,
  FileText,
  ShoppingCart,
  PanelLeft,
  Home,
  FileQuestion,
  Book,
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
  SidebarTrigger,
  useSidebar,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import LoginPage from '../login/page';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';


const catalogItems = [
    { 
        href: '/admin/products', 
        label: 'Products', 
        icon: Package,
    },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
];

const orderManagementItems = [
    { href: '/admin/quote-requests', label: 'Quote Requests', icon: FileQuestion },
    { href: '/admin/quotes', label: 'Quotes', icon: FileText },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Customers', icon: Users },
]

const toolsItems = [
    { href: '/admin/artwork', label: 'Artwork', icon: Palette },
    { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { href: '/admin/promos', label: 'Promos', icon: Megaphone },
    { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
];

const insightsItems = [
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/admin/activity', label: 'Activity Log', icon: Activity },
];


const settingsItems = [
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/users', label: 'Users & Roles', icon: Users },
];


function SidebarMenuContent() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const { open } = useSidebar();


  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
    }
  };
  
  const renderMenuItems = (items: typeof catalogItems) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.label}>
        <Link href={item.href}>
            <SidebarMenuButton
            isActive={pathname.startsWith(item.href)}
            className="w-full justify-start"
            tooltip={item.label}
            >
                <item.icon className="h-5 w-5" />
                <span className={cn(!open && "hidden")}>{item.label}</span>
            </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    ));
  };

  return (
    <>
      <SidebarHeader className="border-b p-2 h-14 flex items-center justify-center">
         <Link href="/admin/dashboard" className="w-full">
            <SidebarMenuButton
                isActive={pathname === '/admin/dashboard'}
                className="w-full justify-start"
                tooltip="Dashboard"
            >
                <LayoutDashboard className="h-5 w-5" />
                <span className={cn(!open && "hidden")}>Dashboard</span>
            </SidebarMenuButton>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        
        <SidebarMenu className="mt-4 border-t pt-4">
            <span className={cn("text-xs text-muted-foreground px-2 mb-2 flex items-center gap-2", !open && "hidden")}>
                <Book className="h-4 w-4"/> Catalog
            </span>
            {renderMenuItems(catalogItems)}
        </SidebarMenu>
        
        <SidebarMenu className="mt-4 border-t pt-4">
            <span className={cn("text-xs text-muted-foreground px-2 mb-2", !open && "hidden")}>Order Management</span>
            {renderMenuItems(orderManagementItems)}
        </SidebarMenu>

        <SidebarMenu className="mt-4 border-t pt-4">
            <span className={cn("text-xs text-muted-foreground px-2 mb-2", !open && "hidden")}>Tools</span>
            {renderMenuItems(toolsItems)}
        </SidebarMenu>
        
        <SidebarMenu className="mt-4 border-t pt-4">
            <span className={cn("text-xs text-muted-foreground px-2 mb-2", !open && "hidden")}>Insights</span>
            {renderMenuItems(insightsItems)}
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
                   tooltip={item.label}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn(!open && "hidden")}>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
           <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="w-full justify-start" tooltip="Logout">
                    <LogOut className="h-5 w-5" />
                    <span className={cn(!open && "hidden")}>Logout</span>
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
        {/*
// @ts-ignore */}
        <SheetTrigger>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
        </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs p-0 flex flex-col">
        <SheetHeader>
          <SheetTitle className="sr-only">Admin Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation links for the admin dashboard.
          </SheetDescription>
        </SheetHeader>
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
        <div className="sm:hidden">
            <MobileSidebar />
        </div>
        <SidebarTrigger className="hidden sm:flex" />
        <div className="flex items-center gap-2 font-semibold">
          <Logo />
          <span className="text-lg">BOMedia</span>
        </div>
        <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
        </div>
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <Home className="h-5 w-5" />
          </Link>
        </Button>
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
          <Sidebar>
            <SidebarMenuContent />
          </Sidebar>
          <div className="flex flex-col flex-grow sm:pl-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar-wrapper:sm:pl-[var(--sidebar-width)] transition-all duration-300 ease-in-out">
            <AdminHeader />
            <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-4 md:gap-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Fallback for non-user, non-login page case during initial load.
  // This helps prevent rendering children that might rely on an authenticated user.
  if (!isLoginPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return null;
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
