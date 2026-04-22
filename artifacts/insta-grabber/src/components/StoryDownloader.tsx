import { useState } from "react";
import { useFetchStories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AtSign, Download, PlayCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { downloadMedia, sanitizeUsername } from "@/lib/download";
import { formatDistanceToNow } from "date-fns";

export function StoryDownloader() {
  const [username, setUsername] = useState("");
  const fetchStories = useFetchStories();

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = sanitizeUsername(username);
    if (!cleanUsername) {
      toast.error("Please enter a valid username");
      return;
    }
    
    // Optimistically update the input value to the cleaned version
    setUsername(cleanUsername);
    
    fetchStories.mutate({ data: { username: cleanUsername } }, {
      onError: (error: any) => {
        const msg = error?.response?.data?.error || error.message || "Failed to fetch stories";
        toast.error(msg);
      }
    });
  };

  const { data: storiesRes, isPending } = fetchStories;

  return (
    <div className="space-y-8">
      <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            type="text"
            placeholder="Instagram username (e.g. cristiano)" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10 h-12 text-base"
            required
          />
        </div>
        <Button type="submit" disabled={isPending} className="h-12 px-8 text-base gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all no-default-hover-elevate">
          {isPending ? "Fetching..." : "View Stories"}
        </Button>
      </form>

      {isPending && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 justify-center">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-5" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="aspect-[9/16] rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {storiesRes && !isPending && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative p-1 rounded-full gradient-bg mb-4">
              <Avatar className="w-20 h-20 border-4 border-background">
                <AvatarImage src={storiesRes.userAvatar} />
                <AvatarFallback>{storiesRes.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-xl font-bold">{storiesRes.userFullName || storiesRes.username}</h3>
            <p className="text-muted-foreground">@{storiesRes.username}</p>
            <p className="text-sm font-medium mt-2 gradient-text">
              {storiesRes.stories.length} Active {storiesRes.stories.length === 1 ? 'Story' : 'Stories'}
            </p>
          </div>

          {storiesRes.stories.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/30 shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <PlayCircle className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium">No active stories</p>
                <p className="text-muted-foreground max-w-sm mt-2">
                  This user currently has no active stories, or their account is private.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {storiesRes.stories.map((story) => (
                <Card key={story.id} className="overflow-hidden group border-0 shadow-md hover:shadow-xl transition-shadow bg-black/5">
                  <CardContent className="p-0 relative">
                    <div className="aspect-[9/16] relative bg-black flex items-center justify-center overflow-hidden">
                      {story.type === "video" ? (
                        <>
                          {story.thumbnail && (
                            <img src={story.thumbnail} alt="Story thumbnail" className="w-full h-full object-cover opacity-60 blur-sm absolute inset-0" />
                          )}
                          <video 
                            src={story.url} 
                            poster={story.thumbnail}
                            className="w-full h-full object-contain relative z-10"
                            controlsList="nodownload"
                            preload="metadata"
                            muted
                            loop
                            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                          <div className="absolute top-2 right-2 z-20 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                            <PlayCircle className="w-3 h-3" />
                            {story.durationSec ? `${story.durationSec}s` : 'Video'}
                          </div>
                        </>
                      ) : (
                        <>
                          <img 
                            src={story.url} 
                            alt="Story" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 z-20 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Image
                          </div>
                        </>
                      )}
                      
                      {story.takenAt && (
                        <div className="absolute top-2 left-2 z-20 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-md">
                          {formatDistanceToNow(new Date(parseInt(story.takenAt) * 1000), { addSuffix: true })}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4 z-20">
                        <Button 
                          onClick={() => downloadMedia(story.url, `instagrabber-${storiesRes.username}-story-${story.id}.${story.type === 'video' ? 'mp4' : 'jpg'}`)}
                          className="w-full bg-white/20 hover:bg-white/40 backdrop-blur text-white border-0"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
