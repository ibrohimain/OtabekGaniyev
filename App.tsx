import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectModal } from './components/ProjectModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Project, ViewState, Comment } from './types';
import { 
  saveProject, 
  deleteProject, 
  toggleLikeProject, 
  addCommentToProject, 
  subscribeToProjects 
} from './services/storageService';
import { auth } from './services/firebase';
import { signInAnonymously } from 'firebase/auth';
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
    // 1. Firebasega ulanish (Anonim tarzda)
    // Bu Storage va Databasega yozish uchun ruxsat olishga yordam beradi
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
        console.log("Firebase signed in anonymously");
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    // 2. Real-time listenerni ulash
    const unsubscribe = subscribeToProjects((updatedProjects) => {
      setProjects(updatedProjects);
      setLoading(false);
      
      // Agar modal ochiq bo'lsa, uning ichidagi ma'lumotni ham yangilash (masalan yangi like yoki comment)
      setSelectedProject(prev => {
        if (!prev) return null;
        const found = updatedProjects.find(p => p.id === prev.id);
        return found || null; // Agar loyiha o'chirilgan bo'lsa, modalni yopish uchun null
      });
    });

    // Component o'chganda listenerni to'xtatish
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleLike = async (id: string) => {
    // UI ni darhol yangilash shart emas, Firebase o'zi qaytaradi,
    // lekin optimistik update qilish mumkin. Hozircha oddiy qoldiramiz.
    await toggleLikeProject(id);
  };

  const handleComment = async (id: string, comment: Comment) => {
    await addCommentToProject(id, comment);
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

  const handleAddProject = async (project: Project, file?: File) => {
    await saveProject(project, file);
    // setProjects qilish shart emas, chunki subscribeToProjects o'zi yangilaydi
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      await deleteProject(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="ml-3 text-gray-400">Loading projects...</p>
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
               <div className="text-center py-20 bg-dark-card/30 rounded-xl border border-white/5">
                 <p className="text-gray-400 mb-2">Hozircha loyihalar mavjud emas.</p>
                 <p className="text-sm text-gray-500">Firebase ulanganini tekshiring.</p>
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