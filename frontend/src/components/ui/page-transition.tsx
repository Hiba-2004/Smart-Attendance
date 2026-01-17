import React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  return (
    <div className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
};

interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({ 
  children, 
  className,
  staggerDelay = 50 
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {React.Children.map(children, (child, index) => (
        <div 
          className="animate-slide-up"
          style={{ animationDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className,
  delay = 0 
}) => {
  return (
    <div 
      className={cn(
        "animate-slide-up transition-all duration-200 hover:shadow-md",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
