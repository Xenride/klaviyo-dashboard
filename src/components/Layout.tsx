import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, PenTool, Palette, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDateRange } from "@/context/DateRangeContext"; // <--- Importante

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", icon: Home, label: "Executive Overview" },
  { path: "/copywriter", icon: PenTool, label: "Copywriter" },
  { path: "/designer", icon: Palette, label: "Designer" },
  { path: "/account-manager", icon: Users, label: "Account Manager" },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { rangeDays, setRangeDays } = useDateRange(); // <--- Consumimos el contexto

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card shadow-card">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-border px-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <div>
                <h1 className="text-sm font-bold">Klaviyo</h1>
                <p className="text-xs text-muted-foreground">KPI Board</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn("w-full justify-start gap-3", isActive && "bg-primary text-primary-foreground")}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">

              {/* comentado temporalmente mientras no se use */}
              
              {/* <Calendar className="h-5 w-5 text-muted-foreground" /> */}
              
              {/* SELECT CONECTADO AL CONTEXTO */}
              {/* <Select 
                value={rangeDays.toString()} 
                onValueChange={(val) => setRangeDays(parseInt(val))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select> */}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right mr-2">
                <p className="text-sm font-medium">Analytics User</p>
                <p className="text-xs text-muted-foreground">admin@company.com</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/50" />
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};