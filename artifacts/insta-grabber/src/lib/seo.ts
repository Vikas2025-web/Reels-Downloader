import { useEffect } from "react";

const SITE_URL = "https://instagrabber.online";
const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph.jpg`;

interface SeoOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSeo({ title, description, path, ogImage }: SeoOptions) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    const image = ogImage ?? DEFAULT_OG_IMAGE;

    document.title = title;
    setMeta("description", description);
    setLink("canonical", url);

    setMeta("og:type", "website", "property");
    setMeta("og:site_name", "InstaGrabber", "property");
    setMeta("og:url", url, "property");
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:image", image, "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:url", url);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
  }, [title, description, path, ogImage]);
}
