'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Monitor,
  Smartphone,
  Link2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Target,
  Globe,
  Info,
  ArrowUp,
  ArrowDown,
  Settings,
  Key,
  Check,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

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

export default function Home() {
  const [query, setQuery] = useState('');
  const [trackUrl, setTrackUrl] = useState('');
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [page, setPage] = useState(1);
  const [showTrackInput, setShowTrackInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedKey, setSavedKey] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('serpapi_key');
    if (stored) {
      setApiKey(stored);
      setSavedKey(true);
    }
  }, []);

  const saveApiKey = useCallback(() => {
    if (apiKey.trim()) {
      localStorage.setItem('serpapi_key', apiKey.trim());
      setSavedKey(true);
      toast.success('API Key tersimpan!');
    }
  }, [apiKey]);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem('serpapi_key');
    setApiKey('');
    setSavedKey(false);
    toast.info('API Key dihapus');
  }, []);

  const doSearch = useCallback(
    async (searchQuery: string, searchMode: 'desktop' | 'mobile', searchPage: number) => {
      if (!searchQuery.trim()) {
        toast.error('Masukkan keyword yang ingin dicari');
        return;
      }
      const effectiveKey = apiKey.trim() || localStorage.getItem('serpapi_key') || '';
      if (!effectiveKey) {
        setShowSettings(true);
        toast.error('Masukkan API Key SerpApi terlebih dahulu');
        return;
      }
      setLoading(true);
      setData(null);
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          mode: searchMode,
          page: String(searchPage),
          apiKey: effectiveKey,
        });
        if (trackUrl.trim()) {
          params.set('trackUrl', trackUrl.trim());
        }
        const res = await fetch(`/api/search?${params.toString()}`);
        const json: SearchResponse & { error?: string } = await res.json();
        if (json.error) {
          toast.error(json.error);
          return;
        }
        setData(json);
      } catch {
        toast.error('Gagal mengambil hasil pencarian');
      } finally {
        setLoading(false);
      }
    },
    [apiKey, trackUrl]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    doSearch(query, mode, 1);
  };

  const handleModeChange = (newMode: 'desktop' | 'mobile') => {
    setMode(newMode);
    if (query.trim() && data) {
      setPage(1);
      doSearch(query, newMode, 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
    doSearch(query, mode, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearTrack = () => {
    setTrackUrl('');
    setShowTrackInput(false);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasKey = apiKey.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">ID Rank Check</h1>
              <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hidden sm:inline-flex">
                <Globe className="w-3 h-3 mr-1" />
                Google Indonesia
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop/Mobile toggle */}
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => handleModeChange('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    mode === 'desktop'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => handleModeChange('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    mode === 'mobile'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
              {/* Settings button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`relative p-2 rounded-lg transition-colors ${
                  showSettings ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <Settings className="w-5 h-5" />
                {savedKey && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <Card className="mt-3 border-emerald-200 bg-emerald-50/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-gray-800">SerpApi API Key</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Daftar gratis di{' '}
                  <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
                    serpapi.com
                  </a>{' '}
                  untuk mendapatkan API Key. Gratis 100 pencarian/bulan.
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setSavedKey(false);
                      }}
                      placeholder="Masukkan SerpApi API Key..."
                      className="h-9 pr-9 text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    size="sm"
                    onClick={saveApiKey}
                    disabled={!apiKey.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 h-9"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  {savedKey && (
                    <Button size="sm" variant="outline" onClick={clearApiKey} className="h-9">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {savedKey && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> API Key tersimpan di browser
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </header>

      {/* Search Section */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari keyword di Google Indonesia..."
                className="w-full h-12 pl-12 pr-28 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base shadow-sm hover:shadow-md transition-shadow"
              />
              <Button
                type="submit"
                disabled={loading || !hasKey}
                className="absolute right-1.5 top-1.5 h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">Cari</span>
              </Button>
            </div>
          </form>

          {/* Track URL Section */}
          <div className="mb-6">
            {showTrackInput ? (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600 shrink-0" />
                  <Input
                    type="url"
                    value={trackUrl}
                    onChange={(e) => setTrackUrl(e.target.value)}
                    placeholder="Masukkan URL (contoh: AAA.com)"
                    className="flex-1 h-9 border-amber-300 bg-white text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (query.trim()) {
                          setPage(1);
                          doSearch(query, mode, 1);
                        }
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTrack}
                    className="text-amber-600 hover:bg-amber-100 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <button
                onClick={() => setShowTrackInput(true)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
              >
                <Link2 className="w-3.5 h-3.5" />
                Lacak posisi URL tertentu di hasil pencarian
              </button>
            )}
          </div>

          {/* Tracked URL Status Banner */}
          {trackUrl && data && (
            <Card
              className={`mb-6 border-2 ${
                data.trackedFound ? 'border-emerald-300 bg-emerald-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      data.trackedFound ? 'bg-emerald-100' : 'bg-red-100'
                    }`}
                  >
                    {data.trackedFound ? (
                      <ArrowUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      {data.trackedFound
                        ? `Ditemukan di Posisi #${data.trackedPosition}`
                        : 'URL Tidak Ditemukan di Halaman Ini'}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">Melacak: {trackUrl}</p>
                    {data.trackedFound && (
                      <p className="text-xs text-emerald-700 mt-1">
                        Keyword &quot;{data.query}&quot; — Mode {data.mode === 'desktop' ? 'Desktop' : 'Mobile'} — Halaman {page}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200" />
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin absolute top-0 left-0" />
              </div>
              <p className="text-gray-500 text-sm">Mengambil hasil Google Indonesia...</p>
              <p className="text-gray-400 text-xs">
                Mode: {mode === 'desktop' ? 'Desktop' : 'Mobile'} — google.co.id
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && data && data.results.length > 0 && (
            <div>
              {/* Result meta */}
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-xs text-gray-400">
                  {data.totalResults ? `Sekitar ${data.totalResults} hasil` : `Hasil`} — {data.mode === 'desktop' ? 'Desktop' : 'Mobile'} — Halaman {page}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs gap-1">
                    <Globe className="w-3 h-3" />
                    google.co.id
                  </Badge>
                  <p className="text-xs text-gray-400">{data.results.length} hasil</p>
                </div>
              </div>

              {/* Result items */}
              <div className="space-y-1">
                {data.results.map((result) => (
                  <article
                    key={result.position}
                    className={`group relative rounded-xl p-4 transition-all hover:bg-gray-50 ${
                      result.isTracked ? 'bg-emerald-50 border-2 border-emerald-300 hover:bg-emerald-100/50' : 'border-2 border-transparent'
                    }`}
                  >
                    {/* Position badge (hover) */}
                    <div className="absolute -left-0 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-r-md ${
                          result.isTracked ? 'bg-emerald-600 text-white opacity-100' : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        #{result.position}
                      </span>
                    </div>

                    {/* Tracked indicator */}
                    {result.isTracked && (
                      <Badge className="absolute top-2 right-2 bg-emerald-600 text-white text-xs gap-1">
                        <Target className="w-3 h-3" />
                        Posisi #{result.position}
                      </Badge>
                    )}

                    <div className="pl-0 sm:pl-6">
                      {/* Display URL */}
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={`https://www.google.com/s2/favicons?sz=16&domain=${result.displayUrl}`}
                          alt=""
                          className="w-4 h-4 rounded-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span className="text-sm text-gray-500 truncate max-w-xs">{result.displayUrl}</span>
                      </div>

                      {/* Title & Link */}
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex items-start gap-1"
                      >
                        <h3 className="text-lg font-medium text-blue-700 hover:underline leading-tight">
                          {result.title}
                        </h3>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 mt-1.5 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>

                      {/* Description */}
                      {result.description && (
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-3">
                          {result.description}
                        </p>
                      )}

                      {/* Site Links */}
                      {result.siteLinks && result.siteLinks.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {result.siteLinks.map((sl, i) => (
                            <a
                              key={i}
                              href={sl.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-gray-500 hover:text-emerald-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors truncate"
                            >
                              <Search className="w-3 h-3 shrink-0" />
                              <span className="truncate">{sl.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="ml-1">Sebelumnya</span>
                </Button>
                <span className="px-4 py-2 text-sm font-medium text-gray-600">{page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                >
                  <span className="mr-1">Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && data && data.results.length === 0 && !data.error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Tidak ada hasil ditemukan</p>
              <p className="text-gray-400 text-sm text-center max-w-md">
                Coba gunakan keyword yang berbeda atau periksa API Key Anda.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !data && (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                <Globe className="w-12 h-12 text-emerald-400" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Cek Ranking Google Indonesia</h2>
                <p className="text-gray-500 text-sm max-w-md">
                  Masukkan keyword untuk melihat hasil pencarian Google Indonesia secara real-time.
                  Hasil yang ditampilkan sama persis seperti yang terlihat oleh pengguna di Indonesia.
                </p>
              </div>

              {!hasKey && (
                <Card className="border-amber-200 bg-amber-50 max-w-md w-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">API Key Diperlukan</p>
                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                          Klik ikon <Settings className="w-3 h-3 inline" /> di pojok kanan atas untuk memasukkan SerpApi API Key Anda.
                          Daftar gratis di <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">serpapi.com</a> (100 search/bulan gratis).
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 w-full max-w-lg">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4 text-center">
                    <Monitor className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                    <p className="text-xs font-medium text-gray-700">Mode Desktop</p>
                    <p className="text-xs text-gray-400 mt-1">Hasil seperti di komputer</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4 text-center">
                    <Smartphone className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                    <p className="text-xs font-medium text-gray-700">Mode Mobile</p>
                    <p className="text-xs text-gray-400 mt-1">Hasil seperti di HP</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                    <p className="text-xs font-medium text-gray-700">Lacak URL</p>
                    <p className="text-xs text-gray-400 mt-1">Cek posisi website kamu</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-start gap-2 max-w-md bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Tool ini menggunakan SerpApi untuk mengambil hasil Google asli dengan parameter{' '}
                  <strong>gl=id</strong> dan <strong>hl=id</strong> sehingga hasilnya sama persis dengan yang dilihat pengguna di Indonesia,
                  terlepas dari lokasi fisik kamu saat ini.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-gray-400">
          <span>ID Rank Check — Google Indonesia Proxy</span>
          <span>gl=id &middot; hl=id &middot; google.co.id</span>
        </div>
      </footer>
    </div>
  );
}
