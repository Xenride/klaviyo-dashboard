import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  trend?: ReactNode;
}

export const KPICard = ({ title, value, change, changeType = "neutral", icon: Icon, trend }: KPICardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border bg-gradient-card p-6 shadow-card transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {change && (
              <span className={cn("text-sm font-medium", getChangeColor())}>
                {change}
              </span>
            )}
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4">
          {trend}
        </div>
      )}
      
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-primary opacity-0 transition-opacity group-hover:opacity-5" />
    </Card>
  );
};
