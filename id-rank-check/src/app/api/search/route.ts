import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  position: number;
  title: string;
  url: string;
  displayUrl: string;
  description: string;
  isTracked: boolean;
  siteLinks?: { title: string; url: string }[];
}

interface SearchResponse {
  query: string;
  mode: string;
  totalResults: string;
  results: SearchResult[];
  trackedPosition: number | null;
  trackedFound: boolean;
}

/**
 * GET /api/search?q=keyword&mode=desktop|mobile&page=1&trackUrl=example.com
 *
 * Uses SerpApi to get real Google Indonesia search results.
 * Requires SERPAPI_KEY env variable.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const mode = searchParams.get('mode') || 'desktop';
  const trackUrl = searchParams.get('trackUrl') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const apiKey = searchParams.get('apiKey') || process.env.SERPAPI_KEY || '';

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Parameter "q" wajib diisi' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API Key SerpApi diperlukan. Dapatkan gratis di serpapi.com' },
      { status: 400 }
    );
  }

  try {
    const start = (page - 1) * 10;
    const params = new URLSearchParams({
      q: query,
      engine: 'google',
      hl: 'id',
      gl: 'id',
      google_domain: 'google.co.id',
      num: '10',
      start: String(start),
      api_key: apiKey,
      device: mode === 'mobile' ? 'mobile' : 'desktop',
    });

    const serpUrl = `https://serpapi.com/search?${params.toString()}`;
    const response = await fetch(serpUrl, { redirect: 'follow' });
    const json = await response.json();

    if (json.error) {
      return NextResponse.json({ error: `SerpApi error: ${json.error}` }, { status: 502 });
    }

    const organicResults = json.organic_results || [];
    const normalisedTrack = trackUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    let trackedPosition: number | null = null;

    const results: SearchResult[] = organicResults.map((item: Record<string, unknown>, index: number) => {
      const url = (item.link as string) || '';
      const normalisedUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
      const isTracked =
        normalisedTrack.length > 0 &&
        (normalisedUrl.includes(normalisedTrack) || normalisedTrack.includes(normalisedUrl));

      if (isTracked && trackedPosition === null) {
        trackedPosition = index + 1;
      }

      // Extract sitelinks if present
      const sitelinks = item.sitelinks
        ? (item.sitelinks as Array<{ title: string; link: string }>).map((sl) => ({
            title: sl.title,
            url: sl.link,
          }))
        : undefined;

      return {
        position: index + 1,
        title: (item.title as string) || '',
        url,
        displayUrl: (item.displayed_link as string) || '',
        description: (item.snippet as string) || '',
        isTracked,
        siteLinks: sitelinks,
      };
    });

    const searchResponse: SearchResponse = {
      query,
      mode,
      totalResults: json.search_information?.total_results || '',
      results,
      trackedPosition,
      trackedFound: trackedPosition !== null,
    };

    return NextResponse.json(searchResponse);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil hasil pencarian. Periksa API Key dan koneksi.' },
      { status: 500 }
    );
  }
}
