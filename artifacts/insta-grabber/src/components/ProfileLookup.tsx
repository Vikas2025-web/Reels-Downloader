import { useState } from "react";
import { useFetchProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldAlert, BadgeCheck, Users, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { sanitizeUsername } from "@/lib/download";

export function ProfileLookup() {
  const [username, setUsername] = useState("");
  const fetchProfile = useFetchProfile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = sanitizeUsername(username);
    if (!cleanUsername) {
      toast.error("Please enter a valid username");
      return;
    }
    
    setUsername(cleanUsername);
    
    fetchProfile.mutate({ data: { username: cleanUsername } }, {
      onError: (error: any) => {
        const msg = error?.response?.data?.error || error.message || "Failed to fetch profile";
        toast.error(msg);
      }
    });
  };

  const { data: profile, isPending } = fetchProfile;

  return (
    <Card className="border shadow-sm bg-card/50 backdrop-blur">
      <CardHeader className="pb-4 border-b bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Profile Viewer
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input 
            placeholder="Search username..." 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isPending} variant="secondary">
            {isPending ? "Searching..." : "Search"}
          </Button>
        </form>

        {isPending && (
          <div className="flex items-start gap-4">
            <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
            <div className="space-y-3 w-full">
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-32 h-4" />
              <div className="flex gap-4">
                <Skeleton className="w-16 h-8" />
                <Skeleton className="w-16 h-8" />
                <Skeleton className="w-16 h-8" />
              </div>
              <Skeleton className="w-full h-12" />
            </div>
          </div>
        )}

        {profile && !isPending && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-primary/20 shadow-md">
                  <AvatarImage src={profile.avatarHd || profile.avatar} />
                  <AvatarFallback className="text-2xl">{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center justify-center sm:justify-start gap-2">
                    {profile.fullName || profile.username}
                    {profile.isVerified && <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/20" />}
                  </h3>
                  <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                    @{profile.username}
                    {profile.isPrivate && (
                      <Badge variant="outline" className="ml-2 text-xs py-0 h-5">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 py-2">
                  <div className="text-center">
                    <p className="font-bold text-lg">{profile.postCount?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{profile.followerCount?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{profile.followingCount?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Following</p>
                  </div>
                </div>

                {(profile.biography || profile.externalUrl) && (
                  <div className="bg-muted/30 p-4 rounded-xl text-sm border">
                    {profile.biography && (
                      <p className="whitespace-pre-wrap">{profile.biography}</p>
                    )}
                    {profile.externalUrl && (
                      <a 
                        href={profile.externalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline mt-2 font-medium"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        {new URL(profile.externalUrl).hostname.replace('www.', '')}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
