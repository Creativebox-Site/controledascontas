import { BarChart3, Receipt, TrendingUp, Tags, LogOut, ArrowDownCircle, ArrowUpCircle, Lightbulb, Target, Calculator } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Visão Geral", url: "/dashboard", icon: BarChart3, end: true },
  { title: "Receitas", url: "/dashboard/income", icon: ArrowUpCircle },
  { title: "Despesas", url: "/dashboard/expenses", icon: ArrowDownCircle },
  { title: "Transações", url: "/dashboard/transactions", icon: Receipt },
  { title: "Investimentos", url: "/dashboard/investments", icon: TrendingUp },
  { title: "Metas e Sonhos", url: "/dashboard/goals", icon: Target },
  { title: "Financiamento Inteligente", url: "/dashboard/financing", icon: Calculator },
  { title: "Análises e Insights", url: "/dashboard/insights", icon: Lightbulb },
  { title: "Categorias", url: "/dashboard/categories", icon: Tags },
];

interface AppSidebarProps {
  onSignOut: () => void;
}

export function AppSidebar({ onSignOut }: AppSidebarProps) {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={open ? "" : "sr-only"}>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button
            variant="ghost"
            onClick={onSignOut}
            className="w-full justify-start gap-3"
          >
            <LogOut className="h-5 w-5" />
            {open && <span>Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
