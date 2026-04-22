import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 py-8 mt-auto">
      <div className="container mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-sm font-medium text-foreground">InstaGrabber</p>
          <p className="text-xs text-muted-foreground">Not affiliated with Instagram or Meta.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/how-it-works" className="hover:text-foreground transition-colors">
            How it works
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
