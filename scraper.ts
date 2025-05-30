import { requestUrl } from "obsidian";

function blank(text: string | null | undefined): boolean {
  return text === undefined || text === null || text === "";
}

function notBlank(text: string | null | undefined): boolean {
  return !blank(text);
}

async function scrape(url: string): Promise<string | null | undefined> {
  try {
    const response = await requestUrl(url);
    if (!response.headers["content-type"].includes("text/html")) return getUrlFinalSegment(url);
    const html = response.text;

    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = doc.querySelector("title");

    if (blank(title?.innerText)) {
      // If site is javascript based and has a no-title attribute when unloaded, use it.
      let noTitle = title?.getAttr("no-title");
      if (notBlank(noTitle)) {
        return noTitle;
      }

      // Otherwise if the site has no title/requires javascript simply return Title Unknown
      return url;
    }
    if (!title) {
      console.error(`title is null for ${url}`);
      return "Site Unreachable";
    }
    return title.innerText;
  } catch (ex) {
    console.error(ex);
    return "Site Unreachable";
  }
}

function getUrlFinalSegment(url: string): string | undefined {
  try {
    const segments = new URL(url).pathname.split("/");
    const last = segments.pop() || segments.pop(); // Handle potential trailing slash
    return last;
  } catch (_) {
    return "File";
  }
}

export default async function getPageTitle(url: string) {
  if (!(url.startsWith("http") || url.startsWith("https"))) {
    url = "https://" + url;
  }

  return scrape(url);
}
