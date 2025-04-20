import React from "react";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  footer?: React.ReactNode;
}

const WidgetCard = ({ 
  title, 
  children, 
  className,
  isLoading = false,
  footer
}: WidgetCardProps) => {
  return (
    <div className={cn(
      "bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm",
      "rounded-xl border border-muted/30 shadow-sm",
      "transition-all duration-200 hover:shadow-md",
      className
    )}>
      <div className="px-4 py-3 border-b border-muted/20">
        <h3 className="font-medium text-foreground/80">{title}</h3>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <div className="h-24 bg-muted/30 rounded-md animate-pulse" />
            <div className="h-4 w-3/4 bg-muted/30 rounded-md animate-pulse" />
            <div className="h-4 w-1/2 bg-muted/30 rounded-md animate-pulse" />
          </div>
        ) : children}
      </div>
      
      {footer && (
        <div className="p-3 border-t border-muted/20 bg-muted/10">
          {footer}
        </div>
      )}
    </div>
  );
};

export default WidgetCard;
