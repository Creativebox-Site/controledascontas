import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "danger";
  trend?: "up" | "down";
  value?: string;
}

export const InsightCard = ({ title, description, type, trend, value }: InsightCardProps) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "danger":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === "up" ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  return (
    <Card
      className={cn(
        "p-4 border-l-4 transition-all hover:shadow-md",
        type === "success" && "border-l-success bg-success/5",
        type === "warning" && "border-l-warning bg-warning/5",
        type === "danger" && "border-l-destructive bg-destructive/5",
        type === "info" && "border-l-primary bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-2 rounded-lg",
            type === "success" && "bg-success/10 text-success",
            type === "warning" && "bg-warning/10 text-warning",
            type === "danger" && "bg-destructive/10 text-destructive",
            type === "info" && "bg-primary/10 text-primary"
          )}
        >
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold">{title}</h4>
            {value && (
              <div className="flex items-center gap-1 text-sm font-semibold">
                {getTrendIcon()}
                <span>{value}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};
