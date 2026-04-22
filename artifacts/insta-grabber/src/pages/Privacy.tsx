import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
        
        <Button asChild variant="ghost" className="mb-8 -ml-4 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy & Terms</h1>
          
          <div className="bg-muted/30 p-6 rounded-2xl border mb-10">
            <p className="text-sm text-muted-foreground m-0 font-medium uppercase tracking-wider">TL;DR</p>
            <p className="text-lg font-medium m-0 mt-2">
              We do not store your data. Downloaded content belongs to its creators. We only fetch public media. Use responsibly.
            </p>
          </div>

          <h3>1. Data Collection & Privacy</h3>
          <p>
            InstaGrabber is designed to be a pass-through utility. We do not require you to create an account, nor do we log or store your search history, IP address, or the specific media you download on our servers. Any history features (if available) are stored locally in your browser.
          </p>

          <h3>2. Content Ownership</h3>
          <p>
            All media downloaded through InstaGrabber remains the intellectual property of the original creator on Instagram. InstaGrabber does not claim any ownership over the content you access or download.
          </p>

          <h3>3. Acceptable Use</h3>
          <p>
            By using this service, you agree to:
          </p>
          <ul>
            <li>Only download content for personal, fair-use, or archival purposes.</li>
            <li>Not republish, distribute, or monetize downloaded content without explicit permission from the original creator.</li>
            <li>Respect the privacy and copyright of content creators.</li>
          </ul>

          <h3>4. Public Content Only</h3>
          <p>
            InstaGrabber can only access media that is publicly available on Instagram. We cannot and will not attempt to bypass privacy settings or access private accounts. If an account is set to private, our tool will not be able to fetch its content.
          </p>

          <h3>5. Affiliation</h3>
          <p>
            InstaGrabber is an independent utility and is <strong>not affiliated with, authorized, maintained, sponsored, or endorsed by Instagram or Meta Platforms, Inc.</strong>
          </p>
        </div>
      </div>
    </Layout>
  );
}
