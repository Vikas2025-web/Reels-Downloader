import { useState } from "react";
import { useFetchReel } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link2, Download, Heart, MessageCircle, Eye, PlayCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { downloadMedia, sanitizeUrl } from "@/lib/download";

export function ReelDownloader() {
  const [url, setUrl] = useState("");
  const fetchReel = useFetchReel();

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = sanitizeUrl(url);
    if (!cleanUrl) {
      toast.error("Please enter a valid URL");
      return;
    }
    fetchReel.mutate({ data: { url: cleanUrl } }, {
      onError: (error: any) => {
        const msg = error?.response?.data?.error || error.message || "Failed to fetch reel";
        toast.error(msg);
      }
    });
  };

  const { data: reel, isPending } = fetchReel;

  return (
    <div className="space-y-6">
      <form onSubmit={handleDownload} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            type="url"
            placeholder="Paste Instagram Reel or Post URL..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10 h-12 text-base"
            required
          />
        </div>
        <Button type="submit" disabled={isPending} className="h-12 px-8 text-base gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all no-default-hover-elevate">
          {isPending ? "Fetching..." : "Download"}
        </Button>
      </form>

      {isPending && (
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row h-[400px]">
              <div className="md:w-[400px] h-full bg-muted flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                </div>
                <Skeleton className="w-full h-24" />
                <div className="flex gap-2">
                  <Skeleton className="w-16 h-6 rounded-full" />
                  <Skeleton className="w-16 h-6 rounded-full" />
                  <Skeleton className="w-16 h-6 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reel && !isPending && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {reel.media.map((item, idx) => (
            <Card key={idx} className="overflow-hidden border-0 shadow-lg bg-card">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-[400px] flex-shrink-0 bg-black relative flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-[500px]">
                    {item.type === "video" ? (
                      <video 
                        src={item.url} 
                        poster={item.thumbnail}
                        controls 
                        className="w-full h-full max-h-[600px] object-contain"
                        controlsList="nodownload"
                      />
                    ) : (
                      <img 
                        src={item.url} 
                        alt="Instagram post" 
                        className="w-full h-full max-h-[600px] object-contain"
                      />
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                      <Avatar className="w-12 h-12 border">
                        <AvatarImage src={reel.userAvatar} />
                        <AvatarFallback>{reel.username?.substring(0, 2).toUpperCase() || 'IG'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-base leading-tight">{reel.userFullName || reel.username || "Instagram User"}</p>
                        {reel.username && <p className="text-sm text-muted-foreground">@{reel.username}</p>}
                      </div>
                    </div>
                    
                    {reel.caption && (
                      <div className="mb-6 flex-1">
                        <p className="text-sm whitespace-pre-wrap line-clamp-6 text-foreground/90">
                          {reel.caption}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                      {reel.likeCount !== undefined && reel.likeCount > 0 && (
                        <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-medium flex items-center gap-1.5 px-3 py-1">
                          <Heart className="w-3.5 h-3.5" />
                          {reel.likeCount.toLocaleString()}
                        </Badge>
                      )}
                      {reel.commentCount !== undefined && reel.commentCount > 0 && (
                        <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-medium flex items-center gap-1.5 px-3 py-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {reel.commentCount.toLocaleString()}
                        </Badge>
                      )}
                      {reel.viewCount !== undefined && reel.viewCount > 0 && (
                        <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-medium flex items-center gap-1.5 px-3 py-1">
                          <Eye className="w-3.5 h-3.5" />
                          {reel.viewCount.toLocaleString()}
                        </Badge>
                      )}
                      <Badge variant="outline" className="font-medium flex items-center gap-1.5 px-3 py-1">
                        {item.type === "video" ? <PlayCircle className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                        {item.type === "video" ? "Video" : "Image"}
                      </Badge>
                    </div>
                    
                    <Button 
                      size="lg" 
                      className="w-full h-14 text-base font-semibold gradient-bg text-white border-0 shadow-md hover:shadow-lg no-default-hover-elevate"
                      onClick={() => downloadMedia(item.url, `instagrabber-${reel.username || 'post'}-${reel.shortcode}-${idx}.${item.type === 'video' ? 'mp4' : 'jpg'}`)}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download {item.type === "video" ? "Video" : "Image"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
