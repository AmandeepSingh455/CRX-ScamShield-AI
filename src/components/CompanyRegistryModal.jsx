import React, { useState, useMemo } from "react";
import { COMPANIES_DATABASE } from "../data/companiesData";
import {
  Building2,
  Search,
  X,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CompanyRegistryModal({ isOpen, onClose, onSelectCompany }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [copiedCin, setCopiedCin] = useState(null);

  const sectors = useMemo(() => {
    const set = new Set(COMPANIES_DATABASE.map((c) => c.sector));
    return ["All", ...Array.from(set).sort()];
  }, []);

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return COMPANIES_DATABASE.filter((c) => {
      const matchesSector =
        selectedSector === "All" || c.sector === selectedSector;
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.cin.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(q)));
      return matchesSector && matchesSearch;
    });
  }, [searchQuery, selectedSector]);

  const handleCopyCIN = (cin) => {
    navigator.clipboard.writeText(cin);
    setCopiedCin(cin);
    setTimeout(() => setCopiedCin(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-50 w-full max-w-4xl max-h-[88vh] rounded-2xl border border-border-color bg-card-bg shadow-2xl flex flex-col overflow-hidden text-left"
      >
        {/* Header */}
        <div className="p-5 border-b border-border-color flex items-center justify-between bg-card-bg/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-color/15 text-accent-color flex items-center justify-center border border-accent-color/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-primary">
                  MCA 1,000 Registered Companies & CIN Directory
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-color/10 text-accent-color border border-accent-color/20">
                  {COMPANIES_DATABASE.length} Enterprises
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Official Ministry of Corporate Affairs 21-digit Corporate Identification Numbers & Verified Domains
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Sector Bar */}
        <div className="p-4 border-b border-border-color bg-app-bg/50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, 21-digit CIN, domain (e.g. tcs.com), city or sector..."
              className="w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-card-bg text-text-primary focus:border-accent-color focus:ring-1 focus:ring-accent-color transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {sectors.slice(0, 8).map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`text-[11px] font-semibold px-3 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                  selectedSector === sec
                    ? "bg-accent-color text-slate-950 font-bold"
                    : "bg-card-bg border border-border-color text-text-secondary hover:text-text-primary"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Company List */}
        <div className="p-4 overflow-y-auto space-y-3 max-h-[58vh]">
          {filteredCompanies.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-xs">
              No matching companies or CIN found in the directory.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCompanies.slice(0, 60).map((company) => (
                <div
                  key={company.cin}
                  className="p-3.5 rounded-xl border border-border-color bg-card-bg hover:border-accent-color/40 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-text-primary group-hover:text-accent-color transition-colors leading-snug">
                        {company.name}
                      </h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                        {company.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-text-secondary mt-1">
                      {company.sector} &bull; {company.city}, {company.state}
                    </p>

                    <div className="mt-2.5 p-2 rounded-lg bg-app-bg border border-border-color/60 flex items-center justify-between">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[8px] font-bold text-text-secondary uppercase tracking-wider">
                          MCA CIN (21 Digits)
                        </span>
                        <span className="text-[11px] font-mono font-bold text-accent-color truncate">
                          {company.cin}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCIN(company.cin)}
                        className="p-1.5 rounded-md hover:bg-card-bg text-text-secondary hover:text-accent-color transition-colors shrink-0 cursor-pointer"
                        title="Copy CIN"
                      >
                        {copiedCin === company.cin ? (
                          <Check className="w-3.5 h-3.5 text-accent-color" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border-color/40 flex items-center justify-between text-[10px]">
                    <span className="text-text-secondary font-mono">
                      🌐 {company.domain}
                    </span>
                    {onSelectCompany && (
                      <button
                        onClick={() => {
                          onSelectCompany(company);
                          onClose();
                        }}
                        className="text-accent-color font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Test in Scanner
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-color bg-card-bg/95 flex items-center justify-between text-xs text-text-secondary">
          <span>
            Showing {Math.min(filteredCompanies.length, 60)} of {filteredCompanies.length} matches
          </span>
          <span className="text-[10px]">
            National Cyber Crime Helpline: <a href="tel:1930" className="text-red-500 font-bold underline">1930</a>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
