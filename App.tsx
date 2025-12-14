import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectModal } from './components/ProjectModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Project, ViewState, Comment } from './types';
import { getProjects, saveProject, deleteProject, toggleLikeProject, addCommentToProject, initDB } from './services/storageService';
import { Lock, Loader2, Send } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Login State
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Database initialization failed", err);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Handlers (Async wrappers)
  const handleLike = async (id: string) => {
    const updated = await toggleLikeProject(id);
    setProjects(updated);
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject(updated.find(p => p.id === id) || null);
    }
  };

  const handleComment = async (id: string, comment: Comment) => {
    const updated = await addCommentToProject(id, comment);
    setProjects(updated);
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject(updated.find(p => p.id === id) || null);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setView('ADMIN_DASHBOARD');
      setPassword('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleAddProject = async (project: Project) => {
    const updated = await saveProject(project);
    setProjects(updated);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      const updated = await deleteProject(id);
      setProjects(updated);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-brand-500/30">
      <Navbar currentView={view} onChangeView={setView} />

      {/* VIEW: HOME */}
      {view === 'HOME' && (
        <main>
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 animate-slide-up">
              Visual Excellence
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in delay-100">
              Grafik dizayn olamiga xush kelibsiz. Bu yerda ijod, mantiq va go'zallik uyg'unlashadi.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in delay-200">
              <button 
                onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-full transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]"
              >
                Portfolio
              </button>
              <a 
                href="https://t.me/rustamvich_06_09"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full border border-white/10 transition-colors flex items-center gap-2"
              >
                <span>Contact Me</span>
                <Send className="w-4 h-4" />
              </a>
            </div>
          </section>

          {/* Portfolio Grid */}
          <section id="portfolio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={setSelectedProject} 
                />
              ))}
            </div>
            {projects.length === 0 && (
               <div className="text-center py-20 text-gray-500">
                 Hozircha loyihalar mavjud emas.
               </div>
            )}
          </section>
        </main>
      )}

      {/* VIEW: LOGIN */}
      {view === 'ADMIN_LOGIN' && (
        <div className="min-h-screen flex items-center justify-center p-4">
           <div className="bg-dark-card border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
             <div className="text-center mb-8">
               <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Lock className="w-6 h-6 text-brand-500" />
               </div>
               <h2 className="text-2xl font-bold text-white">Admin Access</h2>
               <p className="text-gray-400 text-sm mt-2">Iltimos, parolni kiriting</p>
             </div>
             <form onSubmit={handleAdminLogin} className="space-y-4">
               <div>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                   placeholder="Password..."
                   autoFocus
                 />
                 {loginError && (
                   <p className="text-red-500 text-xs mt-2 ml-1">Parol noto'g'ri (Hint: admin123)</p>
                 )}
               </div>
               <button
                 type="submit"
                 className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-lg transition-colors"
               >
                 Kirish
               </button>
             </form>
             <button 
               onClick={() => setView('HOME')}
               className="w-full text-center text-sm text-gray-500 mt-6 hover:text-white transition-colors"
             >
               Bosh sahifaga qaytish
             </button>
           </div>
        </div>
      )}

      {/* VIEW: ADMIN DASHBOARD */}
      {view === 'ADMIN_DASHBOARD' && (
        <AdminDashboard 
          projects={projects}
          onAdd={handleAddProject}
          onDelete={handleDeleteProject}
        />
      )}

      {/* Project Modal (Global) */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onLike={handleLike}
          onComment={handleComment}
        />
      )}
    </div>
  );
};

export default App;