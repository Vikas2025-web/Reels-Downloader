import { toast } from "sonner";

export const downloadMedia = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.warn("Failed to download via fetch (likely CORS), falling back to new tab", error);
    // Fallback: open in new tab
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const sanitizeUsername = (input: string) => {
  let clean = input.trim();
  if (clean.includes("instagram.com/")) {
    try {
      const urlObj = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
      clean = urlObj.pathname.split("/").filter(Boolean)[0] || clean;
    } catch {
      clean = clean.split("instagram.com/")[1]?.split("/")[0] || clean;
    }
  }
  clean = clean.replace(/^@/, "");
  return clean.split("?")[0];
};

export const sanitizeUrl = (input: string) => {
  return input.trim();
};
