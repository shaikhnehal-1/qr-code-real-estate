import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Building, Plus, Trash2, LogOut, 
  Download, QrCode, X, Search, FileText, 
  MapPin, Check, PlusCircle, Upload, Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../lib/firebase';
import { leadService } from '../services/leadService';
import { projectService } from '../services/projectService';
import { Lead, Project, ProjectStatus } from '../types';
import { cn, formatRupees } from '../lib/utils';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'projects'>('leads');
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [deletingItem, setDeletingItem] = useState<{id: string, type: 'lead' | 'project'} | null>(null);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const navigate = useNavigate();

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: ProjectStatus.ONGOING,
    location: '',
    type: 'Residential',
    images: [] as string[]
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        fetchData();
      } else {
        navigate('/admin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsData, projectsData] = await Promise.all([
        leadService.getLeads(),
        projectService.getProjects()
      ]);
      setLeads(leadsData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const seedSampleLeads = async () => {
    setLoading(true);
    try {
      const sampleLeads = [
        {
          name: "Rajesh Kumar",
          contact: "9876543210",
          email: "rajesh@example.com",
          projectName: "Estate Heights",
          specifications: "3 BHK" as any,
          budget: 15000000,
          purpose: "Self Use" as any,
          profession: "Business" as any,
          location: "South Delhi",
          ageBracket: "35-50",
          preferredTimeline: "0-3 Months"
        },
        {
          name: "Priya Singh",
          contact: "9123456789",
          email: "priya@example.com",
          projectName: "Emerald Garden",
          specifications: "2 BHK" as any,
          budget: 8500000,
          purpose: "Investment" as any,
          profession: "Corporate" as any,
          location: "Gurgaon",
          ageBracket: "25-35",
          preferredTimeline: "Immediate"
        }
      ];

      for (const lead of sampleLeads) {
        await leadService.submitLead(lead);
      }
      const data = await leadService.getLeads();
      if (data) setLeads(data);
      alert("Sample leads seeded successfully!");
    } catch (error) {
      console.error("Seeding error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Starting upload for file:", file.name, "Size:", file.size);
    setUploading(true);
    try {
      // Create a unique name to prevent collisions
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `project-images/${fileName}`);
      
      console.log("Storage reference created at path:", storageRef.fullPath);
      
      const snapshot = await uploadBytes(storageRef, file);
      console.log("Upload successful, snapshot:", snapshot);
      
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL obtained:", downloadURL);
      
      setNewProject(prev => {
        const updatedImages = [...prev.images, downloadURL];
        console.log("Updating project state with new image list:", updatedImages);
        return {
          ...prev,
          images: updatedImages
        };
      });
      
      // Clear the input so the same file can be selected again
      e.target.value = '';
    } catch (error: any) {
      console.error("Critical Upload Error:", error);
      let msg = "Image upload failed. ";
      
      if (error.code === 'storage/unauthorized') {
        msg += "\n\n1. Go to Firebase Console > Storage > Rules.\n2. Set rules to allow authenticated users (see storage.rules file in project).\n3. Make sure Storage is enabled for this project.";
      } else if (error.code === 'storage/canceled') {
        msg += "Upload was canceled.";
      } else if (error.message?.includes('CORS')) {
        msg += "\n\nCORS Error: You may need to configure CORS for your bucket using gsutil. See cors.json in project.";
      } else {
        msg += error.message || "Unknown error occurred.";
      }
      
      alert(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectService.addProject({
        ...newProject,
        images: newProject.images.filter(img => img.trim() !== '')
      });
      setShowAddProject(false);
      fetchData();
    } catch (error) {
      alert("Failed to add project");
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      setLoading(true);
      await projectService.deleteProject(id);
      await fetchData();
      setNotification({ msg: "Project deleted successfully", type: 'success' });
    } catch (error) {
      console.error("Delete project error:", error);
      setNotification({ msg: "Failed to delete project", type: 'error' });
    } finally {
      setLoading(false);
      setDeletingItem(null);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      setLoading(true);
      await leadService.deleteLead(id);
      await fetchData();
      setNotification({ msg: "Lead deleted successfully", type: 'success' });
    } catch (error) {
      console.error("Delete lead error:", error);
      setNotification({ msg: "Failed to delete lead", type: 'error' });
    } finally {
      setLoading(false);
      setDeletingItem(null);
    }
  };

  const exportLeadsToCSV = () => {
    const headers = ["Name", "Contact", "Email", "Project", "Specifications", "Budget", "Purpose", "Profession", "Location", "Date"];
    const rows = leads.map(l => [
      l.name, l.contact, l.email || 'N/A', l.projectName, l.specifications, 
      l.budget, l.purpose, l.profession, l.location, 
      new Date(l.createdAt?.seconds * 1000).toLocaleDateString()
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.contact.includes(searchTerm) ||
    l.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const seedSampleData = async () => {
    const samples = [
      {
        name: "Emerald Heights",
        description: "Experience luxury living in the heart of the city with our premium 3 & 4 BHK apartments featuring world-class amenities.",
        status: ProjectStatus.ONGOING,
        location: "Gurugram, Sector 45",
        type: "Residential",
        images: ["https://images.unsplash.com/photo-1545324418-f1d3ac59749c?auto=format&fit=crop&q=80&w=800"]
      },
      {
        name: "Zenith Business Tower",
        description: "State-of-the-art commercial spaces designed for the modern-day entrepreneur. Sustainable design and prime location.",
        status: ProjectStatus.UPCOMING,
        location: "Mumbai, BKC",
        type: "Commercial",
        images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"]
      },
      {
        name: "The Royal Orchid",
        description: "Our flagship luxury project, now completed and ready for move-in. award-winning architecture and lush green surroundings.",
        status: ProjectStatus.COMPLETED,
        location: "Bangalore, Indiranagar",
        type: "Residential",
        images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"]
      }
    ];

    for (const s of samples) {
      await projectService.addProject(s);
    }
    fetchData();
  };

  return (
    <div className="min-h-screen bg-brand-50 pb-20">

      <header className="bg-white border-b border-brand-900/5 px-4 sticky top-16 md:top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center h-auto lg:h-20 py-6 md:py-4 gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            <h1 className="text-lg md:text-xl font-sans font-bold text-brand-950 tracking-tight whitespace-nowrap">Management Console</h1>
            <div className="flex bg-brand-100 rounded-xl p-1 w-full sm:w-auto">
              <button 
                onClick={() => setActiveTab('leads')}
                className={cn(
                  "flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2",
                  activeTab === 'leads' ? "bg-white shadow-sm text-brand-950" : "text-brand-900/40 hover:text-brand-900/60"
                )}
              >
                <Users className="w-3.5 h-3.5" /> Leads
              </button>
              <button 
                onClick={() => setActiveTab('projects')}
                className={cn(
                  "flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2",
                  activeTab === 'projects' ? "bg-white shadow-sm text-brand-950" : "text-brand-900/40 hover:text-brand-900/60"
                )}
              >
                <Building className="w-3.5 h-3.5" /> Projects
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-4">
            <div className="flex flex-col items-start lg:items-end">
              <span className="text-[9px] md:text-[10px] font-bold text-brand-950 uppercase tracking-widest">{user?.email}</span>
              <span className="text-[8px] md:text-[9px] text-accent-600 font-bold uppercase">Admin Session</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowQR(true)}
                className="p-3 bg-brand-50 rounded-xl hover:bg-brand-100 text-brand-900/60 transition-all border border-brand-900/10"
                title="Generate Enquiry QR"
              >
                <QrCode className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-3 bg-red-50 rounded-xl hover:bg-red-100 text-red-500 transition-all border border-red-100"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-10">
        <AnimatePresence mode="wait">
          {activeTab === 'leads' ? (
            <motion.div 
              key="leads"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-900/20" />
                  <input 
                    type="text" 
                    placeholder="Search by name, contact or project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-brand-900/10 rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-400/5 transition-all text-sm"
                  />
                </div>
                <button 
                  onClick={exportLeadsToCSV}
                  className="bg-brand-950 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-900 active:scale-95 transition-all w-full md:w-auto justify-center shadow-lg shadow-brand-950/10"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>

              <div className="bg-white md:bg-white rounded-[2rem] border border-brand-900/5 shadow-xl overflow-hidden">
                {/* Mobile Leads View */}
                <div className="md:hidden divide-y divide-brand-900/5">
                  {filteredLeads.map(lead => (
                    <div key={lead.id} className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-sans text-base font-bold text-brand-950">{lead.name}</span>
                          <span className="text-xs text-brand-900/50">{lead.contact}</span>
                        </div>
                        <button 
                          onClick={() => lead.id && setDeletingItem({ id: lead.id, type: 'lead' })}
                          className="p-2 text-red-500 bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="bg-brand-50 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold">
                          <span className="text-slate-400 tracking-widest">Project</span>
                          <span className="text-brand-950">{lead.projectName}</span>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold">
                          <span className="text-slate-400 tracking-widest">Specs</span>
                          <span className="text-accent-600">{lead.specifications}</span>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold">
                          <span className="text-slate-400 tracking-widest">Budget</span>
                          <span className="text-accent-600">{formatRupees(lead.budget)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                         <span className="text-[9px] px-2 py-1 bg-brand-100 text-brand-900 rounded-lg font-bold uppercase tracking-widest">{lead.profession}</span>
                         <span className="text-[9px] px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase tracking-widest">{lead.ageBracket}</span>
                         <span className="text-[9px] px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-bold uppercase tracking-widest">{lead.preferredTimeline}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-brand-900/50 font-bold uppercase tracking-widest">
                        <MapPin className="w-3.5 h-3.5 text-accent-400" />
                        {lead.location}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Leads View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-50 border-b border-brand-900/5">
                        <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-brand-950 opacity-40">Contact Info</th>
                        <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-brand-950 opacity-40">Interest</th>
                        <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-brand-950 opacity-40">Profile</th>
                        <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-brand-950 opacity-40">Location</th>
                        <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-brand-950 opacity-40 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      {filteredLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-brand-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-sans text-base font-bold text-brand-950">{lead.name}</span>
                              <span className="text-xs text-brand-900/50 mt-1">{lead.contact}</span>
                              {lead.email && <span className="text-[10px] text-brand-900/40 italic mt-0.5">{lead.email}</span>}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-brand-950">{lead.projectName}</span>
                              <span className="text-[10px] uppercase tracking-wider text-accent-600 font-bold mt-1.5">{lead.specifications} • {formatRupees(lead.budget)}</span>
                              <span className="text-[11px] text-brand-900/50 mt-1 italic">{lead.purpose}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-[10px] px-2 py-1 bg-brand-100 text-brand-900 rounded-lg inline-block self-start font-bold uppercase tracking-widest mb-2">{lead.profession}</span>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] text-brand-900/60 font-medium">Age: {lead.ageBracket}</span>
                                <span className="text-[11px] text-brand-900/60 font-medium">Timeline: {lead.preferredTimeline}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-1.5 text-xs text-brand-900/50 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-accent-400" />
                              {lead.location}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button 
                              onClick={() => lead.id && setDeletingItem({ id: lead.id, type: 'lead' })}
                              className="p-2.5 text-brand-900/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredLeads.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-brand-900/20" />
                    </div>
                    <p className="text-brand-900/40 font-sans text-lg mb-6">No leads match your search criteria.</p>
                    <button 
                      onClick={seedSampleLeads}
                      className="text-[10px] uppercase tracking-widest font-bold text-brand-950 border-2 border-brand-950 px-8 py-3 rounded-full hover:bg-brand-950 hover:text-white transition-all shadow-sm"
                    >
                      Seed Sample Leads
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-center md:justify-end">
                <button 
                  onClick={() => setShowAddProject(true)}
                  className="w-full md:w-auto bg-accent-600 text-white px-8 py-5 rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-accent-700 shadow-lg shadow-accent-600/20 active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Add Masterpiece
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map(project => (
                  <div key={project.id} className="bg-white rounded-[2rem] overflow-hidden border border-brand-900/5 shadow-xl group">
                    <div className="aspect-video relative overflow-hidden bg-brand-100">
                      <img 
                        src={project.images[0] || "https://images.unsplash.com/photo-1545324418-f1d3ac59749c?auto=format&fit=crop&q=80&w=800"} 
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] tracking-widest font-bold uppercase shadow-sm">
                        {project.status}
                      </div>
                      <button 
                        onClick={() => project.id && setDeletingItem({ id: project.id, type: 'project' })}
                        className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full transition-all hover:bg-red-100 shadow-sm z-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-sans font-bold text-brand-950 tracking-tight">{project.name}</h3>
                        <span className="text-[10px] text-accent-600 font-bold uppercase tracking-widest px-2 py-0.5 bg-accent-50 rounded-lg">{project.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-brand-900/40 mb-4 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-accent-400" />
                        {project.location}
                      </div>
                      <p className="text-[11px] text-brand-900/60 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-full py-20 bg-white rounded-[2rem] border border-dashed border-brand-900/10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-6">
                      <Building className="w-8 h-8 text-brand-900/20" />
                    </div>
                    <p className="text-brand-900/40 font-sans text-lg mb-8">Your portfolio is empty.</p>
                    <button 
                      onClick={seedSampleData}
                      className="text-[10px] uppercase tracking-widest font-bold text-brand-950 border-2 border-brand-950 px-8 py-3 rounded-full hover:bg-brand-950 hover:text-white transition-all shadow-sm"
                    >
                      Load Sample Projects
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-md" onClick={() => setShowQR(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-[3rem] p-10 md:p-12 max-w-sm w-full text-center shadow-2xl border border-brand-900/5"
          >
            <button onClick={() => setShowQR(false)} className="absolute top-8 right-8 p-2 hover:bg-brand-50 rounded-full transition-colors group">
              <X className="w-5 h-5 text-brand-900/40 group-hover:text-brand-950" />
            </button>
            <h3 className="text-2xl font-sans font-bold text-brand-950 tracking-tight mb-2">Registration QR</h3>
            <p className="text-brand-900/40 text-xs mb-8 tracking-wide">Customers can scan this to land on the enquiry form immediately.</p>
            
            <div className="bg-brand-50 p-10 rounded-[2rem] aspect-square flex items-center justify-center mb-8 mx-auto border border-brand-900/5">
              <QRCodeSVG 
                value={`${window.location.origin}/enquiry`} 
                size={220}
                includeMargin={false}
                className="w-full h-full"
              />
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] text-brand-900/30 uppercase tracking-[0.2em] font-bold leading-relaxed">
                Scan to preview form on mobile
              </p>
              <div className="inline-block px-3 py-1 bg-brand-100 rounded-lg">
                <span className="text-[10px] font-mono text-brand-950">{window.location.origin}/enquiry</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Project Modal */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold uppercase tracking-widest text-[10px]",
              notification.type === 'success' ? "bg-brand-950 text-white" : "bg-red-500 text-white"
            )}
          >
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={() => setDeletingItem(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border border-brand-900/5"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-sans font-bold text-brand-950 tracking-tight mb-2">Are you sure?</h3>
            <p className="text-brand-900/40 text-xs mb-8">This action cannot be undone. The {deletingItem.type} will be permanently removed.</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setDeletingItem(null)}
                className="flex-1 px-6 py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold text-brand-950 bg-brand-50 hover:bg-brand-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => deletingItem.id && (deletingItem.type === 'lead' ? handleDeleteLead(deletingItem.id) : handleDeleteProject(deletingItem.id))}
                className="flex-1 px-6 py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-brand-950/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-6 sm:p-8 md:p-12 max-w-2xl w-full shadow-2xl my-auto border border-brand-900/5 relative"
          >
            <button onClick={() => setShowAddProject(false)} className="absolute top-6 right-6 p-2 hover:bg-brand-50 rounded-full transition-colors group">
              <X className="w-5 h-5 text-brand-900/40 group-hover:text-brand-950" />
            </button>
            <h3 className="text-2xl md:text-3xl font-sans font-bold text-brand-950 tracking-tight mb-8">Add New Project</h3>
            
            <form onSubmit={handleAddProject} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-900/40 ml-4">Project Name</label>
                  <input 
                    required
                    type="text" 
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="E.g. Emerald Heights"
                    className="w-full bg-brand-50 border-transparent focus:border-accent-400/50 focus:bg-white focus:ring-4 focus:ring-accent-400/5 rounded-2xl px-6 py-4 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-900/40 ml-4">Location</label>
                  <input 
                    required
                    type="text" 
                    value={newProject.location}
                    onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                    placeholder="E.g. South Delhi, India"
                    className="w-full bg-brand-50 border-transparent focus:border-accent-400/50 focus:bg-white focus:ring-4 focus:ring-accent-400/5 rounded-2xl px-6 py-4 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-900/40 ml-4">Status</label>
                  <select 
                    value={newProject.status}
                    onChange={(e) => setNewProject({...newProject, status: e.target.value as ProjectStatus})}
                    className="w-full bg-brand-50 focus:bg-white focus:ring-4 focus:ring-accent-400/5 border-transparent focus:border-accent-400/50 rounded-2xl px-6 py-4 outline-none cursor-pointer transition-all appearance-none"
                  >
                    {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-900/40 ml-4">Type</label>
                  <select 
                    value={newProject.type}
                    onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                    className="w-full bg-brand-50 focus:bg-white focus:ring-4 focus:ring-accent-400/5 border-transparent focus:border-accent-400/50 rounded-2xl px-6 py-4 outline-none cursor-pointer transition-all appearance-none"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Plotting">Plotting</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-900/40 ml-4">Project Photos</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {newProject.images.map((img, idx) => (
                    <div key={idx} className="aspect-video relative rounded-2xl overflow-hidden border border-brand-900/10 group bg-brand-50">
                      <img 
                        src={img} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).parentElement?.classList.add('bg-red-50');
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none opacity-0 [.bg-red-50_&]:opacity-100 transition-opacity">
                        <X className="w-6 h-6 text-red-500 mb-1" />
                        <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">Broken Image Link</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setNewProject(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== idx)
                        }))}
                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center [.bg-red-50_&]:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  
                  <label className={cn(
                    "aspect-video rounded-2xl border-2 border-dashed border-brand-900/10 hover:border-accent-400 hover:bg-brand-50 transition-all flex flex-col items-center justify-center cursor-pointer",
                    uploading && "opacity-50 cursor-not-allowed"
                  )}>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      disabled={uploading}
                    />
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-accent-600 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-brand-900/30 mb-2" />
                        <span className="text-[10px] font-bold text-brand-900/40 uppercase tracking-widest">Upload</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-brand-900/5">
                <div className="flex justify-between items-center ml-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-900/40">Or Add Photo via Link</label>
                  <span className="text-[8px] text-accent-600 font-bold uppercase tracking-tight">Direct link required (.jpg, .png, .webp)</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... (Image URL)"
                    className="flex-1 bg-brand-50 border-transparent focus:border-accent-400/50 focus:bg-white focus:ring-4 focus:ring-accent-400/5 rounded-2xl px-6 py-4 outline-none transition-all text-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (imageUrl.trim()) {
                        setNewProject(prev => ({
                          ...prev,
                          images: [...prev.images, imageUrl.trim()]
                        }));
                        setImageUrl('');
                      }
                    }}
                    className="bg-brand-950 text-white px-6 py-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:bg-brand-900 transition-all whitespace-nowrap active:scale-95"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-900/40 ml-4">Description</label>
                <textarea 
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full bg-brand-50 border-transparent focus:border-accent-400/50 focus:bg-white focus:ring-4 focus:ring-accent-400/5 rounded-2xl px-6 py-5 outline-none transition-all resize-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-accent-600 text-white py-5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] font-bold hover:bg-accent-700 shadow-lg shadow-accent-600/20 transition-all mt-4 active:scale-[0.98]"
              >
                Create Project Listing
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
