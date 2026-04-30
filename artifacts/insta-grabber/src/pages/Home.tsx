import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReelDownloader } from "@/components/ReelDownloader";
import { StoryDownloader } from "@/components/StoryDownloader";
import { ProfileLookup } from "@/components/ProfileLookup";
import { ProviderStatusBanner } from "@/components/ProviderStatusBanner";
import { Video, Disc, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSeo } from "@/lib/seo";

export default function Home() {
  useSeo({
    title: "InstaGrabber — Free Instagram Reels, Stories & Posts Downloader",
    description:
      "Download Instagram Reels, Stories and Posts in HD for free. No login, no watermark, no app install. Paste a link or username and grab any public media in seconds.",
    path: "/",
  });
  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20 flex-1">
        
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Grab <span className="gradient-text">Anything</span> from Instagram
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Fast, free, and no-nonsense. Paste a link to download reels, or enter a username to archive active stories in high quality.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <ProviderStatusBanner />
          
          <Tabs defaultValue="reels" className="w-full shadow-2xl rounded-2xl bg-card border">
            <div className="p-2 border-b bg-muted/20 rounded-t-2xl">
              <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-muted/50">
                <TabsTrigger value="reels" className="text-base font-semibold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg transition-all">
                  <Video className="w-5 h-5 mr-2" />
                  Reels & Posts
                </TabsTrigger>
                <TabsTrigger value="stories" className="text-base font-semibold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg transition-all">
                  <Disc className="w-5 h-5 mr-2" />
                  Stories
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="p-6 md:p-8">
              <TabsContent value="reels" className="mt-0 outline-none">
                <ReelDownloader />
              </TabsContent>
              <TabsContent value="stories" className="mt-0 outline-none">
                <StoryDownloader />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-card border rounded-2xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-md">1</div>
            <h3 className="font-bold text-lg mb-2">Find Content</h3>
            <p className="text-muted-foreground text-sm">Copy the link of the Instagram reel/post or note the username for stories.</p>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-md">2</div>
            <h3 className="font-bold text-lg mb-2">Paste & Fetch</h3>
            <p className="text-muted-foreground text-sm">Paste into the input field above and hit the magic button.</p>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-md">3</div>
            <h3 className="font-bold text-lg mb-2">Save Locally</h3>
            <p className="text-muted-foreground text-sm">Preview the media and download it straight to your device in high quality.</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold mb-6 text-center">Profile Tools</h2>
          <ProfileLookup />
        </div>

      </div>
    </Layout>
  );
}
