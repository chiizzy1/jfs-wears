import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  description?: string;
  breadcrumbs?: {
    label: string;
    href: string;
  }[];
  variant?: "default" | "feature" | "simple";
  alignment?: "left" | "center";
  className?: string;
}

export function PageHero({ title, description, breadcrumbs, variant = "default", alignment = "left", className }: PageHeroProps) {
  return (
    <div
      className={cn(
        "w-full pt-32 pb-12 md:pt-40 md:pb-24 transition-colors duration-300",
        variant === "default" && "bg-primary/5 text-primary",
        variant === "feature" && "bg-primary text-white", // Deprecated style, but kept for compatibility if needed
        variant === "simple" && "bg-transparent py-24",
        className,
      )}
    >
      <div className={cn("container-width px-4 md:px-8", alignment === "center" && "text-center")}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className={cn("mb-6 flex", alignment === "center" && "justify-center")}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* Title */}
        <h1
          className={cn(
            "text-4xl md:text-5xl font-light tracking-tight mb-4",
            variant === "feature" ? "font-bold" : "font-light",
          )}
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p
            className={cn(
              "text-lg max-w-2xl leading-relaxed",
              alignment === "center" && "mx-auto",
              variant === "feature" ? "text-gray-300" : "text-gray-500",
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
