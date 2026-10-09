"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PostOpportunity {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  category: string;
  author: string;
  reputation: number;
  initial_investment: number;
  revenue: number;
  net_profit: number;
  time_invested_hours: number;
  roi: number;
  hourly_rate: number;
  validation_status: "verified_team" | "verified_community" | "pending" | "rejected";
  tools: string[];
  likes_count: number;
  community_votes_legit: number;
  created_at: string;
}

export default function SubstackFeed() {
  const [posts, setPosts] = useState<PostOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "verified" | "trending">("feed");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Digital / Serviços");
  const [investment, setInvestment] = useState("");
  const [revenue, setRevenue] = useState("");
  const [hours, setHours] = useState("");
  const [tools, setTools] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data as PostOpportunity[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (id: string, currentLikes: number) => {
    // Atualização otimista
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p))
    );
    await supabase
      .from("case_studies")
      .update({ likes_count: (currentLikes || 0) + 1 })
      .eq("id", id);
  };

  const handleVoteLegit = async (id: string, currentVotes: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, community_votes_legit: (p.community_votes_legit || 0) + 1 } : p
      )
    );
    await supabase
      .from("case_studies")
      .update({ community_votes_legit: (currentVotes || 0) + 1 })
      .eq("id", id);
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const inv = parseFloat(investment) || 0;
    const rev = parseFloat(revenue) || 0;
    const net = rev - inv;
    const h = parseFloat(hours) || 1;
    const toolsArr = tools ? tools.split(",").map((t) => t.trim()) : [];

    const { error } = await supabase.from("case_studies").insert([
      {
        title,
        subtitle: subtitle || title,
        content: content || subtitle || title,
        description: content || subtitle || title,
        category,
        author: "Membro da Rede",
        initial_investment: inv,
        revenue: rev,
        net_profit: net,
        time_invested_hours: h,
        tools: toolsArr,
        validation_status: "pending",
        likes_count: 0,
        community_votes_legit: 0,
      },
    ]);

    if (error) {
      alert("Erro ao publicar: " + error.message);
      setSubmitting(false);
      return;
    }

    setIsModalOpen(false);
    setTitle("");
    setSubtitle("");
    setContent("");
    setInvestment("");
    setRevenue("");
    setHours("");
    setTools("");
    setSubmitting(false);
    await fetchPosts();
  };
    setSubmitting(false);
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "verified") {
      return post.validation_status === "verified_team" || post.validation_status === "verified_community";
    }
    if (activeTab === "trending") {
      return (post.likes_count || 0) > 10;
    }
    return true;
  });

  const renderBadge = (status: string) => {
    switch (status) {
      case "verified_team":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium">
            ✓ Validado pela Equipe
          </span>
        );
      case "verified_community":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium">
            ★ Validado pela Comunidade
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-full font-medium">
            ⏳ Em Auditoria Comunitária
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-sans">
      {/* Header Estilo Substack / Medium */}
      <header className="border-b border-slate-800 bg-[#161b22]/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-extrabold text-sm px-2.5 py-1 rounded">PH</span>
            <span className="font-bold text-lg tracking-tight text-white">ProofHustle</span>
            <span className="text-xs text-slate-400 border-l border-slate-700 pl-3 hidden sm:inline">
              Oportunidades Reais & Métricas Auditadas
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-1.5 rounded-full text-sm transition"
          >
            Escrever Oportunidade
          </button>
        </div>
      </header>

      {/* Hero & Abas */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-50 tracking-tight">
            Descubra o que realmente está gerando renda.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Publicações detalhadas, números abertos e validação mútua sem promessas vazias.
          </p>

          <div className="flex gap-4 border-b border-slate-800 mt-6 text-sm">
            <button
              onClick={() => setActiveTab("feed")}
              className={`pb-3 font-medium transition ${
                activeTab === "feed"
                  ? "border-b-2 border-emerald-400 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Feed Principal
            </button>
            <button
              onClick={() => setActiveTab("verified")}
              className={`pb-3 font-medium transition ${
                activeTab === "verified"
                  ? "border-b-2 border-emerald-400 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Oportunidades Validadas
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`pb-3 font-medium transition ${
                activeTab === "trending"
                  ? "border-b-2 border-emerald-400 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Em Alta 🔥
            </button>
          </div>
        </div>

        {/* Feed de Posts */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">Carregando publicações...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">Nenhuma publicação encontrada.</div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredPosts.map((post) => (
              <article key={post.id} className="py-8 space-y-4">
                {/* Meta Autor e Selo */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="font-semibold text-slate-200">{post.author}</span>
                    <span>•</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                      {post.category}
                    </span>
                  </div>
                  {renderBadge(post.validation_status)}
                </div>

                {/* Título e Subtítulo Editorial */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-100 hover:text-emerald-400 transition cursor-pointer font-serif">
                    {post.title}
                  </h2>
                  {post.subtitle && (
                    <p className="text-slate-300 text-sm sm:text-base mt-1.5 leading-relaxed font-sans">
                      {post.subtitle}
                    </p>
                  )}
                </div>

                {/* Bloco de Métricas do Negócio (Estilo Destaque) */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-[#161b22] border border-slate-800 rounded-xl p-3.5 text-center text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Investimento</span>
                    <span className="text-slate-200 font-semibold mt-0.5 block">
                      R$ {Number(post.initial_investment).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Faturamento</span>
                    <span className="text-slate-200 font-semibold mt-0.5 block">
                      R$ {Number(post.revenue).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Lucro Real</span>
                    <span className="text-emerald-400 font-bold mt-0.5 block">
                      R$ {Number(post.net_profit).toFixed(2)}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Horas / Retorno</span>
                    <span className="text-slate-300 font-semibold mt-0.5 block">
                      {post.time_invested_hours}h / {post.roi}% ROI
                    </span>
                  </div>
                </div>

                {/* Conteúdo Excertado */}
                {post.content && (
                  <p className="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                )}

                {/* Tags de Ferramentas */}
                {post.tools && post.tools.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {post.tools.map((t) => (
                      <span key={t} className="text-[11px] bg-slate-800/60 text-slate-400 px-2 py-0.5 rounded border border-slate-700/50">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Barra Social de Ações */}
                <div className="flex items-center justify-between pt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => handleLike(post.id, post.likes_count)}
                      className="flex items-center gap-1.5 hover:text-emerald-400 transition"
                    >
                      ❤️ <span>{post.likes_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                      💬 <span>Comentários</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVoteLegit(post.id, post.community_votes_legit)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-[11px] border border-slate-700 flex items-center gap-1 transition"
                    >
                      👍 Funciona ({post.community_votes_legit || 0})
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Modal: Escrever Publicação / Oportunidade */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161b22] border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-bold text-white font-serif">Publicar Oportunidade Real</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preencha com dados reais para passar pela auditoria da comunidade.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 mb-1">Título da Publicação</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Como faturei R$ 2.400 prestando serviços de prospecção com automação"
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Subtítulo / Resumo da Estratégia</label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Resuma brevemente o modelo e como executou"
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                  >
                    <option>Digital / Serviços</option>
                    <option>Comércio & E-commerce</option>
                    <option>Automação & SaaS</option>
                    <option>Afiliados & Tráfego</option>
                    <option>Trabalho Local</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Ferramentas Usadas</label>
                  <input
                    value={tools}
                    onChange={(e) => setTools(e.target.value)}
                    placeholder="Ex: WhatsApp, Canva, Stripe"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Investido (R$)</label>
                  <input
                    type="number"
                    step="any"
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Receita (R$)</label>
                  <input
                    type="number"
                    step="any"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Horas Gastas</label>
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="10"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Passo a Passo / Texto da Publicação</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Conte como fez: como conseguiu o primeiro cliente, quanto tempo levou, quais foram os erros e como outras pessoas podem reproduzir..."
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? "Publicando..." : "Publicar Oportunidade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}