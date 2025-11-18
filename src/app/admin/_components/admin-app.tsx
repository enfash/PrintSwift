
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
  HelpCircle,
  X,
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
  DropdownMenuFooter
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useAuth } from '@/firebase';
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
    { href: '/admin/faq', label: 'FAQs', icon: HelpCircle },
    { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
];

const insightsItems = [
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/admin/activity', label: 'Activity Log', icon: Activity },
];


const settingsItems = [
  { href: '/admin/users', label: 'Users & Roles', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];


function SidebarMenuContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const { open } = useSidebar();


  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
      onLinkClick?.();
    }
  };
  
  const renderMenuItems = (items: typeof catalogItems) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.label}>
        <Link href={item.href} onClick={onLinkClick}>
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
      <SidebarHeader className="border-b p-2 h-16 flex items-center justify-center">
         <Link href="/admin/dashboard" className="w-full" onClick={onLinkClick}>
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
              <Link href={item.href} onClick={onLinkClick}>
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
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs p-0 flex flex-col">
            <SheetHeader className="p-4 border-b">
                 <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <Logo className="h-8 w-auto" />
                 </Link>
                <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                <SheetDescription className="sr-only">Navigation links for the admin dashboard.</SheetDescription>
            </SheetHeader>
            <SidebarMenuContent onLinkClick={() => setIsOpen(false)} />
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:border-0 sm:bg-transparent sm:px-6">
      <div className="sm:hidden">
        <MobileSidebar />
      </div>
      <SidebarTrigger className="hidden sm:flex" />
      <div className="flex items-center gap-2 font-semibold">
        <Logo className="h-8 w-auto" />
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="grid gap-1">
              <p className="font-semibold">New Quote Request</p>
              <p className="text-xs text-muted-foreground">From Ada Ventures for Business Cards.</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="grid gap-1">
              <p className="font-semibold">Order Completed</p>
              <p className="text-xs text-muted-foreground">Order #ORD-001 has been marked as delivered.</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="grid gap-1">
              <p className="font-semibold">New Customer Signup</p>
              <p className="text-xs text-muted-foreground">jide.stores@example.com just signed up.</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/activity">View All Activity</Link>
            </Button>
          </DropdownMenuFooter>
        </DropdownMenuContent>
      </DropdownMenu>
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
          <div className="flex flex-col flex-grow transition-all duration-300 ease-in-out">
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
    <AdminProtectedContent>{children}</AdminProtectedContent>
  );
}

    