import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LoadingSpinner({ className, ...props }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center min-h-[50vh]", className)} {...props}>
      <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
    </div>
  );
}
