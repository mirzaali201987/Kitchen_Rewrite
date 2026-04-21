// source_handbook: week11-hackathon-preparation
// GET /api/image?q=chocolate+chip+cookies
// Proxies to Unsplash search API, returns the first result's URL and attribution.
// The Unsplash Access Key stays on the server; never exposed to the browser.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ImageResult = {
  url: string;              // the image URL to <img src={}>
  alt: string;              // alt text
  photographer_name: string;
  photographer_url: string; // link to photographer profile with required utm params
  download_location: string; // for the "download tracking" compliance ping
};

const UTM = "utm_source=kitchen_rewrite&utm_medium=referral";

export async function GET(req: NextRequest) {
  const started = Date.now();
  const q = req.nextUrl.searchParams.get("q") || "food";

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "Image service not configured." },
      { status: 503 }
    );
  }

  try {
    // Search for photos matching the query, landscape orientation, safe content.
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", q);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("content_filter", "high");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
    });

    if (!res.ok) {
      console.error({ event: "unsplash_error", status: res.status, q });
      return NextResponse.json(
        { error: `Unsplash returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const first = data.results?.[0];
    if (!first) {
      return NextResponse.json(
        { error: "No images found for that query." },
        { status: 404 }
      );
    }

    // Per Unsplash guidelines, trigger a download-tracking ping (fire and forget)
    // when we display the image. This increments the photographer's download count.
    const downloadLocation = first.links?.download_location;
    if (downloadLocation) {
      fetch(downloadLocation, {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }).catch(() => {}); // ignore failures, it's just an analytics ping
    }

    const result: ImageResult = {
      url: first.urls?.regular || first.urls?.small || "",
      alt: first.alt_description || q,
      photographer_name: first.user?.name || "Unsplash contributor",
      photographer_url: first.user?.links?.html
        ? `${first.user.links.html}?${UTM}`
        : `https://unsplash.com?${UTM}`,
      download_location: downloadLocation || "",
    };

    console.log(JSON.stringify({
      event: "image_search",
      ms: Date.now() - started,
      q,
      found: true,
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error({ event: "image_search_error", message: err?.message, q });
    return NextResponse.json(
      { error: "Image lookup failed." },
      { status: 500 }
    );
  }
}
