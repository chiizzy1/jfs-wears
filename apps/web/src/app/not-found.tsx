import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-secondary text-primary px-4">
      <h1 className="text-[12rem] font-bold leading-none select-none opacity-10">404</h1>
      <div className="absolute flex flex-col items-center gap-6">
        <h2 className="text-3xl font-heading font-semibold">Page not found</h2>
        <p className="text-lg text-muted-foreground text-center max-w-md">
          Sorry, we couldn't find the page you're looking for. It seems you've ventured into unchartered territory.
        </p>
        <Link
          href="/"
          className="group flex items-center gap-2 px-6 py-3 bg-primary text-secondary rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return Home
        </Link>
      </div>
    </div>
  );
}
