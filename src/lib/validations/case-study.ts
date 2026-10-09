import { z } from "zod";

export const caseStudySchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  category: z.string().min(2, "Selecione uma categoria"),
  initialInvestment: z.coerce.number().min(0, "O investimento inicial deve ser igual ou superior a 0"),
  revenue: z.coerce.number().min(0, "A receita bruta deve ser igual ou superior a 0"),
  netProfit: z.coerce.number().min(0, "O lucro líquido deve ser igual ou superior a 0"),
  timeInvestedHours: z.coerce.number().min(1, "Indique o tempo investido em horas"),
  toolsUsed: z.string().optional(),
  description: z.string().min(20, "Forneça uma descrição detalhada com pelo menos 20 caracteres"),
});

export type CaseStudyInput = z.infer<typeof caseStudySchema>;