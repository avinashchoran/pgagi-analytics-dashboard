
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
  isLoading?: boolean;
}

const StatsCard = ({
  title,
  value,
  description,
  trend,
  icon: Icon,
  iconColor = "bg-dashboard-500",
  className,
  isLoading = false,
}: StatsCardProps) => {
  return (
    <div className={cn(
      "dash-card p-5 animate-fade-in",
      className
    )}>
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-4 w-24 bg-muted/50 rounded-md animate-pulse" />
          <div className="h-8 w-20 bg-muted/50 rounded-md animate-pulse" />
          <div className="h-4 w-32 bg-muted/50 rounded-md animate-pulse" />
        </div>
      ) : (
        <>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
            </div>
            {Icon && (
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                iconColor
              )}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center text-sm">
            {trend && (
              <div className={cn(
                "flex items-center gap-1 mr-2",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}>
                {trend.isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StatsCard;
