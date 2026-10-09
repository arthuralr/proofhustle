"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  display_name: string;
  username: string;
  role: "member" | "admin";
}

interface PostOpportunity {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  category: string;
  author: string;
  profile_id?: string;
  post_type: "structured_case" | "free_story";
  video_url?: string;
  initial_investment?: number;
  revenue?: number;
  net_profit?: number;
  time_invested_hours?: number;
  roi?: number;
  hourly_rate?: number;
  validation_status: "verified_team" | "verified_community" | "pending" | "rejected";
  tools: string[];
  likes_count: number;
  community_votes_legit: number;
  is_pinned?: boolean;
  created_at: string;
}

interface NotificationItem {
  id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function SubstackFeed() {
  const [posts, setPosts] = useState<PostOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "verified" | "trending">("feed");
  
  // Autenticação & Perfil
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Notificações
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Modal de Publicação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postType, setPostType] = useState<"free_story" | "structured_case">("free_story");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("Digital / Serviços");
  const [investment, setInvestment] = useState("");
  const [revenue, setRevenue] = useState("");
  const [hours, setHours] = useState("");
  const [tools, setTools] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSessionAndProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (prof) setProfile(prof as Profile);
      fetchNotifications(session.user.id);
    } else {
      setCurrentUser(null);
      setProfile(null);
    }
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setNotifications(data as NotificationItem[]);
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data as PostOpportunity[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessionAndProfile();
    fetchPosts();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchSessionAndProfile();
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: { full_name: authName || authEmail.split("@")[0] }
        }
      });
      if (error) {
        alert("Erro no cadastro: " + error.message);
      } else {
        alert("Cadastro realizado! Você já pode navegar autenticado.");
        setIsAuthModalOpen(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });
      if (error) {
        alert("Erro no login: " + error.message);
      } else {
        setIsAuthModalOpen(false);
      }
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfile(null);
  };

  const handleTogglePin = async (post: PostOpportunity) => {
    if (profile?.role !== "admin") return;
    const newPinned = !post.is_pinned;

    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, is_pinned: newPinned } : p))
    );

    await supabase
      .from("case_studies")
      .update({
        is_pinned: newPinned,
        pinned_at: newPinned ? new Date().toISOString() : null
      })
      .eq("id", post.id);

    fetchPosts();
  };

  const handleLike = async (post: PostOpportunity) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p))
    );
    await supabase
      .from("case_studies")
      .update({ likes_count: (post.likes_count || 0) + 1 })
      .eq("id", post.id);

    if (post.profile_id && post.profile_id !== currentUser?.id) {
      await supabase.from("notifications").insert([
        {
          recipient_id: post.profile_id,
          actor_id: currentUser?.id || null,
          post_id: post.id,
          type: "like",
          content: `${profile?.display_name || "Alguém"} curtiu a sua publicação.`
        }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const isStructured = postType === "structured_case";
    const inv = isStructured ? (parseFloat(investment) || 0) : null;
    const rev = isStructured ? (parseFloat(revenue) || 0) : null;
    const net = isStructured && rev !== null && inv !== null ? rev - inv : null;
    const h = isStructured ? (parseFloat(hours) || 1) : null;
    const toolsArr = tools ? tools.split(",").map((t) => t.trim()).filter(Boolean) : [];

    const { error } = await supabase.from("case_studies").insert([
      {
        title,
        subtitle: subtitle || null,
        content: content || null,
        description: content || subtitle || title,
        category,
        author: profile?.display_name || "Membro da Rede",
        profile_id: currentUser?.id || null,
        post_type: postType,
        video_url: videoUrl ? videoUrl.trim() : null,
        initial_investment: inv,
        revenue: rev,
        net_profit: net,
        time_invested_hours: h,
        tools: toolsArr,
        validation_status: isStructured ? "pending" : "verified_community",
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
    setVideoUrl("");
    setInvestment("");
    setRevenue("");
    setHours("");
    setTools("");
    setSubmitting(false);
    await fetchPosts();
  };

  const formatVideoEmbed = (url?: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
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

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-[#161b22]/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black font-extrabold text-sm px-2.5 py-1 rounded">PH</span>
            <span className="font-bold text-lg tracking-tight text-white">ProofHustle</span>
            <span className="text-xs text-slate-400 border-l border-slate-700 pl-3 hidden sm:inline">
              Oportunidades Reais & Métricas Auditadas
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-300 hover:text-white relative"
                    title="Notificações"
                  >
                    🔔
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-[#161b22] border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-xs">
                      <div className="font-bold border-b border-slate-800 pb-2 mb-2 text-slate-200">
                        Notificações
                      </div>
                      {notifications.length === 0 ? (
                        <div className="text-slate-500 py-3 text-center">Nenhuma notificação nova</div>
                      ) : (
                        <div className="space-y-2">
                          {notifications.map((n) => (
                            <div key={n.id} className="p-2 rounded bg-slate-800/40 text-slate-300">
                              {n.content}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                    {profile?.display_name} {profile?.role === "admin" && "👑 (Admin)"}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-slate-400 hover:text-red-400 border border-slate-700 px-2 py-1 rounded"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-full"
              >
                Entrar / Cadastrar
              </button>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-1.5 rounded-full text-sm transition"
            >
              Publicar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-50 tracking-tight">
            Descubra o que realmente está a gerar rendimento.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Publicações detalhadas, relatos livres, vídeos e validação coletiva de resultados.
          </p>

          <div className="flex gap-4 border-b border-slate-800 mt-6 text-sm">
            <button
              onClick={() => setActiveTab("feed")}
              className={`pb-3 font-medium transition ${
                activeTab === "feed" ? "border-b-2 border-emerald-400 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Feed Principal
            </button>
            <button
              onClick={() => setActiveTab("verified")}
              className={`pb-3 font-medium transition ${
                activeTab === "verified" ? "border-b-2 border-emerald-400 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Oportunidades Validadas
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`pb-3 font-medium transition ${
                activeTab === "trending" ? "border-b-2 border-emerald-400 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Em Alta 🔥
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">A carregar publicações...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">Nenhuma publicação encontrada.</div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredPosts.map((post) => {
              const embed = formatVideoEmbed(post.video_url);

              return (
                <article key={post.id} className="py-8 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-semibold text-slate-200">{post.author}</span>
                      <span>•</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                        {post.category}
                      </span>
                      {post.is_pinned && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                          📌 Fixado no Topo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {profile?.role === "admin" && (
                        <button
                          onClick={() => handleTogglePin(post)}
                          className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                        >
                          {post.is_pinned ? "Desafixar" : "📌 Fixar"}
                        </button>
                      )}

                      {post.validation_status === "verified_team" ? (
                        <span className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium">
                          ✓ Validado pela Equipa
                        </span>
                      ) : post.validation_status === "verified_community" ? (
                        <span className="bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium">
                          ★ Validado pela Comunidade
                        </span>
                      ) : (
                        <span className="bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-full font-medium">
                          ⏳ Em Auditoria Comunitária
                        </span>
                      )}
                    </div>
                  </div>

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

                  {embed && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black mt-3">
                      <iframe
                        src={embed}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {post.post_type === "structured_case" && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-[#161b22] border border-slate-800 rounded-xl p-3.5 text-center text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Investimento</span>
                        <span className="text-slate-200 font-semibold mt-0.5 block">
                          R$ {Number(post.initial_investment || 0).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Faturação</span>
                        <span className="text-slate-200 font-semibold mt-0.5 block">
                          R$ {Number(post.revenue || 0).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Lucro Real</span>
                        <span className="text-emerald-400 font-bold mt-0.5 block">
                          R$ {Number(post.net_profit || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Horas Gastas</span>
                        <span className="text-slate-300 font-semibold mt-0.5 block">
                          {post.time_invested_hours || 0}h
                        </span>
                      </div>
                    </div>
                  )}

                  {post.content && (
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  )}

                  {post.tools && post.tools.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {post.tools.map((t) => (
                        <span key={t} className="text-[11px] bg-slate-800/60 text-slate-400 px-2 py-0.5 rounded border border-slate-700/50">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 text-xs text-slate-400">
                    <button
                      onClick={() => handleLike(post)}
                      className="flex items-center gap-1.5 hover:text-emerald-400 transition"
                    >
                      ❤️ <span>{post.likes_count || 0}</span>
                    </button>
                    <span className="text-[11px] text-slate-500">
                      {new Date(post.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL DE AUTENTICAÇÃO */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white font-serif">
                {authMode === "login" ? "Iniciar Sessão" : "Criar Nova Conta"}
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAuth} className="space-y-3 text-sm">
              {authMode === "signup" && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Seu Nome / Apelido</label>
                  <input
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Ex: André Rosa"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 text-xs mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Palavra-passe</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2 rounded-lg transition mt-2"
              >
                {authLoading ? "Aguarde..." : authMode === "login" ? "Entrar" : "Criar Conta"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  className="text-xs text-slate-400 hover:text-emerald-400"
                >
                  {authMode === "login"
                    ? "Não tem conta? Cadastre-se aqui"
                    : "Já tem conta? Entrar agora"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PUBLICAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161b22] border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-white font-serif">Nova Publicação</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Partilhe a sua estratégia, história ou números com a rede.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* SELETOR: POST LIVRE VS MÉTRICAS */}
            <div className="flex border border-slate-700 rounded-lg p-1 bg-[#0d1117] mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPostType("free_story")}
                className={`flex-1 py-1.5 rounded-md transition ${
                  postType === "free_story" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                📝 Publicação Livre / Vídeo
              </button>
              <button
                type="button"
                onClick={() => setPostType("structured_case")}
                className={`flex-1 py-1.5 rounded-md transition ${
                  postType === "structured_case" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                📊 Caso com Métricas & ROI
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 mb-1">Título</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Como fechei clientes locais usando apenas WhatsApp e automação"
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Subtítulo / Resumo</label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Resumo da ideia em uma ou duas frases"
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
                  <label className="block text-slate-300 mb-1">Link de Vídeo (Opcional)</label>
                  <input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {postType === "structured_case" && (
                <>
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
                    <label className="block text-slate-300 mb-1">Ferramentas Usadas</label>
                    <input
                      value={tools}
                      onChange={(e) => setTools(e.target.value)}
                      placeholder="Ex: Supabase, Next.js, Stripe"
                      className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-300 mb-1">Conteúdo da Publicação</label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva livremente sobre o que fez, aprendizados ou passo a passo..."
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
                  {submitting ? "A publicar..." : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}