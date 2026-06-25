import {
  FileText,
  LayoutDashboard,
  Layers3,
  LogOut,
  Shapes,
  Users2,
  Bot,
  BookOpen,
  Home,
  Settings,
  Phone,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCurrentUser } from "@/store/features/auth/authSlice";
import Logo from "@/components/logo/Logo";

const navItems = [
  { title: "Dashboard", to: "/dashboard", icon: Home },
  { title: "Leads", to: "/dashboard/leads", icon: Users2 },
  { title: "Sequences", to: "/create-sequence", icon: Layers3 },
  { title: "Templates (Playbooks)", to: "/dashboard/templates", icon: Shapes },
  { title: "Calls", to: "/dashboard/calls", icon: Phone },
  { title: "Messages", to: "/dashboard/messages", icon: MessageSquare },
  { title: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
  { title: "Transcripts", to: "/dashboard/transcripts", icon: FileText },
  { title: "Settings", to: "/dashboard/settings", icon: Settings },
  { title: "How to configure", to: "/dashboard/how-to-configure", icon: BookOpen },
];

const breadcrumbLabelMap: Record<string, string> = {
  dashboard: "Dashboard",
  docs: "Docs",
  "ai-credentials": "AI credentials",
  "fathom-transcripts": "Fathom transcripts",
  "retell-ai-calling": "Retell AI calling",
  "email-smtp": "Email (SMTP)",
  "sms-settings": "SMS settings",
  leads: "Leads",
  sequences: "Sequences",
  calls: "Calls",
  messages: "Messages",
  analytics: "Analytics",
  transcripts: "Transcripts",
  templates: "Templates",
  settings: "Settings",
  "how-to-configure": "How to configure",
  steps: "Steps",
  new: "New Template",
  edit: "Edit Template",
};

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(useCurrentUser);
  const activeItem = navItems.find((item) => item.to === location.pathname);
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbItems = pathSegments.reduce<Array<{ href: string; label: string }>>(
    (items, segment, index) => {
      const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        segment,
      );

      if (isUuidLike) {
        return items;
      }

      const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
      const label =
        breadcrumbLabelMap[segment] ??
        segment
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");

      items.push({ href, label });
      return items;
    },
    [],
  );
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-r bg-white">
        <SidebarHeader className="border-b bg-slate-50/70 px-4 py-3">
          <div className="flex items-center gap-2 text-indigo-600">
            {/* <Bot className="h-4 w-4" /> */}
            <Logo className="h-8 w-8"></Logo>
            <p className="text-sm font-semibold">Touch Base AI</p>
            {/* <p className="text-sm font-semibold">Follow-Up Agent</p> */}
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-3">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-700"
                  isActive={location.pathname === item.to}
                >
                  <NavLink to={item.to}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t p-3">
          <div className="mb-2 flex items-center gap-2 rounded-md bg-slate-50 p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-100 text-xs font-semibold text-indigo-700">
                U
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium text-slate-900">Email</p>
              <p className="text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-red-300 text-red-700 hover:bg-red-100"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <div key={item.href} className="inline-flex items-center gap-1.5">
                  <BreadcrumbItem>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 ? <BreadcrumbSeparator /> : null}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="min-w-0 overflow-x-hidden p-6">
          
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
