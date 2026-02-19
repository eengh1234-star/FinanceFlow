
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, PayrollEntry } from '../types';

export const exportToExcel = (transactions: Transaction[]) => {
  let runningBalance = 0;
  const data = transactions.map((t, index) => {
    const income = t.type === 'INCOME' ? t.amount : 0;
    const expense = t.type === 'EXPENSE' ? t.amount : 0;
    runningBalance += (income - expense);
    
    return {
      'No': index + 1,
      'Kode': t.code,
      'Tanggal': t.date,
      'Uraian': t.description,
      'Pemasukan': income,
      'Pengeluaran': expense,
      'Saldo': runningBalance,
      'Keterangan': t.remarks
    };
  });

  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");
  writeFile(workbook, `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPDF = (transactions: Transaction[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text("LAPORAN ALIRAN KEUANGAN", 14, 15);
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);

  let runningBalance = 0;
  const body: any[][] = transactions.map((t, index) => {
    const income = t.type === 'INCOME' ? t.amount : 0;
    const expense = t.type === 'EXPENSE' ? t.amount : 0;
    runningBalance += (income - expense);

    return [
      index + 1,
      t.code,
      t.description,
      income.toLocaleString('id-ID'),
      expense.toLocaleString('id-ID'),
      runningBalance.toLocaleString('id-ID'),
      t.remarks
    ];
  });

  autoTable(doc, {
    startY: 28,
    head: [['No', 'Kode', 'Uraian', 'Pemasukan', 'Pengeluaran', 'Saldo', 'Keterangan']],
    body: body,
    theme: 'grid',
    headStyles: { fillColor: [223, 223, 223], textColor: [0, 0, 0], fontStyle: 'bold' },
  });

  doc.save(`Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportProfitLossToPDF = (
  incomeData: { category: string, amount: number }[],
  expenseData: { category: string, amount: number }[],
  period: string,
  foundationName: string
) => {
  const doc = new jsPDF();
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpense;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("LAPORAN LABA RUGI", 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(foundationName.toUpperCase(), 105, 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${period}`, 105, 29, { align: 'center' });

  let currentY = 40;

  // INCOME SECTION
  doc.setFont('helvetica', 'bold');
  doc.text("I. PENDAPATAN", 14, currentY);
  currentY += 5;

  const incomeBody: any[][] = incomeData.map(i => [i.category, i.amount.toLocaleString('id-ID')]);
  incomeBody.push([{ content: 'Total Pendapatan', styles: { fontStyle: 'bold' } } as any, { content: totalIncome.toLocaleString('id-ID'), styles: { fontStyle: 'bold' } } as any]);

  autoTable(doc, {
    startY: currentY,
    head: [['Kategori Pemasukan', 'Jumlah (Rp)']],
    body: incomeBody,
    theme: 'plain',
    headStyles: { fontStyle: 'bold', textColor: [0, 0, 0] },
    columnStyles: { 1: { halign: 'right' } }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // EXPENSE SECTION
  doc.setFont('helvetica', 'bold');
  doc.text("II. BEBAN / PENGELUARAN", 14, currentY);
  currentY += 5;

  const expenseBody: any[][] = expenseData.map(i => [i.category, i.amount.toLocaleString('id-ID')]);
  expenseBody.push([{ content: 'Total Beban', styles: { fontStyle: 'bold' } } as any, { content: totalExpense.toLocaleString('id-ID'), styles: { fontStyle: 'bold' } } as any]);

  autoTable(doc, {
    startY: currentY,
    head: [['Kategori Pengeluaran', 'Jumlah (Rp)']],
    body: expenseBody,
    theme: 'plain',
    headStyles: { fontStyle: 'bold', textColor: [0, 0, 0] },
    columnStyles: { 1: { halign: 'right' } }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // SUMMARY SECTION
  doc.line(14, currentY, 196, currentY);
  currentY += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(netProfit >= 0 ? "LABA BERSIH" : "RUGI BERSIH", 14, currentY);
  doc.text(`Rp ${netProfit.toLocaleString('id-ID')}`, 196, currentY, { align: 'right' });

  doc.save(`Laporan_Laba_Rugi_${period.replace(/ /g, '_')}.pdf`);
};

export const exportPayrollToPDF = (entries: PayrollEntry[], period: string, foundationName: string, foundationAddress: string) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`DAFTAR GAJI KARYAWAN`, 14, 15);
  doc.setFontSize(12);
  doc.text(foundationName.toUpperCase(), 14, 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(foundationAddress, 14, 28);
  doc.text(`Periode Gaji: ${period}`, 14, 34);

  const head = [['No', 'Nama / NIP', 'Jabatan', 'Gaji Pokok', 'Tunjangan', 'Total Bruto', 'Potongan', 'Gaji Bersih (THP)']];
  
  const body: any[][] = entries.map((e, index) => {
    const bruto = (Object.values(e.income) as number[]).reduce((a, b) => a + b, 0);
    const tunjangan = bruto - e.income.basic;
    const potongan = (Object.values(e.deduction) as number[]).reduce((a, b) => a + b, 0);
    const net = bruto - potongan;

    return [
      index + 1,
      `${e.employee.name}\n${e.employee.nik}`,
      e.employee.position,
      e.income.basic.toLocaleString('id-ID'),
      tunjangan.toLocaleString('id-ID'),
      bruto.toLocaleString('id-ID'),
      potongan.toLocaleString('id-ID'),
      net.toLocaleString('id-ID')
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right', fontStyle: 'bold' },
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.text('Dibuat oleh,', 25, finalY);
  doc.text('Bendahara / Bagian Keuangan', 25, finalY + 25);
  doc.line(25, finalY + 23, 75, finalY + 23);

  doc.text('Disetujui oleh,', pageWidth - 75, finalY);
  doc.text('Ketua Yayasan / Direktur', pageWidth - 75, finalY + 25);
  doc.line(pageWidth - 75, finalY + 23, pageWidth - 25, finalY + 23);

  doc.save(`Daftar_Gaji_${period.replace(/ /g, '_')}.pdf`);
};

export const exportPayrollToExcel = (entries: PayrollEntry[], period: string) => {
  const data = entries.map((e, index) => {
    const totalBruto = (Object.values(e.income) as number[]).reduce((a, b) => a + b, 0);
    const totalPotongan = (Object.values(e.deduction) as number[]).reduce((a, b) => a + b, 0);
    
    return {
      'No': index + 1,
      'Nama': e.employee.name,
      'NIK / NIP': e.employee.nik,
      'Jabatan': e.employee.position,
      'Unit': e.employee.unit,
      'Status': e.employee.status,
      'Gaji Pokok': e.income.basic,
      'Total Bruto': totalBruto,
      'Total Potongan': totalPotongan,
      'Gaji Bersih (THP)': totalBruto - totalPotongan
    };
  });

  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Daftar Gaji");
  writeFile(workbook, `Daftar_Gaji_${period.replace(/ /g, '_')}.xlsx`);
};

export const exportSinglePaySlip = (entry: PayrollEntry, foundationName: string, foundationAddress: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(foundationName.toUpperCase(), 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(foundationAddress, 105, 20, { align: 'center' });
  doc.line(14, 25, 196, 25);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("SLIP GAJI KARYAWAN", 105, 35, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Periode: ${entry.period}`, 105, 42, { align: 'center' });

  // Employee Info
  doc.setFont('helvetica', 'bold');
  doc.text("DATA KARYAWAN", 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama: ${entry.employee.name}`, 14, 62);
  doc.text(`NIK/NIP: ${entry.employee.nik}`, 14, 67);
  doc.text(`Jabatan: ${entry.employee.position}`, 14, 72);
  doc.text(`Status: ${entry.employee.status}`, 14, 77);

  let currentY = 90;

  // Earnings
  doc.setFont('helvetica', 'bold');
  doc.text("PENGHASILAN (EARNINGS)", 14, currentY);
  currentY += 5;
  
  const incomeEntries = Object.entries(entry.income).filter(([_, val]) => val > 0);
  const incomeBody = incomeEntries.map(([key, val]) => {
    const labels: Record<string, string> = {
      basic: "Gaji Pokok", position: "Tunjangan Jabatan", transport: "Transportasi",
      meal: "Uang Makan", family: "Tunjangan Keluarga", performance: "Tunjangan Kinerja",
      specialTask: "Tugas Khusus", overtime: "Lembur", bonus: "Bonus/THR"
    };
    return [labels[key] || key, `Rp ${val.toLocaleString('id-ID')}`];
  });
  
  const totalBruto = (Object.values(entry.income) as number[]).reduce((a, b) => a + b, 0);
  incomeBody.push([{ content: 'TOTAL PENGHASILAN BRUTO', styles: { fontStyle: 'bold' } } as any, { content: `Rp ${totalBruto.toLocaleString('id-ID')}`, styles: { fontStyle: 'bold' } } as any]);

  autoTable(doc, {
    startY: currentY,
    head: [['Komponen Pemasukan', 'Jumlah']],
    body: incomeBody,
    theme: 'plain',
    headStyles: { fontStyle: 'bold', textColor: [0, 0, 0] },
    columnStyles: { 1: { halign: 'right' } }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Deductions
  doc.setFont('helvetica', 'bold');
  doc.text("POTONGAN (DEDUCTIONS)", 14, currentY);
  currentY += 5;

  const deductionEntries = Object.entries(entry.deduction).filter(([_, val]) => val > 0);
  const deductionBody = deductionEntries.map(([key, val]) => {
    const labels: Record<string, string> = {
      bpjsHealth: "BPJS Kesehatan", bpjsEmployment: "BPJS Ketenagakerjaan",
      taxPph21: "Pajak PPh 21", absence: "Potongan Absensi",
      loan: "Cicilan Pinjaman", infaq: "Infaq/Sosial", others: "Lain-lain"
    };
    return [labels[key] || key, `Rp ${val.toLocaleString('id-ID')}`];
  });

  const totalPotongan = (Object.values(entry.deduction) as number[]).reduce((a, b) => a + b, 0);
  deductionBody.push([{ content: 'TOTAL POTONGAN', styles: { fontStyle: 'bold' } } as any, { content: `Rp ${totalPotongan.toLocaleString('id-ID')}`, styles: { fontStyle: 'bold' } } as any]);

  autoTable(doc, {
    startY: currentY,
    head: [['Komponen Potongan', 'Jumlah']],
    body: deductionBody,
    theme: 'plain',
    headStyles: { fontStyle: 'bold', textColor: [0, 0, 0] },
    columnStyles: { 1: { halign: 'right' } }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Grand Total
  doc.setFillColor(245, 247, 250);
  doc.rect(14, currentY, 182, 15, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("TAKE HOME PAY (NETTO)", 20, currentY + 10);
  doc.text(`Rp ${(totalBruto - totalPotongan).toLocaleString('id-ID')}`, 186, currentY + 10, { align: 'right' });

  currentY += 30;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Penerima,", 40, currentY);
  doc.text("Bendahara,", 140, currentY);
  
  currentY += 25;
  doc.text(`( ${entry.employee.name} )`, 40, currentY, { align: 'center' });
  doc.text("( ____________________ )", 140, currentY, { align: 'center' });

  doc.save(`Slip_Gaji_${entry.employee.name.replace(/ /g, '_')}_${entry.period.replace(/ /g, '_')}.pdf`);
};
