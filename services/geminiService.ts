
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  if (transactions.length === 0) return "Belum ada data transaksi untuk dianalisis.";

  const summary = transactions.reduce((acc, t) => {
    if (t.type === 'INCOME') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const prompt = `
    Bertindaklah sebagai penasihat keuangan senior.
    Berdasarkan data berikut:
    Total Pemasukan: Rp ${summary.income.toLocaleString('id-ID')}
    Total Pengeluaran: Rp ${summary.expense.toLocaleString('id-ID')}
    Saldo Saat Ini: Rp ${(summary.income - summary.expense).toLocaleString('id-ID')}
    
    Jumlah Transaksi: ${transactions.length}
    
    Tolong berikan ringkasan singkat dalam Bahasa Indonesia tentang kondisi keuangan ini dan berikan 2 saran praktis untuk meningkatkan efisiensi atau mengelola pengeluaran.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Gagal mendapatkan saran AI.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, asisten AI sedang sibuk. Silakan coba lagi nanti.";
  }
};
