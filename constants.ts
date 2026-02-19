
import { Category } from './types';

export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'IN_OPS',
    name: 'Pemasukan Operasional',
    items: [
      'Penjualan produk', 'Penjualan jasa', 'Pendapatan layanan', 
      'Fee / komisi', 'Honor kegiatan', 'Uang pendaftaran', 
      'Iuran anggota', 'SPP / kontribusi rutin'
    ]
  },
  {
    id: 'IN_NON_OPS',
    name: 'Pemasukan Non-Operasional',
    items: [
      'Donasi / sumbangan', 'Hibah', 'Wakaf', 
      'Bantuan pemerintah', 'Bantuan CSR', 'Sponsor kegiatan'
    ]
  },
  {
    id: 'IN_FIN',
    name: 'Pemasukan Keuangan',
    items: [
      'Bunga bank', 'Bagi hasil', 'Investasi', 
      'Cashback / reward', 'Selisih kurs'
    ]
  },
  {
    id: 'IN_OTHER',
    name: 'Pemasukan Lainnya',
    items: [
      'Penjualan aset', 'Pengembalian dana', 
      'Denda masuk', 'Pendapatan tak terduga'
    ]
  }
];

export const TRANSACTION_FREQUENCIES = [
  'Daily', 'Weekly', 'Monthly', 'Yearly'
] as const;

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'EX_OPS_RUTIN',
    name: 'Biaya Operasional Rutin',
    items: [
      'Gaji karyawan', 'Honor pengajar / narasumber', 'Tunjangan',
      'Listrik', 'Air', 'Internet', 'Telepon', 'ATK', 'Konsumsi', 
      'Transportasi', 'BBM'
    ]
  },
  {
    id: 'EX_ADM',
    name: 'Biaya Administrasi',
    items: [
      'Biaya bank', 'Materai', 'Fotokopi & cetak', 
      'Pengiriman / kurir', 'Perizinan', 'Pajak', 'Legalitas dokumen'
    ]
  },
  {
    id: 'EX_PROG',
    name: 'Biaya Program / Kegiatan',
    items: [
      'Biaya event', 'Seminar / kajian', 'Pelatihan', 
      'Publikasi', 'Media & dokumentasi', 'Perlengkapan kegiatan'
    ]
  },
  {
    id: 'EX_ASSET',
    name: 'Biaya Aset & Peralatan',
    items: [
      'Pembelian peralatan', 'Pembelian inventaris', 
      'Perbaikan alat', 'Maintenance', 'Sewa alat'
    ]
  },
  {
    id: 'EX_BUILDING',
    name: 'Biaya Gedung & Fasilitas',
    items: [
      'Sewa kantor', 'Renovasi', 'Kebersihan', 'Keamanan', 'Perawatan gedung'
    ]
  },
  {
    id: 'EX_SOCIAL',
    name: 'Biaya Sosial',
    items: [
      'Santunan', 'Bantuan sosial', 'Beasiswa', 
      'Zakat / infak disalurkan', 'Program kemanusiaan'
    ]
  },
  {
    id: 'EX_OTHER',
    name: 'Biaya Lain-lain',
    items: ['Pengeluaran darurat', 'Denda', 'Selisih kas', 'Biaya tak terduga']
  }
];
