import { Link } from "wouter";
import { Download } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-5xl h-16 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-sm">
            <Download className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Insta<span className="gradient-text">Grabber</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </Link>
        </nav>
      </div>
    </header>
  );
}
