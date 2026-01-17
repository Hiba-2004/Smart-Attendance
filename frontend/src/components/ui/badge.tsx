import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        // Status variants
        pending: "border-warning/30 bg-warning/15 text-warning",
        approved: "border-success/30 bg-success/15 text-success",
        rejected: "border-destructive/30 bg-destructive/15 text-destructive",
        info: "border-info/30 bg-info/15 text-info",
        // Type variants
        lecture: "border-primary/30 bg-primary/10 text-primary",
        tutorial: "border-accent/30 bg-accent/10 text-accent-foreground",
        lab: "border-info/30 bg-info/10 text-info",
        urgent: "border-destructive/30 bg-destructive/10 text-destructive",
        academic: "border-primary/30 bg-primary/10 text-primary",
        event: "border-accent/30 bg-accent/10 text-accent",
        general: "border-muted-foreground/30 bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
