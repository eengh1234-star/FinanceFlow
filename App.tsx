
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  Download, 
  FileText, 
  LayoutDashboard, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  BrainCircuit,
  X,
  Trash2,
  Users,
  Briefcase,
  DollarSign,
  Building2,
  Settings,
  ArrowRight,
  PieChart as PieIcon,
  AlertCircle,
  Save,
  Calculator,
  Filter,
  MessageSquare,
  LogOut,
  ShieldCheck,
  MoreVertical,
  Send,
  ChevronDown,
  Calendar,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  Edit2,
  Camera
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart, 
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import { Transaction, TransactionType, PayrollEntry, User, UserRole, Comment } from './types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './constants';
import { exportToExcel, exportToPDF, exportPayrollToPDF, exportPayrollToExcel, exportProfitLossToPDF, exportSinglePaySlip } from './services/exportService';
import { getFinancialAdvice } from './services/geminiService';

const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'Budi Santoso', email: 'admin@finance.org', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' },
  { id: 'u2', name: 'Siti Aminah', email: 'editor@finance.org', role: 'Editor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti' },
  { id: 'u3', name: 'Andi Wijaya', email: 'viewer@finance.org', role: 'Viewer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi' },
];

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'payroll' | 'reports' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('app_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>(() => {
    const saved = localStorage.getItem('app_payroll');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('app_payroll', JSON.stringify(payrollEntries));
  }, [payrollEntries]);
  
  // --- USER STATE & PERSISTENCE ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  // --- AUTH SYSTEM ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const initialUsers = localStorage.getItem('app_users') ? JSON.parse(localStorage.getItem('app_users')!) : DEFAULT_USERS;
      return initialUsers.find((u: User) => u.id === parsed.id) || null;
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      const updatedSelf = users.find(u => u.id === currentUser.id);
      if (updatedSelf && (updatedSelf.name !== currentUser.name || updatedSelf.email !== currentUser.email || updatedSelf.avatar !== currentUser.avatar)) {
        setCurrentUser(updatedSelf);
      }
    }
  }, [users, currentUser]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      const user = users.find(u => u.email === loginEmail);
      if (user && loginPassword === 'password123') {
        setCurrentUser(user);
        localStorage.setItem('auth_user', JSON.stringify({ id: user.id }));
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setLoginError('Email atau password tidak valid. (Gunakan password123)');
      }
      setIsAuthenticating(false);
    }, 1200);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('auth_user');
    setActiveTab('dashboard');
  };

  // --- USER EDIT SYSTEM ---
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserAvatar, setEditUserAvatar] = useState('');

  const openEditUser = (user: User) => {
    setUserToEdit(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserAvatar(user.avatar || '');
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    
    setUsers(prev => prev.map(u => 
      u.id === userToEdit.id ? { ...u, name: editUserName, email: editUserEmail, avatar: editUserAvatar } : u
    ));
    
    setUserToEdit(null);
  };

  // -------------------

  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  // --- CASH FLOW SYSTEM IMPROVEMENTS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // --- PAYROLL SYSTEM IMPROVEMENTS ---
  const [payrollSearchTerm, setPayrollSearchTerm] = useState('');
  const [payrollFilterPeriod, setPayrollFilterPeriod] = useState('ALL');
  const [editingPayroll, setEditingPayroll] = useState<PayrollEntry | null>(null);

  const [foundationName, setFoundationName] = useState(() => localStorage.getItem('foundationName') || "Yayasan Pendidikan Sejahtera");
  const [foundationAddress, setFoundationAddress] = useState(() => localStorage.getItem('foundationAddress') || "Jl. Merdeka No. 123, Jakarta Selatan");

  useEffect(() => {
    localStorage.setItem('foundationName', foundationName);
    localStorage.setItem('foundationAddress', foundationAddress);
  }, [foundationName, foundationAddress]);

  const [type, setType] = useState<TransactionType>('INCOME');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  const [pName, setPName] = useState('');
  const [pNik, setPNik] = useState('');
  const [pPos, setPPos] = useState('');
  const [pUnit, setPUnit] = useState('');
  const [pStatus, setPStatus] = useState<'Tetap' | 'Kontrak' | 'Honorer'>('Tetap');
  const [pPeriod, setPPeriod] = useState(`${new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`);
  const [pIncome, setPIncome] = useState({ 
    basic: 0, position: 0, transport: 0, meal: 0, family: 0, 
    performance: 0, specialTask: 0, overtime: 0, bonus: 0 
  });
  const [pDeduction, setPDeduction] = useState({ 
    bpjsHealth: 0, bpjsEmployment: 0, taxPph21: 0, 
    absence: 0, loan: 0, infaq: 0, others: 0 
  });

  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'Editor';
  const canAdmin = currentUser?.role === 'Admin';

  const summary = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = summary.income - summary.expense;

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             t.subCategory.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || t.type === filterType;
        const matchesCategory = filterCategory === 'ALL' || t.mainCategory === filterCategory;
        
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
  }, [transactions, searchTerm, filterType, filterCategory, sortConfig]);

  const filteredPayroll = useMemo(() => {
    return payrollEntries.filter(e => {
      const matchesSearch = e.employee.name.toLowerCase().includes(payrollSearchTerm.toLowerCase()) || 
                           e.employee.nik.toLowerCase().includes(payrollSearchTerm.toLowerCase()) ||
                           e.employee.position.toLowerCase().includes(payrollSearchTerm.toLowerCase());
      const matchesPeriod = payrollFilterPeriod === 'ALL' || e.period === payrollFilterPeriod;
      return matchesSearch && matchesPeriod;
    });
  }, [payrollEntries, payrollSearchTerm, payrollFilterPeriod]);

  const payrollSummary = useMemo(() => {
    return payrollEntries.reduce((acc, e) => {
      const gross = (Object.values(e.income) as number[]).reduce((a, b) => a + b, 0);
      const deduct = (Object.values(e.deduction) as number[]).reduce((a, b) => a + b, 0);
      acc.totalBruto += gross;
      acc.totalNet += (gross - deduct);
      return acc;
    }, { totalBruto: 0, totalNet: 0 });
  }, [payrollEntries]);

  const filteredProfitLoss = useMemo(() => {
    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      return (tDate.getMonth() + 1) === reportMonth && tDate.getFullYear() === reportYear;
    });

    const incomeByMain: Record<string, number> = {};
    const expenseByMain: Record<string, number> = {};

    filtered.forEach(t => {
      if (t.type === 'INCOME') {
        incomeByMain[t.mainCategory] = (incomeByMain[t.mainCategory] || 0) + t.amount;
      } else {
        expenseByMain[t.mainCategory] = (expenseByMain[t.mainCategory] || 0) + t.amount;
      }
    });

    const incomeList = Object.entries(incomeByMain).map(([category, amount]) => ({ category, amount }));
    const expenseList = Object.entries(expenseByMain).map(([category, amount]) => ({ category, amount }));

    const totalIncome = incomeList.reduce((s, i) => s + i.amount, 0);
    const totalExpense = expenseList.reduce((s, i) => s + i.amount, 0);

    return { incomeList, expenseList, totalIncome, totalExpense, net: totalIncome - totalExpense };
  }, [transactions, reportMonth, reportYear]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const dashboardStats = [
    { label: 'Saldo Kas', value: balance, icon: <Wallet size={20} />, color: 'bg-indigo-600', text: 'text-indigo-600' },
    { label: 'Pemasukan', value: summary.income, icon: <TrendingUp size={20} />, color: 'bg-emerald-600', text: 'text-emerald-600' },
    { label: 'Pengeluaran', value: summary.expense, icon: <TrendingDown size={20} />, color: 'bg-rose-600', text: 'text-rose-600' },
    { label: 'Beban Gaji', value: payrollSummary.totalBruto, icon: <Users size={20} />, color: 'bg-amber-600', text: 'text-amber-600' },
  ];

  const compareData = [
    { name: 'Pemasukan', total: summary.income, fill: '#10b981' },
    { name: 'Pengeluaran', total: summary.expense, fill: '#ef4444' },
    { name: 'Beban Gaji', total: payrollSummary.totalBruto, fill: '#f59e0b' },
  ];

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !mainCategory || !subCategory || !description || !canEdit || !currentUser) return;
    
    if (editingTransaction) {
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        date,
        description,
        type,
        mainCategory,
        subCategory,
        amount: parseFloat(amount),
        remarks,
        isRecurring,
        frequency: isRecurring ? frequency : undefined,
        lastGeneratedDate: isRecurring ? date : undefined
      };
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? updatedTransaction : t));
      setEditingTransaction(null);
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        date,
        code: `${type === 'INCOME' ? 'IN' : 'EX'}-${Date.now().toString().slice(-6)}`,
        description,
        type,
        mainCategory,
        subCategory,
        amount: parseFloat(amount),
        remarks,
        comments: [],
        createdBy: currentUser.id,
        isRecurring,
        frequency: isRecurring ? frequency : undefined,
        lastGeneratedDate: isRecurring ? date : undefined
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const openEditTransaction = (t: Transaction) => {
    if (!canEdit) return;
    setEditingTransaction(t);
    setType(t.type);
    setDate(t.date);
    setMainCategory(t.mainCategory);
    setSubCategory(t.subCategory);
    setAmount(t.amount.toString());
    setDescription(t.description);
    setRemarks(t.remarks);
    setIsRecurring(t.isRecurring || false);
    setFrequency(t.frequency || 'Monthly');
    setIsModalOpen(true);
  };

  const handleAddPayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    
    if (editingPayroll) {
      const updatedPayroll: PayrollEntry = {
        ...editingPayroll,
        period: pPeriod,
        employee: { name: pName, nik: pNik, position: pPos, unit: pUnit, status: pStatus },
        income: pIncome,
        deduction: pDeduction
      };
      setPayrollEntries(prev => prev.map(p => p.id === editingPayroll.id ? updatedPayroll : p));
      setEditingPayroll(null);
    } else {
      const newPayroll: PayrollEntry = {
        id: crypto.randomUUID(),
        period: pPeriod,
        employee: { name: pName, nik: pNik, position: pPos, unit: pUnit, status: pStatus },
        income: pIncome,
        deduction: pDeduction
      };
      setPayrollEntries(prev => [newPayroll, ...prev]);
    }
    
    setIsPayrollModalOpen(false);
    resetPayrollForm();
  };

  const openEditPayroll = (e: PayrollEntry) => {
    if (!canEdit) return;
    setEditingPayroll(e);
    setPName(e.employee.name);
    setPNik(e.employee.nik);
    setPPos(e.employee.position);
    setPUnit(e.employee.unit || '');
    setPStatus(e.employee.status || 'Tetap');
    setPPeriod(e.period);
    setPIncome(e.income);
    setPDeduction(e.deduction);
    setIsPayrollModalOpen(true);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTransactionId || !currentUser) return;
    
    const comment: Comment = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userName: currentUser.name,
      text: newComment,
      timestamp: new Date().toISOString()
    };

    setTransactions(prev => prev.map(t => {
      if (t.id === selectedTransactionId) {
        return { ...t, comments: [...t.comments, comment] };
      }
      return t;
    }));
    setNewComment('');
  };

  const resetForm = () => {
    setType('INCOME');
    setDate(new Date().toISOString().split('T')[0]);
    setMainCategory('');
    setSubCategory('');
    setAmount('');
    setDescription('');
    setRemarks('');
    setIsRecurring(false);
    setFrequency('Monthly');
    setEditingTransaction(null);
  };

  const resetPayrollForm = () => {
    setPName(''); setPNik(''); setPPos(''); setPUnit(''); setPStatus('Tetap');
    setPIncome({ basic: 0, position: 0, transport: 0, meal: 0, family: 0, performance: 0, specialTask: 0, overtime: 0, bonus: 0 });
    setPDeduction({ bpjsHealth: 0, bpjsEmployment: 0, taxPph21: 0, absence: 0, loan: 0, infaq: 0, others: 0 });
    setEditingPayroll(null);
  };

  const deletePayroll = (id: string) => {
    if (!canAdmin) return;
    setPayrollEntries(prev => prev.filter(e => e.id !== id));
  };
  const deleteTransaction = (id: string) => {
    if (!canAdmin) return;
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    const advice = await getFinancialAdvice(transactions);
    setAiAdvice(advice);
    setIsAnalyzing(false);
  };

  const selectedTransaction = useMemo(() => 
    transactions.find(t => t.id === selectedTransactionId), 
    [transactions, selectedTransactionId]
  );

  // --- RECURRING TRANSACTIONS LOGIC ---
  useEffect(() => {
    if (transactions.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hasNewTransactions = false;
    const newTransactions: Transaction[] = [];

    const updatedTransactions = transactions.map(t => {
      if (!t.isRecurring || !t.frequency || !t.lastGeneratedDate) return t;

      let lastDate = new Date(t.lastGeneratedDate);
      let nextDate = new Date(lastDate);

      const incrementDate = (date: Date, freq: string) => {
        const d = new Date(date);
        if (freq === 'Daily') d.setDate(d.getDate() + 1);
        else if (freq === 'Weekly') d.setDate(d.getDate() + 7);
        else if (freq === 'Monthly') d.setMonth(d.getMonth() + 1);
        else if (freq === 'Yearly') d.setFullYear(d.getFullYear() + 1);
        return d;
      };

      let currentNextDate = incrementDate(lastDate, t.frequency);
      let latestGeneratedDate = t.lastGeneratedDate;

      while (currentNextDate <= today) {
        hasNewTransactions = true;
        const dateStr = currentNextDate.toISOString().split('T')[0];
        
        const generatedTransaction: Transaction = {
          ...t,
          id: crypto.randomUUID(),
          date: dateStr,
          code: `${t.type === 'INCOME' ? 'IN' : 'EX'}-${Date.now().toString().slice(-6)}-REC`,
          comments: [],
          isRecurring: false, // The generated one is a normal transaction
          lastGeneratedDate: undefined,
          frequency: undefined
        };
        
        newTransactions.push(generatedTransaction);
        latestGeneratedDate = dateStr;
        currentNextDate = incrementDate(currentNextDate, t.frequency);
      }

      if (latestGeneratedDate !== t.lastGeneratedDate) {
        return { ...t, lastGeneratedDate: latestGeneratedDate };
      }
      return t;
    });

    if (hasNewTransactions) {
      setTransactions([...newTransactions, ...updatedTransactions]);
    }
  }, []); // Run once on mount

  // --- LOGIN SCREEN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>

        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-10">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="bg-indigo-600 p-4 rounded-[1.25rem] shadow-lg shadow-indigo-100 mb-6">
                  <Wallet className="text-white w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">FinanceFlow</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Sistem Manajemen Keuangan</p>
              </div>

              {loginError && (
                <div className="mb-6 bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs font-bold text-rose-600 leading-snug">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      required 
                      placeholder="admin@finance.org"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4.5 text-sm font-black outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-14 py-4.5 text-sm font-black outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isAuthenticating}
                  className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-2xl shadow-indigo-200 uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      <span>Masuk Sistem</span>
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="bg-slate-50 p-6 border-t flex items-center justify-center gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akun Tersedia (Demo):</p>
              <div className="flex gap-2">
                {['admin', 'editor', 'viewer'].map(role => (
                  <button 
                    key={role}
                    onClick={() => { setLoginEmail(`${role}@finance.org`); setLoginPassword('password123'); }}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all uppercase"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-inter">
      <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">FinanceFlow</h1>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <Building2 size={10} /> <span>{foundationName}</span>
            </div>
          </div>
        </div>

        <nav className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
            { id: 'finance', icon: <DollarSign size={18} />, label: 'Arus Kas' },
            { id: 'payroll', icon: <Users size={18} />, label: 'Penggajian' },
            { id: 'reports', icon: <Calculator size={18} />, label: 'Laba Rugi' },
            { id: 'settings', icon: <Settings size={18} />, label: 'Pengaturan' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 md:px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowUserSwitcher(!showUserSwitcher)}
              className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-1.5 pr-4 rounded-2xl transition-all border border-slate-200 shadow-sm"
            >
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-xl bg-white p-0.5 border shadow-sm" />
              <div className="text-left hidden sm:block">
                <p className="text-[10px] font-black text-slate-900 leading-none uppercase tracking-tighter">{currentUser.name}</p>
                <div className="flex items-center gap-1">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                    currentUser.role === 'Admin' ? 'bg-indigo-100 text-indigo-600' :
                    currentUser.role === 'Editor' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserSwitcher ? 'rotate-180' : ''}`} />
            </button>
            
            {showUserSwitcher && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-3 z-50 animate-in fade-in zoom-in duration-200">
                <p className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b mb-2">Profil Pengguna</p>
                <div className="p-3">
                    <div className="flex items-center gap-3 w-full p-2.5 bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm rounded-2xl border transition-all">
                      <img src={currentUser.avatar} className="w-10 h-10 rounded-xl border bg-white" />
                      <div className="text-left flex-1">
                        <p className="text-xs font-black leading-none">{currentUser.name}</p>
                        <p className="text-[9px] mt-1 font-bold text-slate-400 uppercase tracking-widest">{currentUser.role}</p>
                      </div>
                      <ShieldCheck size={14} />
                    </div>
                </div>
                <div className="border-t mt-1 p-1">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <LogOut size={16} /> Keluar Sistem
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Executive Dashboard</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-500 font-medium">Sesi Aktif:</span>
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <CheckCircle2 size={12} /> {currentUser.name} ({currentUser.role})
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-2xl border shadow-sm flex items-center gap-3">
                  <Users size={18} className="text-indigo-600" />
                  <div className="flex -space-x-2">
                    {users.map(u => (
                      <img key={u.id} src={u.avatar} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" title={`${u.name} (${u.role})`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{users.length} Anggota Tim</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 ${stat.color}`}></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${stat.text}`}>Statistik</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">{stat.label}</p>
                    <h3 className="text-xl font-black text-slate-800 tracking-tighter">Rp {stat.value.toLocaleString('id-ID')}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
                  <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-700">
                    <LayoutDashboard size={20} className="text-indigo-600" /> Komparasi Keuangan Tim
                  </h2>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={compareData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="total" radius={[10, 10, 0, 0]} barSize={60}>
                          {compareData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-700 uppercase tracking-tighter">
                    <History size={20} className="text-indigo-600" /> Transaksi Terakhir & Kolaborasi
                  </h2>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-3xl border-slate-100">
                        <DollarSign size={40} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-slate-400 font-bold text-sm">Belum ada transaksi terekam.</p>
                      </div>
                    ) : (
                      transactions.slice(0, 5).map(t => (
                        <div key={t.id} onClick={() => setSelectedTransactionId(t.id)} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-indigo-100 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                              {t.type === 'INCOME' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-sm flex items-center gap-2">
                                {t.description}
                                {t.comments.length > 0 && (
                                  <span className="flex items-center gap-1 text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black">
                                    <MessageSquare size={10} /> {t.comments.length}
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.subCategory} • {t.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                            </p>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">Diskusikan</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none"></div>
                  <div className="flex items-center gap-2 text-indigo-200 mb-4">
                    <BrainCircuit />
                    <h2 className="text-lg font-black uppercase tracking-tighter">Asisten Keuangan Tim</h2>
                  </div>
                  <p className="text-indigo-100 text-sm leading-relaxed mb-6 font-medium">
                    Asisten AI akan menganalisis data tim dan memberikan rekomendasi strategis.
                  </p>
                  <button 
                    onClick={analyzeWithAI} 
                    disabled={isAnalyzing || !canEdit} 
                    className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all transform active:scale-95 flex justify-center items-center gap-3 shadow-xl mb-4 disabled:opacity-50"
                  >
                    {isAnalyzing ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-900 border-t-transparent" /> : <>Dapatkan Insight AI</>}
                  </button>
                  {aiAdvice && (
                    <div className="bg-indigo-800/40 p-5 rounded-2xl text-[11px] leading-relaxed whitespace-pre-line border border-indigo-700/50 backdrop-blur-sm max-h-[200px] overflow-y-auto custom-scrollbar italic font-medium">
                      "{aiAdvice}"
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck className="text-indigo-600" />
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Hak Akses: {currentUser.role}</h2>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Lihat Seluruh Laporan', access: true },
                      { label: 'Tambah & Edit Data', access: canEdit },
                      { label: 'Analisis AI Strategis', access: canEdit },
                      { label: 'Akses Audit Komentar', access: true },
                      { label: 'Modifikasi Payroll', access: canEdit },
                      { label: 'Hapus Rekaman Permanen', access: canAdmin },
                    ].map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-bold">{p.label}</span>
                        {p.access ? (
                          <span className="text-emerald-500 font-black tracking-widest text-[9px] bg-emerald-50 px-2 py-0.5 rounded-md">ALLOW</span>
                        ) : (
                          <span className="text-rose-400 font-black tracking-widest text-[9px] bg-rose-50 px-2 py-0.5 rounded-md">DENY</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ... OTHER TABS (FINANCE, PAYROLL, REPORTS) RETAINED FROM PREVIOUS STATE ... */}
        {activeTab === 'finance' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Jurnal Arus Kas</h2>
                <p className="text-slate-500 font-medium italic">Monitor seluruh aliran dana masuk dan keluar.</p>
              </div>
              {canEdit && (
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-2xl shadow-indigo-100 uppercase tracking-widest">
                  <PlusCircle size={20} /> Input Jurnal Baru
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group transition-all hover:shadow-md">
                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform"><TrendingUp size={28} /></div>
                <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Inflow</p><h3 className="text-2xl font-black text-emerald-600">Rp {summary.income.toLocaleString('id-ID')}</h3></div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group transition-all hover:shadow-md">
                <div className="bg-rose-50 p-4 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform"><TrendingDown size={28} /></div>
                <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Outflow</p><h3 className="text-2xl font-black text-rose-600">Rp {summary.expense.toLocaleString('id-ID')}</h3></div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group transition-all hover:shadow-md">
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><Wallet size={28} /></div>
                <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Saldo</p><h3 className="text-2xl font-black text-indigo-600">Rp {balance.toLocaleString('id-ID')}</h3></div>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b bg-slate-50/50 flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="font-black text-slate-700 flex items-center gap-2 uppercase tracking-tight"><History size={20} className="text-indigo-600" /> Jurnal Transaksi</h2>
                  <div className="flex gap-3">
                    <button onClick={() => exportToExcel(filteredTransactions)} className="px-5 py-2.5 border rounded-xl hover:bg-white text-emerald-600 font-black text-xs transition-all shadow-sm">EXCEL</button>
                    <button onClick={() => exportToPDF(filteredTransactions)} className="px-5 py-2.5 border rounded-xl hover:bg-white text-rose-600 font-black text-xs transition-all shadow-sm">PDF</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Cari transaksi..." 
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                  >
                    <option value="ALL">Semua Tipe</option>
                    <option value="INCOME">Pemasukan (Inflow)</option>
                    <option value="EXPENSE">Pengeluaran (Outflow)</option>
                  </select>
                  <select 
                    className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="ALL">Semua Kategori</option>
                    {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Total: {filteredTransactions.length}</span>
                  </div>
                  <button 
                    onClick={() => { setSearchTerm(''); setFilterType('ALL'); setFilterCategory('ALL'); }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                    <tr>
                      <th className="p-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setSortConfig({ key: 'code', direction: sortConfig.key === 'code' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                        Kode {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="p-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setSortConfig({ key: 'description', direction: sortConfig.key === 'description' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                        Uraian {sortConfig.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="p-6">Klasifikasi</th>
                      <th className="p-6 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setSortConfig({ key: 'amount', direction: sortConfig.key === 'amount' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                        Nominal {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="p-6 text-center">Thread</th>
                      <th className="p-6 text-center">Opsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.length === 0 ? (<tr><td colSpan={6} className="p-20 text-center text-slate-300 italic font-bold">Tidak ada transaksi yang sesuai kriteria.</td></tr>) : (
                      filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-6 font-mono text-[11px] text-slate-400 font-black">{t.code}</td>
                          <td className="p-6 font-black text-slate-800">
                            <div className="flex items-center gap-2">
                              {t.description}
                              {t.isRecurring && (
                                <span className="p-1 bg-amber-100 text-amber-600 rounded-md" title={`Recurring: ${t.frequency}`}>
                                  <History size={12} />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter flex items-center gap-1"><Calendar size={10} /> {t.date}</div>
                          </td>
                          <td className="p-6"><span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-tighter">{t.subCategory}</span></td>
                          <td className={`p-6 text-right font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="p-6 text-center">
                            <button onClick={() => setSelectedTransactionId(t.id)} className={`relative p-3 rounded-2xl transition-all ${t.comments.length > 0 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                              <MessageSquare size={18} />
                              {t.comments.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-indigo-600 text-[10px] rounded-full flex items-center justify-center font-black shadow-md">{t.comments.length}</span>}
                            </button>
                          </td>
                          <td className="p-6 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {canEdit && (
                                <button onClick={() => openEditTransaction(t)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                              )}
                              {canAdmin ? (
                                <button onClick={() => deleteTransaction(t.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                              ) : (
                                <ShieldCheck size={18} className="text-slate-200" />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PAYROLL */}
        {activeTab === 'payroll' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Penggajian</h2>
                <p className="text-slate-500 font-medium italic">Otomatisasi slip gaji dan rekapitulasi beban SDM.</p>
              </div>
              {canEdit && (
                <button onClick={() => setIsPayrollModalOpen(true)} className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-2xl shadow-indigo-100 uppercase tracking-widest">
                  <PlusCircle size={20} /> Disbursement Baru
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group transition-all hover:shadow-md">
                <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform"><Briefcase size={28} /></div>
                <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Bruto</p><h3 className="text-2xl font-black text-amber-600">Rp {payrollSummary.totalBruto.toLocaleString('id-ID')}</h3></div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group transition-all hover:shadow-md">
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><Wallet size={28} /></div>
                <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Netto (THP)</p><h3 className="text-2xl font-black text-indigo-600">Rp {payrollSummary.totalNet.toLocaleString('id-ID')}</h3></div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b bg-slate-50/50 flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="font-black text-slate-700 flex items-center gap-2 uppercase tracking-tight"><Users size={20} className="text-indigo-600" /> Daftar Payroll</h2>
                  <div className="flex gap-3">
                    <button onClick={() => exportPayrollToExcel(filteredPayroll, payrollFilterPeriod)} className="px-5 py-2.5 border rounded-xl hover:bg-white text-emerald-600 font-black text-xs transition-all shadow-sm">EXCEL</button>
                    <button onClick={() => exportPayrollToPDF(filteredPayroll, payrollFilterPeriod, foundationName, foundationAddress)} className="px-5 py-2.5 border rounded-xl hover:bg-white text-rose-600 font-black text-xs transition-all shadow-sm">PDF</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Cari karyawan..." 
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                      value={payrollSearchTerm}
                      onChange={(e) => setPayrollSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                    value={payrollFilterPeriod}
                    onChange={(e) => setPayrollFilterPeriod(e.target.value)}
                  >
                    <option value="ALL">Semua Periode</option>
                    {Array.from(new Set(payrollEntries.map(e => e.period))).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => { setPayrollSearchTerm(''); setPayrollFilterPeriod('ALL'); }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                    <tr>
                      <th className="p-6">NIK / NIP</th>
                      <th className="p-6">Nama Karyawan</th>
                      <th className="p-6">Jabatan</th>
                      <th className="p-6">Periode</th>
                      <th className="p-6 text-right">THP (Netto)</th>
                      <th className="p-6 text-center">Opsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayroll.length === 0 ? (
                      <tr><td colSpan={6} className="p-20 text-center text-slate-300 italic font-bold">Data payroll tidak ditemukan.</td></tr>
                    ) : (
                      filteredPayroll.map(e => {
                        const gross = (Object.values(e.income) as number[]).reduce((a, b) => a + b, 0);
                        const deduct = (Object.values(e.deduction) as number[]).reduce((a, b) => a + b, 0);
                        const net = gross - deduct;
                        return (
                          <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="p-6 font-mono text-[11px] text-slate-400 font-black">{e.employee.nik}</td>
                            <td className="p-6 font-black text-slate-800">{e.employee.name}</td>
                            <td className="p-6"><span className="px-3 py-1 rounded-full bg-indigo-50 text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{e.employee.position}</span></td>
                            <td className="p-6 font-bold text-slate-500 text-xs">{e.period}</td>
                            <td className="p-6 text-right font-black text-slate-900">Rp {net.toLocaleString('id-ID')}</td>
                            <td className="p-6 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button 
                                  onClick={() => exportSinglePaySlip(e, foundationName, foundationAddress)}
                                  className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                  title="Cetak Slip Gaji"
                                >
                                  <FileText size={18} />
                                </button>
                                {canEdit && (
                                  <button onClick={() => openEditPayroll(e)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                                )}
                                {canAdmin ? (
                                  <button onClick={() => deletePayroll(e.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                ) : (
                                  <ShieldCheck size={18} className="text-slate-200" />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: REPORTS (LABA RUGI) */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Laporan Laba Rugi</h2>
                <p className="text-slate-500 font-medium italic">Analisis performa keuangan bulanan yayasan.</p>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border shadow-sm">
                <select 
                  value={reportMonth} 
                  onChange={e => setReportMonth(parseInt(e.target.value))}
                  className="bg-transparent text-xs font-black uppercase tracking-widest outline-none px-2"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2024, i))}</option>
                  ))}
                </select>
                <select 
                  value={reportYear} 
                  onChange={e => setReportYear(parseInt(e.target.value))}
                  className="bg-transparent text-xs font-black uppercase tracking-widest outline-none px-2 border-l"
                >
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button 
                  onClick={() => exportProfitLossToPDF(filteredProfitLoss.incomeList, filteredProfitLoss.expenseList, `${new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2024, reportMonth-1))} ${reportYear}`, foundationName)}
                  className="ml-2 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b bg-slate-50/30">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Rincian Operasional</h3>
                    
                    {/* INCOME SECTION */}
                    <div className="space-y-4 mb-10">
                      <div className="flex justify-between items-center border-b-2 border-emerald-100 pb-2">
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">I. Pendapatan</span>
                        <span className="text-xs font-black text-emerald-600">Rp {filteredProfitLoss.totalIncome.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="space-y-3 px-2">
                        {filteredProfitLoss.incomeList.length === 0 ? (
                          <p className="text-[10px] text-slate-300 italic">Tidak ada data pendapatan.</p>
                        ) : (
                          filteredProfitLoss.incomeList.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-bold text-slate-600">
                              <span>{item.category}</span>
                              <span>Rp {item.amount.toLocaleString('id-ID')}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* EXPENSE SECTION */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b-2 border-rose-100 pb-2">
                        <span className="text-xs font-black text-rose-600 uppercase tracking-widest">II. Beban / Pengeluaran</span>
                        <span className="text-xs font-black text-rose-600">Rp {filteredProfitLoss.totalExpense.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="space-y-3 px-2">
                        {filteredProfitLoss.expenseList.length === 0 ? (
                          <p className="text-[10px] text-slate-300 italic">Tidak ada data pengeluaran.</p>
                        ) : (
                          filteredProfitLoss.expenseList.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-bold text-slate-600">
                              <span>{item.category}</span>
                              <span>Rp {item.amount.toLocaleString('id-ID')}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`p-8 flex justify-between items-center ${filteredProfitLoss.net >= 0 ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Laba/Rugi Bersih (Net)</p>
                      <h4 className="text-3xl font-black tracking-tighter">Rp {filteredProfitLoss.net.toLocaleString('id-ID')}</h4>
                    </div>
                    <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                      <Calculator size={32} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Struktur Pendapatan</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={filteredProfitLoss.incomeList.length > 0 ? filteredProfitLoss.incomeList : [{category: 'Empty', amount: 1}]}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                        >
                          {filteredProfitLoss.incomeList.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {filteredProfitLoss.incomeList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                          <span className="text-slate-500">{item.category}</span>
                        </div>
                        <span className="text-slate-800">{((item.amount / filteredProfitLoss.totalIncome) * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle size={18} className="text-indigo-300" /> Financial Health
                  </h3>
                  <p className="text-xs text-indigo-100 leading-relaxed font-medium mb-6">
                    {filteredProfitLoss.net > 0 
                      ? "Yayasan dalam kondisi surplus. Pertimbangkan alokasi dana cadangan untuk pengembangan infrastruktur."
                      : "Yayasan dalam kondisi defisit. Evaluasi kembali beban operasional dan cari sumber pendanaan baru."}
                  </p>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${filteredProfitLoss.net > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} 
                      style={{width: `${Math.min(Math.abs(filteredProfitLoss.net / (filteredProfitLoss.totalIncome || 1)) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
              <div className="flex items-center gap-6 pb-8 border-b">
                <div className="bg-indigo-600 p-5 rounded-[1.5rem] text-white shadow-xl shadow-indigo-100"><Settings size={36} /></div>
                <div><h2 className="text-3xl font-black text-slate-800 tracking-tight">System Configuration</h2><p className="text-slate-500 font-medium">Pengelolaan profil yayasan dan akses tim.</p></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section className="space-y-8">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><Building2 size={16} className="text-indigo-600" /> Foundation Identity</h3>
                  <div className="space-y-5">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entity Official Name</label><input type="text" value={foundationName} onChange={e => setFoundationName(e.target.value)} disabled={!canAdmin} className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all bg-slate-50 disabled:opacity-50" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">HQ Mailing Address</label><textarea rows={4} value={foundationAddress} onChange={e => setFoundationAddress(e.target.value)} disabled={!canAdmin} className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all bg-slate-50 resize-none disabled:opacity-50" /></div>
                  </div>
                </section>

                <section className="space-y-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><Users size={16} className="text-indigo-600" /> Team Access Control</h3>
                  <div className="space-y-4">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                          <img src={user.avatar} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm bg-white" />
                          <div><p className="text-sm font-black text-slate-800">{user.name}</p><div className="flex items-center gap-2 mt-1"><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${user.role === 'Admin' ? 'bg-indigo-600 text-white' : user.role === 'Editor' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>{user.role}</span><span className="text-[9px] text-slate-400 font-bold">{user.email}</span></div></div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditUser(user)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Ubah Nama, Email & Foto"><Edit2 size={18} /></button>
                          {canAdmin && user.id !== currentUser?.id && (<button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"><MoreVertical size={18} /></button>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL: EDIT USER (WITH AVATAR PICKER) --- */}
      {userToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Edit Identitas Tim</h2>
              <button onClick={() => setUserToEdit(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={24} className="text-slate-400"/></button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
              <div className="flex flex-col items-center mb-4">
                <div className="relative group cursor-pointer">
                  <img src={editUserAvatar} className="w-24 h-24 rounded-[1.75rem] border-4 border-indigo-100 shadow-2xl mb-2 bg-white transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-indigo-600/20 rounded-[1.75rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{userToEdit.role} ACCESS</span>
              </div>

              {/* Avatar Selection Grid */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pilih Foto Profil</label>
                <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-3xl border-2 border-slate-100">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button 
                      key={idx}
                      type="button"
                      onClick={() => setEditUserAvatar(preset)}
                      className={`relative w-full aspect-square rounded-xl overflow-hidden border-4 transition-all hover:scale-110 ${editUserAvatar === preset ? 'border-indigo-600 shadow-lg' : 'border-white shadow-sm'}`}
                    >
                      <img src={preset} className="w-full h-full object-cover" />
                      {editUserAvatar === preset && (
                        <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                          <CheckCircle2 className="text-indigo-600" size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                <input type="text" required value={editUserName} onChange={e => setEditUserName(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-colors bg-slate-50 shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email System</label>
                <input type="email" required value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-colors bg-slate-50 shadow-inner" />
              </div>
              
              <button type="submit" className="w-full py-5 rounded-[1.5rem] font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl transform active:scale-95 transition-all uppercase tracking-widest">
                Save Team Identity
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ALL OTHER MODALS (PAYROLL, TRANSACTION, COMMENTS) REMAINED --- */}
      {selectedTransactionId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl shadow-lg ${selectedTransaction?.type === 'INCOME' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {selectedTransaction?.type === 'INCOME' ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase leading-none mb-1 tracking-tighter">Finance Discussion Thread</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedTransaction?.code}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTransactionId(null)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all">
                <X size={28} className="text-slate-400"/>
              </button>
            </div>
            <div className="p-8 bg-slate-50/30 border-b space-y-4">
              <div className="flex justify-between items-start">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction Subject</p><h3 className="text-xl font-black text-slate-900 leading-tight">{selectedTransaction?.description}</h3></div>
                <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Value</p><p className={`text-2xl font-black ${selectedTransaction?.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>Rp {selectedTransaction?.amount.toLocaleString('id-ID')}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Originator</p>
                  <div className="flex items-center gap-2"><img src={users.find(u => u.id === selectedTransaction?.createdBy)?.avatar} className="w-5 h-5 rounded-full border bg-slate-50" /><p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{users.find(u => u.id === selectedTransaction?.createdBy)?.name || 'System'}</p></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Budget Allocation</p><p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{selectedTransaction?.subCategory}</p></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/20">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center border-b pb-4">Communication Log ({selectedTransaction?.comments.length})</p>
              {selectedTransaction?.comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-300 italic"><div className="p-5 bg-slate-100 rounded-full mb-4"><MessageSquare size={40} className="opacity-30" /></div><p className="text-sm font-black uppercase tracking-widest">No active discussion.</p></div>
              ) : (
                selectedTransaction?.comments.map(comment => (
                  <div key={comment.id} className={`flex gap-4 ${comment.userId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                    <img src={users.find(u => u.id === comment.userId)?.avatar} className="w-10 h-10 rounded-2xl border-2 border-white shadow-md bg-white flex-shrink-0" />
                    <div className={`flex flex-col ${comment.userId === currentUser?.id ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-2 px-1"><span className="text-[10px] font-black text-slate-800 uppercase">{comment.userName}</span><span className="text-[8px] font-bold text-slate-300">{new Date(comment.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>
                      <div className={`p-4 rounded-[1.5rem] text-xs font-bold leading-relaxed max-w-[320px] shadow-sm ${comment.userId === currentUser?.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border-2 text-slate-600 rounded-tl-none'}`}>{comment.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-8 border-t bg-white sticky bottom-0">
              <form onSubmit={handleAddComment} className="relative group"><input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Ketik pesan untuk tim auditor..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 pr-16 text-xs font-black outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" /><button type="submit" disabled={!newComment.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-indigo-100"><Send size={20} /></button></form>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-2 border-indigo-50">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                {editingTransaction ? 'Edit Jurnal Transaksi' : 'Journal Ingress'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
                <X size={28} className="text-slate-400"/>
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-8 space-y-8">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                <button type="button" onClick={() => setType('INCOME')} className={`flex-1 py-4 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}>Inflow</button>
                <button type="button" onClick={() => setType('EXPENSE')} className={`flex-1 py-4 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}>Outflow</button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Timestamp</label><input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-colors bg-slate-50 shadow-inner"/></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nominal (Rp)</label><input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-colors bg-slate-50 shadow-inner"/></div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ledger Group</label>
                <select required value={mainCategory} onChange={e => {setMainCategory(e.target.value); setSubCategory('');}} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black outline-none bg-slate-50 focus:border-indigo-500 transition-colors shadow-inner appearance-none">
                  <option value="">Pilih Kelompok Akun...</option>
                  {(type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              {mainCategory && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sub-Account Detail</label>
                  <select required value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black outline-none bg-slate-50 focus:border-indigo-500 transition-colors shadow-inner">
                    <option value="">Spesifikasi Alokasi...</option>
                    {(type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).find(c => c.name === mainCategory)?.items.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Memo / Jurnal Deskripsi</label><input type="text" required placeholder="Deskripsi transaksi..." value={description} onChange={e => setDescription(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-colors bg-slate-50 shadow-inner"/></div>
              
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isRecurring ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                      <History size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Transaksi Rutin</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Otomatisasi Jurnal</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`w-12 h-6 rounded-full transition-all relative ${isRecurring ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isRecurring ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {isRecurring && (
                  <div className="pt-4 border-t border-slate-200 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Frekuensi Pengulangan</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFrequency(f as any)}
                          className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${frequency === f ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm' : 'bg-white border-transparent text-slate-400 hover:border-slate-200'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <p className="mt-4 text-[9px] text-slate-400 font-medium italic">
                      * Sistem akan otomatis membuat jurnal baru setiap periode {frequency.toLowerCase()} berdasarkan tanggal mulai.
                    </p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={!canEdit} className={`w-full py-5 rounded-[1.5rem] font-black text-white shadow-2xl transform active:scale-95 transition-all uppercase tracking-widest ${type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>Authenticate & Save Jurnal</button>
            </form>
          </div>
        </div>
      )}

      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in duration-500">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
                  <Briefcase size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                  {editingPayroll ? 'Edit Payroll Disbursement' : 'Payroll Disbursement Form'}
                </h2>
              </div>
              <button onClick={() => setIsPayrollModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all">
                <X size={32} className="text-slate-400"/>
              </button>
            </div>
            <form onSubmit={handleAddPayroll} className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
              <section className="space-y-6"><h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] border-b-2 border-indigo-50 pb-4 flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-indigo-600"></div> Employee Identification</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase px-1">Full Legal Name</label><input placeholder="Nama Karyawan" required className="w-full border-2 border-slate-50 rounded-2xl px-5 py-3.5 text-sm font-black outline-none focus:border-indigo-400 shadow-inner bg-slate-50" value={pName} onChange={e => setPName(e.target.value)} /></div><div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase px-1">Gov ID / NIK / NIP</label><input placeholder="00.0000.000" required className="w-full border-2 border-slate-50 rounded-2xl px-5 py-3.5 text-sm font-black outline-none focus:border-indigo-400 shadow-inner bg-slate-50" value={pNik} onChange={e => setPNik(e.target.value)} /></div><div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase px-1">Assigned Position</label><input placeholder="Jabatan..." required className="w-full border-2 border-slate-50 rounded-2xl px-5 py-3.5 text-sm font-black outline-none focus:border-indigo-400 shadow-inner bg-slate-50" value={pPos} onChange={e => setPPos(e.target.value)} /></div></div></section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section className="space-y-6"><h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] border-b-2 border-emerald-50 pb-4 flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-600"></div> Earnings Component (Rp)</h3><div className="space-y-4 bg-emerald-50/20 p-8 rounded-[2rem] border border-emerald-100 shadow-sm">{Object.entries({basic: "Gaji Pokok", position: "Tunjangan Jabatan", transport: "Logistik / Transport", bonus: "Bonus / THR"}).map(([key, label]) => (<div key={key} className="flex items-center gap-6"><label className="text-[10px] font-black text-slate-500 uppercase flex-1">{label}</label><input type="number" className="w-40 border-2 border-white rounded-xl px-4 py-2.5 text-xs font-black text-right outline-none focus:border-emerald-300 shadow-sm" value={(pIncome as any)[key]} onChange={e => setPIncome({...pIncome, [key]: parseFloat(e.target.value) || 0})} /></div>))}</div></section>
                <section className="space-y-6"><h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em] border-b-2 border-rose-50 pb-4 flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-rose-600"></div> Deductions Component (Rp)</h3><div className="space-y-4 bg-rose-50/20 p-8 rounded-[2rem] border border-rose-100 shadow-sm">{Object.entries({taxPph21: "Pajak (PPh 21)", loan: "Cicilan / Pinjaman", others: "Potongan Lainnya"}).map(([key, label]) => (<div key={key} className="flex items-center gap-6"><label className="text-[10px] font-black text-slate-500 uppercase flex-1">{label}</label><input type="number" className="w-40 border-2 border-white rounded-xl px-4 py-2.5 text-xs font-black text-right outline-none focus:border-rose-300 shadow-sm" value={(pDeduction as any)[key]} onChange={e => setPDeduction({...pDeduction, [key]: parseFloat(e.target.value) || 0})} /></div>))}</div></section>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group"><div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none"></div><div className="z-10 text-center md:text-left"><p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.5em] mb-2 opacity-70">Take Home Pay (THP)</p><h4 className="text-5xl font-black tabular-nums tracking-tighter">Rp {((Object.values(pIncome) as number[]).reduce((a, b) => a + b, 0) - (Object.values(pDeduction) as number[]).reduce((a, b) => a + b, 0)).toLocaleString('id-ID')}</h4></div><button type="submit" disabled={!canEdit} className="z-10 bg-white text-slate-900 px-12 py-5 rounded-[1.5rem] font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase tracking-[0.2em] flex items-center gap-3 disabled:opacity-30"><Download size={20} /> Authorize Payroll</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
