import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProviderStatus, getProviderStatusQueryKey } from "@workspace/api-client-react";

export function ProviderStatusBanner() {
  const { data: status, isLoading } = useProviderStatus({ query: { queryKey: getProviderStatusQueryKey() } });

  if (isLoading || !status) return null;
  
  if (status.configured) return null;

  return (
    <Alert variant="default" className="bg-amber-50 text-amber-900 border-amber-200 mb-6">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 font-semibold">Configuration Required</AlertTitle>
      <AlertDescription className="text-amber-700/90 text-sm">
        Downloader provider not configured yet. The app owner needs to add a scraper API key (RAPIDAPI_KEY) in environment settings to enable live downloads.
      </AlertDescription>
    </Alert>
  );
}
