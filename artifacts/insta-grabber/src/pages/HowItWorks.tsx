import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Smartphone, Laptop, CheckCircle2, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h1>
          <p className="text-xl text-muted-foreground">Master InstaGrabber in 30 seconds.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b pb-4">
              <Smartphone className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">On Mobile</h2>
            </div>
            <ol className="space-y-6 relative border-l-2 border-muted ml-4 pl-8">
              <li className="relative">
                <span className="absolute -left-11 w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">1</span>
                <h3 className="font-semibold text-lg">Open Instagram app</h3>
                <p className="text-muted-foreground mt-1">Navigate to the Reel or Post you want to save.</p>
              </li>
              <li className="relative">
                <span className="absolute -left-11 w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">2</span>
                <h3 className="font-semibold text-lg">Tap Share</h3>
                <p className="text-muted-foreground mt-1">Tap the paper airplane (share) icon, then tap "Copy link".</p>
              </li>
              <li className="relative">
                <span className="absolute -left-11 w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">3</span>
                <h3 className="font-semibold text-lg">Paste here</h3>
                <p className="text-muted-foreground mt-1">Return to InstaGrabber, paste the link, and download!</p>
              </li>
            </ol>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b pb-4">
              <Laptop className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">On Desktop</h2>
            </div>
            <ol className="space-y-6 relative border-l-2 border-muted ml-4 pl-8">
              <li className="relative">
                <span className="absolute -left-11 w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">1</span>
                <h3 className="font-semibold text-lg">Open Instagram.com</h3>
                <p className="text-muted-foreground mt-1">Find the post or reel on the website.</p>
              </li>
              <li className="relative">
                <span className="absolute -left-11 w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">2</span>
                <h3 className="font-semibold text-lg">Copy URL</h3>
                <p className="text-muted-foreground mt-1">Select the entire URL from your browser's address bar and copy it.</p>
              </li>
              <li className="relative">
                <span className="absolute -left-11 w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">3</span>
                <h3 className="font-semibold text-lg">Paste here</h3>
                <p className="text-muted-foreground mt-1">Paste it into our downloader and save your media.</p>
              </li>
            </ol>
          </div>
        </div>

        <div className="bg-muted/30 rounded-3xl p-8 md:p-12 mb-20 border">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
            <AccordionItem value="item-1" className="border-b-0 mb-2 bg-card rounded-xl overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-colors font-semibold">
                Can I download from private accounts?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground leading-relaxed text-base">
                No. InstaGrabber can only fetch content from public Instagram accounts. If an account is private, the Instagram API will not return the media, and our tool will show an error.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-0 mb-2 bg-card rounded-xl overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-colors font-semibold">
                Is this tool free?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground leading-relaxed text-base">
                Yes! InstaGrabber is completely free to use. There are no hidden fees, subscriptions, or watermarks added to your downloaded videos.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b-0 mb-2 bg-card rounded-xl overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-colors font-semibold">
                What format are the downloads in?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground leading-relaxed text-base">
                Videos and Reels are downloaded as high-quality MP4 files. Images and photo posts are downloaded as JPGs. We fetch the highest quality available directly from Instagram's servers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-b-0 mb-2 bg-card rounded-xl overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-colors font-semibold">
                Are story downloads anonymous?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground leading-relaxed text-base">
                Yes. When you use InstaGrabber to view or download a story, your account is not connected to the action, so your view will not appear in the creator's story viewer list.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="h-14 px-8 text-base font-semibold gradient-bg border-0 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <Link href="/">
              Start Downloading <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

      </div>
    </Layout>
  );
}
