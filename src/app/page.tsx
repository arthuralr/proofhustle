"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { caseStudySchema, type CaseStudyInput } from "@/lib/validations/case-study";

interface HustleCardData {
  id: string;
  title: string;
  category: string;
  author: string;
  reputation: number;
  initialInvestment: number;
  revenue: number;
  netProfit: number;
  timeInvestedHours: number;
  roi: number;
  hourlyRate: number;
  verified: boolean;
  tools: string[];
}

const INITIAL_CASES: HustleCardData[] = [
  {
    id: "1",
    title: "Micro-SaaS com Template Notion + Make.com",
    category: "DIGITAL PRODUCTS_SAAS",
    author: "Diogo Silva",
    reputation: 98,
    initialInvestment: 45,
    revenue: 1850,
    netProfit: 1785,
    timeInvestedHours: 35,
    roi: 3967,
    hourlyRate: 51,
    verified: true,
    tools: ["Notion", "Stripe", "Make.com"],
  },
  {
    id: "2",
    title: "Venda de Plantas Raras via Instagram Local",
    category: "PHYSICAL BUSINESS",
    author: "Mariana Costa",
    reputation: 92,
    initialInvestment: 200,
    revenue: 1100,
    netProfit: 850,
    timeInvestedHours: 22,
    roi: 425,
    hourlyRate: 38.64,
    verified: true,
    tools: ["Instagram", "WhatsApp Business", "Canva"],
  },
];

export default function Home() {
  const [cases, setCases] = useState<HustleCardData[]>(INITIAL_CASES);
  const [filter, setFilter] = useState<"all" | "verified" | "high_roi">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CaseStudyInput>({
    resolver: zodResolver(caseStudySchema) as any,
    defaultValues: {
      title: "",
      category: "DIGITAL PRODUCTS_SAAS",
      initialInvestment: 0,
      revenue: 0,
      netProfit: 0,
      timeInvestedHours: 1,
      toolsUsed: "",
      description: "",
    },
  });

  const onSubmit = (data: CaseStudyInput) => {
    const netProfit = Number(data.netProfit);
    const initialInvestment = Number(data.initialInvestment);
    const revenue = Number(data.revenue);
    const hours = Number(data.timeInvestedHours) || 1;

    const roi = initialInvestment > 0 ? Math.round(((revenue - initialInvestment) / initialInvestment) * 100) : 100;
    const hourlyRate = Number((netProfit / hours).toFixed(2));

    const newCase: HustleCardData = {
      id: Date.now().toString(),
      title: data.title,
      category: data.category,
      author: "Você",
      reputation: 100,
      initialInvestment,
      revenue,
      netProfit,
      timeInvestedHours: hours,
      roi,
      hourlyRate,
      verified: false,
      tools: data.toolsUsed ? data.toolsUsed.split(",").map((t) => t.trim()) : [],
    };

    setCases((prev) => [newCase, ...prev]);
    reset();
    setIsModalOpen(false);
  };

  const filteredCases = cases.filter((item) => {
    if (filter === "verified") return item.verified;
    if (filter === "high_roi") return item.roi >= 500;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#040812] text-slate-100 p-6 md:p-12 selection:bg-emerald-500 selection:text-black">
      <header className="max-w-6xl mx-auto flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#00E599] text-black font-extrabold px-3 py-1.5 rounded-lg text-lg tracking-tight">
            PH
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ProofHustle</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00E599] hover:bg-[#00c984] text-black font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-950/20 text-sm"
        >
          + Submeter Caso Real
        </button>
      </header>

      <section className="max-w-6xl mx-auto mt-12 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Métricas Reais. Zero Esquemas.
        </h1>
        <p className="text-slate-400 mt-3 max-w-2xl text-base leading-relaxed">
          Estudos de caso de negócios paralelos auditados pela comunidade com investimento inicial, horas dedicadas e lucros comprovados.
        </p>

        <div className="flex gap-2 mt-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${
              filter === "all" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-white"
            }`}
          >
            Todos os Casos
          </button>
          <button
            onClick={() => setFilter("verified")}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${
              filter === "verified" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-white"
            }`}
          >
            Apenas Verificados
          </button>
          <button
            onClick={() => setFilter("high_roi")}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${
              filter === "high_roi" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-white"
            }`}
          >
            Alto Retorno (&gt;5x)
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCases.map((item) => (
          <div
            key={item.id}
            className="bg-[#091122]/90 border border-slate-800/90 hover:border-slate-700/80 transition-all rounded-2xl p-6 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono tracking-wider text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
                  {item.category}
                </span>
                {item.verified ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    🛡 Verificado
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 flex items-center gap-1">
                    ⏳ Em auditoria
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-100">{item.title}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Por {item.author} • Reputação {item.reputation}
              </p>

              <div className="grid grid-cols-3 gap-3 bg-[#0c162c] p-3 rounded-xl mt-5 border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 block tracking-wider uppercase">Investido</span>
                  <span className="font-semibold text-slate-200">€{item.initialInvestment.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block tracking-wider uppercase">Receita Bruta</span>
                  <span className="font-semibold text-slate-200">€{item.revenue.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block tracking-wider uppercase">Lucro Líquido</span>
                  <span className="font-semibold text-emerald-400">€{item.netProfit.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mt-4">
                <span>⏱ {item.timeInvestedHours}h gastas</span>
                <span>📈 €{item.hourlyRate}/h</span>
                <span className="text-emerald-400 font-semibold">ROI: {item.roi}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/80">
              <div className="flex gap-1.5 flex-wrap">
                {item.tools.map((tool) => (
                  <span key={tool} className="text-[11px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded">
                    {tool}
                  </span>
                ))}
              </div>
              <button className="text-xs text-slate-400 hover:text-emerald-400 transition">
                Auditar provas ↗
              </button>
            </div>
          </div>
        ))}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1325] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Submeter Estudo de Caso</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 text-xs mb-1">Título do Negócio</label>
                <input
                  {...register("title")}
                  className="w-full bg-[#050b18] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-400"
                  placeholder="Ex: SaaS de microautomação"
                />
                {errors.title && <span className="text-rose-400 text-xs">{errors.title.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs mb-1">Investimento Inicial (€)</label>
                  <input
                    type="number"
                    step="any"
                    {...register("initialInvestment")}
                    className="w-full bg-[#050b18] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs mb-1">Receita (€)</label>
                  <input
                    type="number"
                    step="any"
                    {...register("revenue")}
                    className="w-full bg-[#050b18] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs mb-1">Lucro Líquido (€)</label>
                  <input
                    type="number"
                    step="any"
                    {...register("netProfit")}
                    className="w-full bg-[#050b18] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs mb-1">Horas Gastas</label>
                  <input
                    type="number"
                    {...register("timeInvestedHours")}
                    className="w-full bg-[#050b18] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1">Ferramentas usadas (separadas por vírgula)</label>
                <input
                  {...register("toolsUsed")}
                  className="w-full bg-[#050b18] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-400"
                  placeholder="Notion, Stripe, Meta Ads"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1">Descrição e Provas</label>
                <textarea
                  rows={3}
                  {...register("description")}
                  className="w-full bg-[#050b18] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-emerald-400"
                  placeholder="Explique como foi a execução e como as métricas podem ser validadas..."
                />
                {errors.description && <span className="text-rose-400 text-xs">{errors.description.message}</span>}
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
                  disabled={isSubmitting}
                  className="bg-[#00E599] hover:bg-[#00c984] text-black font-semibold px-4 py-2 rounded-lg"
                >
                  Guardar Estudo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}