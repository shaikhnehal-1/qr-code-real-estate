import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Calculator, Send } from 'lucide-react';
import { leadService } from '../services/leadService';
import { projectService } from '../services/projectService';
import { Specification, Purpose, Profession, Project } from '../types';
import { formatRupees, numberToWords, cn } from '../lib/utils';

export default function EnquiryForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    projectName: "Any/All/I don't know",
    specifications: Specification.BHK1,
    budget: '',
    purpose: Purpose.INVESTMENT,
    profession: Profession.CORPORATE,
    location: '',
    ageBracket: '25-35',
    preferredTimeline: '0-3 Months'
  });

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await projectService.getProjects();
      if (data) setProjects(data);
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const budgetNum = parseFloat(formData.budget.replace(/,/g, ''));
      await leadService.submitLead({
        ...formData,
        budget: isNaN(budgetNum) ? 0 : budgetNum,
        specifications: formData.specifications as Specification,
        purpose: formData.purpose as Purpose,
        profession: formData.profession as Profession,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Connection failed";
      alert(`Submission failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-brand-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100"
        >
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Interest Logged</h2>
          <p className="text-slate-500 mb-10 leading-relaxed text-sm">
            Your enquiry for <span className="font-bold text-brand-950">{formData.projectName}</span> has been synced. A senior development consultant will contact you on <span className="font-bold text-brand-950">{formData.contact}</span>.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full bg-accent-600 text-white py-5 rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-accent-700 transition-all shadow-lg shadow-accent-600/20 active:scale-95"
          >
            Finished
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24 px-4 bg-brand-50">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-16 px-4 md:px-6 gap-6">
          <div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-slate-400 font-bold mb-2"
            >
              Official Intake
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tighter"
            >
              Enquiry <span className="text-accent-600">Form</span>
            </motion.h1>
          </div>
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[9px] md:text-[10px] font-bold rounded-full border border-emerald-100">
            LIVE ANALYTICS ACTIVE
          </div>
        </header>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} 
          className="space-y-12 md:space-y-16 bg-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-10 md:p-20 shadow-xl border border-slate-100"
        >
          {/* Section: Basic Info */}
          <div className="space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <span className="text-3xl font-black text-slate-100 italic">01</span>
              <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-400">Customer Identity</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="group relative">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block group-focus-within:text-accent-600 transition-colors">Full Name</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Amit Sharma"
                  className="w-full border-b-2 border-slate-100 py-3 focus:border-accent-600 outline-none text-brand-950 font-medium bg-transparent transition-all placeholder:text-slate-200"
                />
              </div>
              <div className="group relative">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block group-focus-within:text-accent-600 transition-colors">Contact Number</label>
                <input 
                  required
                  type="tel" 
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full border-b-2 border-slate-100 py-3 focus:border-accent-600 outline-none text-brand-950 font-medium bg-transparent transition-all placeholder:text-slate-200"
                />
              </div>
            </div>
            
            <div className="group relative max-w-md">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block group-focus-within:text-accent-600 transition-colors">Email Address (Optional)</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="amit@example.com"
                className="w-full border-b-2 border-slate-100 py-3 focus:border-accent-600 outline-none text-brand-950 font-medium bg-transparent transition-all placeholder:text-slate-200"
              />
            </div>
          </div>

          {/* Section: Project Preference */}
          <div className="space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <span className="text-3xl font-black text-slate-100 italic">02</span>
              <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-400">Project Selection</h3>
            </div>

            <div className="flex bg-slate-50 p-1 rounded-2xl overflow-x-auto no-scrollbar gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, projectName: "Any/All/I don't know" }))}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[9px] font-bold tracking-widest uppercase transition-all whitespace-nowrap",
                    formData.projectName === "Any/All/I don't know"
                      ? "bg-accent-600 text-white"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Any / All
                </button>
                {projects.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, projectName: p.name }))}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[9px] font-bold tracking-widest uppercase transition-all whitespace-nowrap",
                      formData.projectName === p.name
                        ? "bg-accent-600 text-white"
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Specifications</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(Specification).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, specifications: s }))}
                      className={cn(
                        "p-3 text-center rounded-xl text-[10px] font-bold uppercase transition-all border",
                        formData.specifications === s
                          ? "bg-accent-50 border-accent-600 text-accent-700 font-black"
                          : "bg-slate-50 border-slate-100 text-slate-400"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Purpose</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(Purpose).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, purpose: p }))}
                      className={cn(
                        "p-3 text-center rounded-xl text-[10px] font-bold uppercase transition-all border",
                        formData.purpose === p
                          ? "bg-accent-50 border-accent-600 text-accent-700 font-black"
                          : "bg-slate-50 border-slate-100 text-slate-400"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Budget & Demographic */}
          <div className="space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <span className="text-3xl font-black text-slate-100 italic">03</span>
              <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-400">Logistics & Demographics</h3>
            </div>

            <div className="group relative">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block group-focus-within:text-accent-600">Budget Range (INR)</label>
              <input 
                required
                type="number" 
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 15000000"
                className="w-full border-b-2 border-slate-100 py-3 focus:border-accent-600 outline-none text-2xl font-mono font-bold text-brand-950 bg-transparent transition-all"
              />
              <AnimatePresence>
                {formData.budget && (
                  <motion.p 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-[11px] text-accent-600 font-bold italic mt-2 uppercase tracking-tight"
                  >
                    {numberToWords(Number(formData.budget))}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="group relative border-b border-slate-100 pb-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Work Profession</label>
                <select 
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm font-bold text-brand-950 outline-none appearance-none cursor-pointer"
                >
                  {Object.values(Profession).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="group relative">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block group-focus-within:text-accent-600">Current Location</label>
                <input 
                  required
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. South Delhi"
                  className="w-full border-b-2 border-slate-100 py-3 focus:border-accent-600 outline-none text-sm font-bold text-brand-950 bg-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="group relative border-b border-slate-100 pb-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Age Bracket</label>
                <select 
                  name="ageBracket"
                  value={formData.ageBracket}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm font-bold text-brand-950 outline-none"
                >
                  <option value="Under 25">Under 25</option>
                  <option value="25-35">25-35</option>
                  <option value="35-50">35-50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
              <div className="group relative border-b border-slate-100 pb-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Preferred Timeline</label>
                <select 
                  name="preferredTimeline"
                  value={formData.preferredTimeline}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm font-bold text-brand-950 outline-none"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="0-3 Months">0-3 Months</option>
                  <option value="3-6 Months">3-6 Months</option>
                  <option value="Just Exploring">Just Exploring</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-950 text-white py-6 rounded-2xl flex items-center justify-center gap-4 uppercase tracking-[0.4em] font-black hover:bg-accent-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'SYNCING DATA...' : 'SUBMIT ENQUIRY'}
            {!loading && <Send className="w-5 h-5" />}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
