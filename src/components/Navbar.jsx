import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Sun,
  Moon,
  LogOut,
  Plus,
  LayoutDashboard,
  History,
  Menu,
  X,
  FileText,
  MessageSquare,
  Trash2,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Search,
  Check,
  AlertTriangle,
  AlertCircle,
  Info,
  PhoneCall,
  Globe,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function ImageThumbnail({ scan, onClick }) {
  const [hasError, setHasError] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className="group flex flex-col p-2 bg-slate-900/50 hover:bg-slate-900 border border-border-color/20 rounded-xl cursor-pointer transition-all text-left overflow-hidden"
    > 
      <div className="h-20 w-full rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-accent-color mb-1.5 group-hover:border-accent-color/30 transition-all overflow-hidden relative">
        {scan.preview && !hasError && (
          <img
            src={scan.preview}
            alt=""
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        )}
        {(!scan.preview || hasError) && (
          <ImageIcon className="w-4 h-4 text-accent-color/60 animate-pulse" />
        )}
      </div>
      <span className="text-[9px] font-bold text-white truncate block">
        {scan.filename}
      </span>
      <span className="text-[8px] text-slate-400 mt-0.5">
        {new Date(scan.timestamp).toLocaleDateString()}
      </span>
    </motion.div>
  );
}

export default function Navbar() {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    user,
    logout,
    setActiveScan,
    history,
    deleteScan,
    clearAllHistory,
    setShouldOpenFilePicker,
    isLeftDrawerOpen,
    setIsLeftDrawerOpen,
    isRightDrawerOpen,
    setIsRightDrawerOpen,
    toasts,
    addToast
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const [searchLeft, setSearchLeft] = useState('');
  const [filterLeft, setFilterLeft] = useState('All'); // All, Scam, Safe, Suspicious
  const [selectedImage, setSelectedImage] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const [searchRight, setSearchRight] = useState('');
  const [filterRight, setFilterRight] = useState('All'); // All, Scam, Safe, Suspicious

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    setIsLeftDrawerOpen(false);
    setIsRightDrawerOpen(false);
    navigate(path);
  };

  const handleNewScan = () => {
    setActiveScan(null);
    setIsLeftDrawerOpen(false);
    setIsRightDrawerOpen(false);
    setShouldOpenFilePicker(true);
    navigate('/dashboard');
    addToast("Scanner input trigger initialized.", "info");
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    setLangDropdownOpen(false);
    setIsLeftDrawerOpen(false);
    setIsRightDrawerOpen(false);
    logout();
    navigate('/login', { replace: true });
    addToast("Logged out successfully.", "info");
  };

  const handleClearHistory = () => {
    clearAllHistory();
    addToast("Scan diagnostics log cleared.", "info");
  };

  const handleDeleteScan = (id, filename) => {
    deleteScan(id);
    addToast(`Scan for "${filename}" removed.`, "info");
  };

  const getFilteredItems = (searchQuery, filterTab) => {
    return history.filter((scan) => {
      const searchStr = `${scan.filename} ${scan.result?.verdict || ''} ${scan.text || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const risk = scan.result?.riskScore ?? 0;
      let matchesFilter = true;
      if (filterTab === 'Scam') {
        matchesFilter = risk >= 50;
      } else if (filterTab === 'Suspicious') {
        matchesFilter = risk >= 20 && risk < 50;
      } else if (filterTab === 'Safe') {
        matchesFilter = risk < 20;
      }

      return matchesSearch && matchesFilter;
    });
  };

  const leftFilteredScans = useMemo(() => getFilteredItems(searchLeft, filterLeft), [history, searchLeft, filterLeft]);
  const rightFilteredScans = useMemo(() => getFilteredItems(searchRight, filterRight), [history, searchRight, filterRight]);
  const imageScans = useMemo(() => {
    return history.filter(
      (scan) => scan.filename && (scan.filename.endsWith('.png') || scan.filename.endsWith('.jpg') || scan.filename.endsWith('.jpeg'))
    );
  }, [history]);

  const templateScans = useMemo(() => {
    return history.filter(
      (scan) => scan.filename && (scan.filename.includes('Offer') || scan.filename.includes('Trap') || scan.filename.includes('WFH'))
    );
  }, [history]);

  const testAnalytics = useMemo(() => {
    const total = templateScans.length;
    const safe = templateScans.filter((s) => s.result?.riskScore < 20).length;
    const scam = templateScans.filter((s) => s.result?.riskScore >= 50).length;
    const suspicious = templateScans.filter((s) => s.result?.riskScore >= 20 && s.result?.riskScore < 50).length;
    return { total, safe, scam, suspicious };
  }, [templateScans]);

  const selectScan = (scan) => {
    setActiveScan(scan);
    setIsLeftDrawerOpen(false);
    setIsRightDrawerOpen(false);
    navigate('/analysis-result');
  };

  const resumeLastScan = () => {
    if (history.length > 0) {
      setActiveScan(history[0]);
      setIsLeftDrawerOpen(false);
      navigate('/analysis-result');
      addToast(`Resumed last scan: ${history[0].filename}`, "info");
    }
  };

  if (!user) return null;

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-950/80 dark:bg-emerald-950/90',
          text: 'text-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        };
      case 'error':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-950/80 dark:bg-red-950/90',
          text: 'text-red-300',
          icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
        };
      case 'warning':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-950/80 dark:bg-amber-950/90',
          text: 'text-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        };
      default:
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-950/80 dark:bg-blue-950/90',
          text: 'text-blue-300',
          icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />
        };
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-18 z-50 w-full border-b border-border-color bg-card-bg/85 backdrop-blur-xl shadow-md transition-all duration-300 flex items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-full items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
                className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 border-accent-color/20 bg-card-bg/40 ${
                  isLeftDrawerOpen ? 'bg-accent-color/10 border-accent-color text-accent-color' : 'text-text-primary hover:bg-app-bg'
                }`}
                aria-label="Toggle Left Hamburger Drawer"
              >
                <Menu className="w-5 h-5 text-accent-color" />
              </button>

              <div
                className="flex items-center gap-3 cursor-pointer select-none group"
                onClick={() => handleNavigation('/dashboard')}
              >
                <div className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 relative flex items-center justify-center w-10 h-10 rounded-xl border shadow-sm transition-transform group-hover:scale-102 duration-150">
                  <Shield className="w-5 h-5 text-accent-color" />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold tracking-tight text-text-primary text-base">
                      {t('appTitle')}
                    </span>
                  </div>
                  <span className="text-[10px] block text-accent-color font-semibold uppercase tracking-wider">
                    {t('appSubtitle')}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => handleNavigation('/dashboard')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive('/dashboard') && !isRightDrawerOpen
                    ? 'bg-btn-bg text-btn-text'
                    : 'text-text-secondary hover:text-text-primary hover:bg-app-bg'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('dashboard')}
              </button>
              
              <button
                onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  isRightDrawerOpen
                    ? 'bg-btn-bg text-btn-text'
                    : 'text-text-secondary hover:text-text-primary hover:bg-app-bg'
                }`}
              >
                <History className="w-4 h-4" />
                {t('history')}
              </button>

              <button
                onClick={handleNewScan}
                className="flex items-center gap-1.5 px-3.5 py-2 ml-3 text-xs font-bold rounded-xl bg-accent-color hover:bg-accent-hover text-white dark:text-app-bg transition-all duration-200 shadow-sm cursor-pointer active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('newScan')}
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              {/* National Cyber Crime Helpline 1930 */}
              <a
                href="tel:1930"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 transition-colors shadow-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20 group"
                title={t('cyberHelplineTooltip')}
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-md bg-red-600 text-white shrink-0 shadow-xs">
                  <PhoneCall className="w-3 h-3" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="font-mono font-bold tracking-tight text-xs text-red-900 dark:text-red-200">
                    1930
                  </span>
                  <span className="text-[9px] font-semibold tracking-wider text-red-600 dark:text-red-400 hidden xl:inline mt-0.5">
                    {t('cyberHelplineBadge')}
                  </span>
                </div>
              </a>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border-color bg-card-bg hover:bg-app-bg text-text-primary text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  aria-label={t('language')}
                >
                  <Globe className="w-4 h-4 text-accent-color shrink-0" />
                  <span className="font-medium text-xs">
                    {language === 'pa' ? 'ਪੰਜਾਬੀ' : language === 'hi' ? 'हिन्दी' : 'English'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {langDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setLangDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border-color bg-card-bg p-1.5 shadow-xl z-30 transition-all">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-text-secondary uppercase tracking-wider border-b border-border-color/50 mb-1">
                        {t('language')}
                      </div>
                      {[
                        { code: 'en', native: 'English', flag: 'EN' },
                        { code: 'hi', native: 'हिन्दी', flag: 'HI' },
                        { code: 'pa', native: 'ਪੰਜਾਬੀ', flag: 'PA' },
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setLanguage(item.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 text-left text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            language === item.code
                              ? 'bg-accent-color/15 text-accent-color font-bold'
                              : 'hover:bg-app-bg text-text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-border-color/40 text-text-secondary">
                              {item.flag}
                            </span>
                            <span>{item.native}</span>
                          </div>
                          {language === item.code && <Check className="w-3.5 h-3.5 text-accent-color" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-border-color hover:bg-app-bg text-text-secondary transition-colors duration-200 cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4.5 h-4.5 text-warning-color" />
                ) : (
                  <Moon className="w-4.5 h-4.5 text-text-secondary" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-border-color bg-app-bg text-text-primary hover:bg-border-color/50 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-md bg-btn-bg text-btn-text font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <span className="text-xs font-bold max-w-25 truncate hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border-color bg-card-bg p-1.5 shadow-xl z-20 transition-all">
                      <div className="px-3 py-2 border-b border-border-color mb-1">
                        <p className="text-xs font-bold text-text-primary truncate">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-danger-color hover:bg-danger-color/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}
                className="p-2.5 rounded-xl border border-border-color bg-card-bg/40 hover:bg-app-bg text-text-primary transition-all duration-200 cursor-pointer md:hidden active:scale-95"
                aria-label="Open History Log"
              >
                <History className="w-5 h-5 text-accent-color" />
              </button>
            </div>

          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isLeftDrawerOpen && (
          <div className="fixed top-18 bottom-0 left-0 right-0 z-40 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLeftDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 top-18"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              className="relative h-full w-80 bg-slate-950/90 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-border-color/20 text-slate-100 p-5 flex flex-col justify-between shadow-2xl z-40 overflow-hidden"
            >
              <div className="flex flex-col gap-4 overflow-hidden h-full">
                <div className="relative shrink-0">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={searchLeft}
                    onChange={(e) => setSearchLeft(e.target.value)}
                    placeholder={t('searchScansPlaceholder')}
                    className="w-full bg-slate-900/60 border border-border-color/20 text-xs text-white placeholder-slate-400 rounded-xl pl-9 pr-4 py-2 focus:border-accent-color/60 focus:ring-1 focus:ring-accent-color/20 focus:outline-none transition-all"
                  />
                </div>
                <div className="flex gap-1.5 py-1 border-b border-border-color/10 shrink-0 overflow-x-auto">
                  {[
                    { key: 'All', label: t('filterAll') },
                    { key: 'Scam', label: t('filterScam') },
                    { key: 'Safe', label: t('filterSafe') },
                    { key: 'Suspicious', label: t('filterSuspicious') },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilterLeft(tab.key)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 cursor-pointer ${
                        filterLeft === tab.key
                          ? 'bg-accent-color text-slate-950 font-extrabold'
                          : 'bg-slate-900/50 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1">
                  {history.length > 0 && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <span className="text-[9px] uppercase font-bold text-accent-color tracking-widest">Latest Scan</span>
                      <div
                        onClick={resumeLastScan}
                        className="group relative cursor-pointer overflow-hidden p-3 rounded-xl border border-border-color/20 bg-slate-900/50 hover:bg-slate-900 hover:border-accent-color/40 transition-all duration-300 shadow-sm"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-accent-color/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-xs font-semibold text-white truncate block">{history[0].filename}</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              {new Date(history[0].timestamp).toLocaleString()}
                            </span>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-accent-color group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-accent-color" />
                      Recent Uploads (Last 5)
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      {leftFilteredScans.filter((s) => s.filename && s.filename !== 'Direct Text Input').slice(0, 5).length === 0 ? (
                        <span className="text-[10px] text-slate-500 italic px-2">No matching uploads.</span>
                      ) : (
                        leftFilteredScans.filter((s) => s.filename && s.filename !== 'Direct Text Input').slice(0, 5).map((scan) => (
                          <div
                            key={scan.id}
                            onClick={() => selectScan(scan)}
                            className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-slate-900/40 border border-transparent hover:border-border-color/10 transition-all text-xs text-slate-300"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${
                                (scan.result?.riskScore ?? 0) >= 50
                                  ? 'bg-red-500'
                                  : (scan.result?.riskScore ?? 0) >= 20
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`} />
                              <span className="truncate">{scan.filename}</span>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                              Ready
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-accent-color" />
                      Saved Chats
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      {leftFilteredScans.filter((s) => s.chatHistory && s.chatHistory.length > 0).length === 0 ? (
                        <span className="text-[10px] text-slate-500 italic px-2">No matching chats.</span>
                      ) : (
                        leftFilteredScans.filter((s) => s.chatHistory && s.chatHistory.length > 0).map((scan) => (
                          <div
                            key={scan.id}
                            onClick={() => selectScan(scan)}
                            className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-slate-900/40 border border-transparent hover:border-border-color/10 transition-all text-xs text-slate-300"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <Sparkles className="w-3 h-3 text-accent-color shrink-0 animate-pulse" />
                              <span className="truncate">{scan.filename.split('.')[0]} Chat</span>
                            </div>
                            <span className="text-[9px] text-slate-400 shrink-0 font-mono">
                              {scan.chatHistory.length} msg
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-accent-color" />
                      Uploaded Images ({imageScans.length})
                    </h3>
                    {imageScans.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic px-2">No images uploaded.</span>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {imageScans.map((scan) => (
                          <ImageThumbnail
                            key={scan.id}
                            scan={scan}
                            onClick={() => {
                              setSelectedImage(scan);
                              setIsGalleryOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2.5 border-t border-border-color/10 pt-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-accent-color" />
                      Test History
                    </h3>
                    {templateScans.length > 0 && (
                      <div className="grid grid-cols-4 gap-1 text-center shrink-0 mb-2">
                        <div className="bg-slate-900/60 p-1 rounded-lg border border-border-color/10">
                          <span className="text-[8px] text-slate-400 block font-semibold uppercase">Total</span>
                          <span className="text-xs font-bold font-mono text-white">{testAnalytics.total}</span>
                        </div>
                        <div className="bg-slate-900/60 p-1 rounded-lg border border-emerald-500/10">
                          <span className="text-[8px] text-emerald-400 block font-semibold uppercase">Safe</span>
                          <span className="text-xs font-bold font-mono text-emerald-400">{testAnalytics.safe}</span>
                        </div>
                        <div className="bg-slate-900/60 p-1 rounded-lg border border-red-500/10">
                          <span className="text-[8px] text-red-400 block font-semibold uppercase">Scam</span>
                          <span className="text-xs font-bold font-mono text-red-400">{testAnalytics.scam}</span>
                        </div>
                        <div className="bg-slate-900/60 p-1 rounded-lg border border-amber-500/10">
                          <span className="text-[8px] text-amber-400 block font-semibold uppercase">Susp</span>
                          <span className="text-xs font-bold font-mono text-amber-400">{testAnalytics.suspicious}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      {templateScans.length === 0 ? (
                        <span className="text-[10px] text-slate-500 italic px-2">No templates tested yet.</span>
                      ) : (
                        templateScans.map((scan) => {
                          const risk = scan.result.riskScore;
                          let badge = "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
                          if (risk >= 50) badge = "bg-red-500/15 text-red-400 border border-red-500/20";
                          else if (risk >= 20) badge = "bg-amber-500/15 text-amber-400 border border-amber-500/20";

                          return (
                            <div
                              key={scan.id}
                              onClick={() => selectScan(scan)}
                              className="group flex flex-col p-2 bg-slate-900/30 hover:bg-slate-900/50 border border-border-color/10 rounded-xl cursor-pointer text-left transition-colors"
                            >
                              <span className="text-[10px] font-bold text-white truncate block">{scan.filename}</span>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[8px] text-slate-400">{new Date(scan.timestamp).toLocaleDateString()}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${badge}`}>{risk}%</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 border-t border-border-color/10 pt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-accent-color" />
                        History Log
                      </h3>
                      {history.length > 0 && (
                        <button
                          onClick={handleClearHistory}
                          className="text-[9px] text-danger-color hover:underline font-bold cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {leftFilteredScans.length === 0 ? (
                        <div className="text-center py-6 px-4 bg-slate-900/20 rounded-xl border border-border-color/10">
                          <span className="text-[10px] text-slate-400 block font-semibold">No activity yet</span>
                          <span className="text-[9px] text-slate-500 mt-1 block">Start a scan to fill the history log.</span>
                        </div>
                      ) : (
                        leftFilteredScans.map((scan) => (
                          <div
                            key={scan.id}
                            className="group flex items-center justify-between p-2 rounded-lg text-xs bg-slate-900/30 hover:bg-slate-900/60 border border-transparent hover:border-border-color/10 transition-all"
                          >
                            <div
                              onClick={() => selectScan(scan)}
                              className="flex flex-col min-w-0 pr-2 cursor-pointer grow text-left"
                            >
                              <span className="truncate font-semibold text-slate-200 group-hover:text-accent-color transition-colors">
                                {scan.filename}
                              </span>
                              <span className="text-[8px] text-slate-400/80 mt-0.5">
                                {new Date(scan.timestamp).toLocaleString()} - {scan.result.verdict} ({scan.result.riskScore}%)
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteScan(scan.id, scan.filename)}
                              className="p-1 rounded hover:bg-danger-color/10 text-slate-400 hover:text-danger-color opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                              aria-label="Delete scan history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
              <div className="border-t border-border-color/20 pt-4 mt-4 shrink-0 space-y-3">
                {/* Mobile Cyber Helpline 1930 */}
                <a
                  href="tel:1930"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-950/60 text-red-300 font-semibold text-xs transition-colors shadow-none"
                  title={t('cyberHelplineTooltip')}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0">
                      <PhoneCall className="w-3 h-3" />
                    </div>
                    <span>{t('cyberHelpline')}</span>
                  </div>
                  <span className="font-mono bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[11px]">1930</span>
                </a>

                {/* Mobile Language Switcher */}
                <div className="flex items-center justify-between p-1.5 rounded-xl border border-border-color/30 bg-slate-900/60 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 px-2">{t('language')}:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        language === 'en' ? 'bg-accent-color text-slate-950' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguage('hi')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        language === 'hi' ? 'bg-accent-color text-slate-950' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      हिन्दी
                    </button>
                    <button
                      onClick={() => setLanguage('pa')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        language === 'pa' ? 'bg-accent-color text-slate-950' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      ਪੰਜਾਬੀ
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-xl bg-accent-color text-slate-950 font-bold flex items-center justify-center uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{user.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-danger-color hover:bg-danger-color/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {isRightDrawerOpen && (
          <div className="fixed top-18 bottom-0 left-0 right-0 z-40 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRightDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 top-18"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              className="relative h-full w-96 bg-slate-950/90 dark:bg-slate-950/95 backdrop-blur-2xl border-l border-border-color/20 text-slate-100 p-5 flex flex-col justify-between shadow-2xl z-40 overflow-hidden"
            >
              <div className="flex flex-col gap-4 overflow-hidden h-full">
                <div className="flex items-center justify-between border-b border-border-color/20 pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-accent-color" />
                    <span className="font-bold text-base text-white">{t('history')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {history.length > 0 && (
                      <button
                        onClick={handleClearHistory}
                        className="text-[10px] text-danger-color hover:underline font-bold cursor-pointer"
                      >
                        {t('clearHistoryBtn')}
                      </button>
                    )}
                    <button
                      onClick={() => setIsRightDrawerOpen(false)}
                      className="p-1 rounded-lg border border-border-color/20 text-slate-400 hover:text-white cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="relative shrink-0">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={searchRight}
                    onChange={(e) => setSearchRight(e.target.value)}
                    placeholder={t('searchScansPlaceholder')}
                    className="w-full bg-slate-900/60 border border-border-color/20 text-xs text-white placeholder-slate-400 rounded-xl pl-9 pr-4 py-2 focus:border-accent-color/60 focus:ring-1 focus:ring-accent-color/20 focus:outline-none transition-all"
                  />
                </div>
                <div className="flex gap-1.5 py-1 border-b border-border-color/10 shrink-0 overflow-x-auto">
                  {[
                    { key: 'All', label: t('filterAll') },
                    { key: 'Scam', label: t('filterScam') },
                    { key: 'Safe', label: t('filterSafe') },
                    { key: 'Suspicious', label: t('filterSuspicious') },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilterRight(tab.key)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 cursor-pointer ${
                        filterRight === tab.key
                          ? 'bg-accent-color text-slate-950 font-extrabold'
                          : 'bg-slate-900/50 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
                  {rightFilteredScans.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center h-64 text-center p-6 bg-slate-900/20 rounded-2xl border border-border-color/10"
                    >
                      <ShieldAlert className="w-8 h-8 mb-2 text-slate-500 opacity-60" />
                      <span className="text-xs font-bold text-white block">{t('noScansFound')}</span>
                    </motion.div>
                  ) : (
                    rightFilteredScans.map((scan) => {
                      const risk = scan.result.riskScore;
                      let badge = "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
                      if (risk >= 50) badge = "bg-red-500/15 text-red-400 border border-red-500/20";
                      else if (risk >= 20) badge = "bg-amber-500/15 text-amber-400 border border-amber-500/20";

                      return (
                        <motion.div
                          key={scan.id}
                          layout
                          onClick={() => selectScan(scan)}
                          className="group flex flex-col gap-2 p-3.5 rounded-xl border border-border-color/20 bg-slate-900/40 hover:border-accent-color/40 transition-all cursor-pointer text-left"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold text-white truncate pr-1 group-hover:text-accent-color transition-colors">
                              {scan.filename}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${badge}`}>
                              {scan.result.verdict} ({risk}%)
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{new Date(scan.timestamp).toLocaleString()}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteScan(scan.id, scan.filename);
                              }}
                              className="p-1 rounded hover:bg-danger-color/10 text-slate-400 hover:text-danger-color opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              aria-label="Delete scan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
                <div className="border-t border-border-color/20 pt-3 mt-1 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
                  <span>Total scans: {rightFilteredScans.length}</span>
                  <span className="flex items-center gap-1 font-semibold text-accent-color">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-color animate-pulse" />
                    Engine Active
                  </span>
                </div>

              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      <AnimatePresence>
        {isGalleryOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <div
              className="absolute inset-0 z-10"
              onClick={() => setIsGalleryOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-card-bg border border-border-color rounded-2xl p-6 shadow-2xl z-20 relative flex flex-col max-h-[85vh] overflow-hidden card-premium"
            >
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl border border-border-color hover:bg-app-bg text-text-secondary cursor-pointer hover:text-text-primary transition-colors z-30"
                aria-label="Close gallery"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mb-6 flex items-center gap-2 shrink-0">
                <ImageIcon className="w-5 h-5 text-accent-color" />
                <h2 className="text-base font-bold text-text-primary">Uploaded Screenshots Gallery ({imageScans.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1 grow">
                {imageScans.map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => {
                      selectScan(scan);
                      setIsGalleryOpen(false);
                      setIsLeftDrawerOpen(false);
                    }}
                    className={`group p-3 bg-slate-900/50 hover:bg-slate-900 border transition-all rounded-xl cursor-pointer flex flex-col text-left overflow-hidden relative ${
                      selectedImage && selectedImage.id === scan.id
                        ? 'border-accent-color/60'
                        : 'border-border-color/20 hover:border-accent-color/30'
                    }`}
                  >
                    <div className="h-40 w-full rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-accent-color mb-2 overflow-hidden relative shrink-0">
                      {scan.preview ? (
                        <img
                          src={scan.preview}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-accent-color/60" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white truncate block">
                      {scan.filename}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-1">
                      {new Date(scan.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="fixed bottom-5 right-5 z-60 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`pointer-events-auto p-4 rounded-xl border ${styles.border} ${styles.bg} shadow-lg flex items-start gap-3 backdrop-blur-md`}
              >
                {styles.icon}
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${styles.text}`}>
                    {toast.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}