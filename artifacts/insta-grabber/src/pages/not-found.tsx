import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SearchX, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-1 text-center px-4 py-20">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8 shadow-sm border">
          <SearchX className="w-12 h-12 text-muted-foreground" />
        </div>
        
        <h1 className="text-6xl font-black tracking-tighter mb-4 text-foreground">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        
        <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
          Looks like this link is broken or the page has been removed. Let's get you back to downloading.
        </p>
        
        <Button asChild size="lg" className="h-14 px-8 text-base font-semibold gradient-bg text-white border-0 shadow-lg hover:shadow-xl transition-all no-default-hover-elevate">
          <Link href="/">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
          </Link>
        </Button>
      </div>
    </Layout>
  );
}
