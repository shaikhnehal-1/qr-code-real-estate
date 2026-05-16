import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Filter, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { Project, ProjectStatus } from '../types';
import { cn } from '../lib/utils';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects();
        if (data) setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = filter === 'ALL' 
    ? projects 
    : projects.filter(p => p.status === filter);

  const stats = [
    { label: 'Completed', count: projects.filter(p => p.status === ProjectStatus.COMPLETED).length },
    { label: 'Ongoing', count: projects.filter(p => p.status === ProjectStatus.ONGOING).length },
    { label: 'Upcoming', count: projects.filter(p => p.status === ProjectStatus.UPCOMING).length },
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-brand-950 text-white">
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070" 
            alt="Real Estate"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <p className="text-accent-400 text-sm uppercase tracking-[0.4em] font-bold mb-4">
              Pioneering Luxury Real Estate
            </p>
            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[0.88]">
              FUTURE<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-indigo-200 uppercase">Residences</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-lg mb-10 max-w-lg leading-relaxed">
              Curating architectural masterpieces that redefine urban living. Explore our portfolio of premium spaces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/enquiry"
                className="bg-accent-600 text-white px-10 py-5 rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-accent-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent-600/20"
              >
                Enquire Now <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-20">
        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-2xl border border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="flex flex-col text-left">
            <span className="text-3xl md:text-5xl font-extrabold text-brand-950 tracking-tighter">{projects.length}</span>
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-2 whitespace-nowrap">Active Projects</span>
          </div>
          {stats.map((s, idx) => (
            <div key={idx} className="flex flex-col text-left border-l border-slate-100 pl-6 md:pl-12">
              <span className="text-3xl md:text-5xl font-extrabold text-brand-900 tracking-tighter opacity-80">{s.count}</span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-2">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 mt-20 md:mt-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Project Portfolio</h2>
            <div className="h-1 w-20 bg-accent-600 rounded-full" />
          </div>
          
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar max-w-full -mx-4 px-4 md:mx-0">
            {['ALL', ...Object.values(ProjectStatus)].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={cn(
                  "px-6 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap",
                  filter === status 
                    ? "bg-white text-brand-950 shadow-md" 
                    : "text-slate-500 hover:text-brand-950"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse bg-slate-200 rounded-[2.5rem] h-[500px]" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200 hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-8">
                  <img 
                    src={project.images[0] || "https://images.unsplash.com/photo-1545324418-f1d3ac59749c?auto=format&fit=crop&q=80&w=800"} 
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <span className={cn(
                      "px-5 py-2 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold text-white backdrop-blur-md",
                      project.status === ProjectStatus.ONGOING ? "bg-accent-600/90" : 
                      project.status === ProjectStatus.COMPLETED ? "bg-slate-900/90" : "bg-emerald-600/90"
                    )}>
                      {project.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight mb-2 group-hover:text-accent-600 transition-colors">{project.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{project.location}</span>
                      <span className="opacity-20">•</span>
                      <span>{project.type} Building</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-8">{project.description}</p>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-slate-50">
                   <div className="flex flex-col">
                     <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Investment from</span>
                     <span className="text-xl font-bold italic text-accent-600">₹ {project.status === ProjectStatus.UPCOMING ? 'Coming Soon' : '1.2 Cr+'}</span>
                   </div>
                   <Link to="/enquiry" className="w-full sm:w-auto bg-brand-950 text-white px-6 py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-accent-600 transition-colors">
                      Express Interest <ChevronRight className="w-3 h-3" />
                   </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No curated projects found.</p>
          </div>
        )}
      </section>
    </div>
  );
}
