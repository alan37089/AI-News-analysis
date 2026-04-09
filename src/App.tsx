import * as React from "react";
import { useState, useEffect } from "react";
import { Search, TrendingUp, ShieldAlert, BookOpen, ExternalLink, RefreshCw, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getTrendingNews, analyzeNews, type NewsAnalysis, type TrendingNews } from "./services/geminiService";
import { cn } from "@/lib/utils";

export default function App() {
  const [query, setQuery] = useState("");
  const [trending, setTrending] = useState<TrendingNews[]>([]);
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setLoadingTrending(true);
    try {
      const data = await getTrendingNews();
      setTrending(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrending(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeNews(query);
      setAnalysis(result);
    } catch (err) {
      setError("無法分析該新聞。請嘗試其他關鍵字或連結。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendingClick = (title: string) => {
    setQuery(title);
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Background Refraction Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[100px] rounded-full animate-pulse delay-1000" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <RefreshCw className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              新聞稜鏡 <span className="text-indigo-400 font-light">News Prism</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">首頁</a>
            <a href="#" className="hover:text-white transition-colors">關於偏見</a>
            <a href="#" className="hover:text-white transition-colors">媒體清單</a>
          </nav>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
        {/* Search Section */}
        <section className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              透視新聞真相，<span className="text-indigo-400">折射</span>多元觀點
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              輸入關鍵字或貼上新聞連結，我們將為您抓取多家媒體報導，並由 AI 提取核心事實與潛在偏見。
            </p>

            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex gap-2 p-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl">
                <div className="flex-1 flex items-center px-3">
                  <Search className="w-5 h-5 text-slate-500 mr-2" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="輸入新聞關鍵字或連結..."
                    className="bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-slate-600"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-lg transition-all active:scale-95"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "透視分析"}
                </Button>
              </div>
            </form>
          </motion.div>
        </section>

        <AnimatePresence mode="wait">
          {!analysis && !loading ? (
            <motion.section
              key="trending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-rose-400" />
                <h3 className="text-xl font-semibold">當下熱門新聞</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingTrending ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="bg-slate-900/40 border-white/5">
                      <CardHeader>
                        <Skeleton className="h-4 w-2/3 bg-slate-800" />
                        <Skeleton className="h-3 w-full bg-slate-800" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full bg-slate-800" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  trending.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card 
                        className="bg-slate-900/40 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all cursor-pointer group"
                        onClick={() => handleTrendingClick(item.title)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400 uppercase tracking-wider">
                              {item.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-400 line-clamp-3">
                            {item.description}
                          </p>
                        </CardContent>
                        <CardFooter className="text-[10px] text-slate-400 font-mono font-bold">
                          CLICK TO ANALYZE
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">正在折射新聞光譜...</h3>
                <p className="text-slate-400 animate-pulse">正在抓取主流媒體報導並分析偏見</p>
              </div>
            </motion.div>
          ) : (
            <motion.section
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setAnalysis(null)}
                    className="mb-4 text-slate-400 hover:text-white -ml-4"
                  >
                    ← 返回搜尋
                  </Button>
                  <h2 className="text-3xl font-bold tracking-tight text-white">{analysis?.topic}</h2>
                </div>
                {analysis && analysis.foundCount < 5 && (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-lg text-sm">
                    <Info className="w-4 h-4" />
                    <span>僅找到 {analysis.foundCount} 家主流媒體報導</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Facts & Bias */}
                <div className="lg:col-span-1 space-y-6">
                  <Card className="bg-slate-900/60 border-white/10 backdrop-blur-sm">
                    <CardHeader className="border-b border-white/5">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <BookOpen className="w-5 h-5" />
                        <CardTitle className="text-lg text-white">核心事實</CardTitle>
                      </div>
                      <CardDescription>跨媒體共識之事實提取</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="space-y-4">
                        {analysis?.coreFacts.map((fact, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                            <span className="text-indigo-500 font-bold">•</span>
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-rose-500/5 border-rose-500/20 backdrop-blur-sm">
                    <CardHeader className="border-b border-rose-500/10">
                      <div className="flex items-center gap-2 text-rose-400">
                        <ShieldAlert className="w-5 h-5" />
                        <CardTitle className="text-lg text-white">潛在偏見提醒</CardTitle>
                      </div>
                      <CardDescription className="text-rose-200/70">注意報導中的立場與框架</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="space-y-4">
                        {analysis?.biasWarnings.map((warning, i) => (
                          <li key={i} className="flex gap-3 text-sm text-rose-200/80 leading-relaxed">
                            <span className="text-rose-500 font-bold">!</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Media Sources */}
                <div className="lg:col-span-2">
                  <Tabs defaultValue="sources" className="w-full">
                    <TabsList className="bg-slate-900/80 border border-white/10 p-1 mb-6">
                      <TabsTrigger value="sources" className="data-[state=active]:bg-indigo-600">媒體報導對照</TabsTrigger>
                      <TabsTrigger value="perspectives" className="data-[state=active]:bg-indigo-600">觀點光譜</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sources" className="space-y-4">
                      {analysis?.sources.map((source, i) => (
                        <Card key={i} className="bg-slate-900/40 border-white/5 hover:border-white/10 transition-colors">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <Badge className="bg-indigo-500/20 text-indigo-300 border-none mb-2">
                                {source.outlet}
                              </Badge>
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-white transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            <CardTitle className="text-lg text-white hover:text-indigo-300 transition-colors">
                              <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                {source.title}
                                <ExternalLink className="w-3 h-3 inline-block shrink-0" />
                              </a>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              {source.summary}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="perspectives">
                      <div className="space-y-6">
                        {analysis?.sources.map((source, i) => (
                          <div key={i} className="relative pl-8 border-l-2 border-indigo-500/30 py-2">
                            <div className="absolute left-[-9px] top-4 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            <h4 className="font-bold text-indigo-300 mb-1">{source.outlet} 的獨特視角</h4>
                            <p className="text-slate-300 text-sm italic leading-relaxed">
                              "{source.perspective}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center">
            {error}
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 mt-20 bg-black/40">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-70">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-mono tracking-widest uppercase text-slate-300">News Prism v1.0</span>
          </div>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            本工具旨在提供多元視角，AI 生成內容僅供參考。請務必查閱原始報導以獲取完整資訊。
          </p>
        </div>
      </footer>
    </div>
  );
}
