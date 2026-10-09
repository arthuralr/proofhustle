"use client";

import React, { useState } from "react";
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  PlusCircle, 
  ExternalLink,
  Layers
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { caseStudySchema, type CaseStudyInput } from "@/lib/validations/case-study";

// Tipo demonstrativo para o feed
interface HustleCardData {
  id: string;
  title: string;
  category: string;
  author: { name: string; reputation: number };
  initialInvestment: number;
  monthlyCosts: number;
  totalRevenue: number;
  netProfit: number;
  hoursInvested: number;
  status: "community_verified" | "pending_audit" | "flagged_suspicious";
  toolsUsed: string[];
}

const INITIAL_MOCK_DATA: HustleCardData[] = [
  {
    id: "1",
    title: "Micro-SaaS com Template Notion + Make.com",
    category: "digital_products_saas",
    author: { name: "Diogo Silva", reputation: 98 },
    initialInvestment: 45.0,
    monthlyCosts: 20.0,
    totalRevenue: 1850.0,
    netProfit: 1785.0,
    hoursInvested: 35,
    status: "community_verified",
    toolsUsed: ["Notion", "Stripe", "Make.com"],
  },
  {
    id: "2",
    title: "Venda de Plantas Raras via Instagram Local",
    category: "physical_business",
    author: { name: "Mariana Costa", reputation: 92 },
    initialInvestment: 200.0,
    monthlyCosts: 50.0,
    totalRevenue: 1100.0,
    netProfit: 850.0,
    hoursInvested: 22,
    status: "community_verified",
    toolsUsed: ["Instagram", "WhatsApp Business", "Canva"],
  },
];

export default function HomePage() {
  const [hustles, setHustles] = useState<HustleCardData[]>(INITIAL_MOCK_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CaseStudyInput>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: {
      initialInvestment: 0,
      monthlyCosts: 0,
      totalRevenue: 0,
      hoursInvested: 1,
    },
  });

  const onSubmit = async (data: CaseStudyInput) => {
    // Cálculo do lucro no cliente para atualização imediata do estado
    const netProfit = data.totalRevenue - (data.initialInvestment + data.monthlyCosts);
    const newCase: HustleCardData = {
      id: Math.random().toString(),
      title: data.title,
      category: data.category,
      author: { name: "Você (Operador)", reputation: 100 },
      initialInvestment: data.initialInvestment,
      monthlyCosts: data.monthlyCosts,
      totalRevenue: data.totalRevenue,
      netProfit,
      hoursInvested: data.hoursInvested,
      status: "pending_audit",
      toolsUsed: data.toolsUsed,
    };

    setHustles([newCase, ...hustles]);
    reset();
    setIsModalOpen(false);
  };

  const filteredHustles = hustles.filter((h) => {
    if (activeFilter === "verified") return h.status === "community_verified";
    if (activeFilter === "high_roi") return (h.netProfit / (h.initialInvestment || 1)) > 5;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 p-1.5 rounded-lg font-black text-xl">PH</span>
            <span className="font-bold text-xl tracking-tight">Proof<span className="text-emerald-400">Hustle</span></span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Submeter Caso Real
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Métricas Reais. Zero Esquemas.
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Estudos de caso de negócios paralelos auditados pela comunidade com investimento inicial, horas dedicadas e lucros comprovados.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
          {[
            { id: "all", label: "Todos os Casos" },
            { id: "verified", label: "Apenas Verificados" },
            { id: "high_roi", label: "Alto Retorno (>5x)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHustles.map((hustle) => {
            const hourlyRate = (hustle.netProfit / hustle.hoursInvested).toFixed(2);
            const roi = hustle.initialInvestment > 0 
              ? ((hustle.netProfit / hustle.initialInvestment) * 100).toFixed(0) 
              : "∞";

            return (
              <article
                key={hustle.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded">
                      {hustle.category.replace("_", " ")}
                    </span>
                    {hustle.status === "community_verified" ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-full font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" /> Em Auditoria
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-slate-100 hover:text-emerald-400 transition-colors">
                    {hustle.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Por <span className="text-slate-300 font-medium">{hustle.author.name}</span> • Reputação {hustle.author.reputation}
                  </p>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Investido</span>
                      <span className="text-sm font-semibold text-slate-300">€{hustle.initialInvestment.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Receita Bruta</span>
                      <span className="text-sm font-semibold text-slate-300">€{hustle.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-500 block uppercase font-bold">Lucro Líquido</span>
                      <span className="text-sm font-bold text-emerald-400">€{hustle.netProfit.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {hustle.hoursInvested}h gastas
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-500" /> €{hourlyRate}/h
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      ROI: {roi}%
                    </span>
                  </div>
                </div>

                {/* Tools & Footer */}
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {hustle.toolsUsed.map((tool) => (
                      <span key={tool} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                  <button className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer">
                    Auditar provas <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* Modal de Submissão de Caso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-8">
            <h2 className="text-xl font-bold mb-1 text-slate-100">Submeter Estudo de Caso Real</h2>
            <p className="text-xs text-slate-400 mb-6">
              Todos os dados estão sujeitos a validação comunitária com base nos comprovativos anexados.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Caso</label>
                <input
                  {...register("title")}
                  placeholder="Ex: Consultoria de Automação para Imobiliárias"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
                {errors.title && <span className="text-xs text-rose-500">{errors.title.message}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    {...register("category")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="digital_products_saas">Digital / Micro-SaaS</option>
                    <option value="freelancing_services">Serviços / Freelancing</option>
                    <option value="ecommerce_dropshipping">E-commerce / Físico</option>
                    <option value="affiliate_marketing">Afiliados</option>
                    <option value="physical_business">Negócio Local</option>
                    <option value="content_creation">Criação de Conteúdo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horas Investidas</label>
                  <input
                    type="number"
                    {...register("hoursInvested")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  {errors.hoursInvested && <span className="text-xs text-rose-500">{errors.hoursInvested.message}</span>}
                </div>
              </div>

              {/* Seção Financeira Obrigatória */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Métricas Financeiras (€)
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Invest. Inicial</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("initialInvestment")}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Custos Mensais</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("monthlyCosts")}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Receita Bruta</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("totalRevenue")}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ferramentas Usadas (vírgulas)</label>
                <input
                  {...register("toolsUsed")}
                  placeholder="Next.js, Supabase, Stripe, Airtable"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL da Evidência / Print do Extrato</label>
                <input
                  {...register("proofUrl")}
                  placeholder="https://imgur.com/... ou link de dashboard"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
                {errors.proofUrl && <span className="text-xs text-rose-500">{errors.proofUrl.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Processo</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Explique passo a passo como validou a oferta e gerou o resultado..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
                {errors.description && <span className="text-xs text-rose-500">{errors.description.message}</span>}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "A enviar..." : "Publicar para Auditoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}