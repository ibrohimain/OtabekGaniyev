import React, { useState, useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, X, Upload, Loader2 } from 'lucide-react';
import { Project } from '../types';

interface AdminDashboardProps {
  projects: Project[];
  onAdd: (p: Project) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ projects, onAdd, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'General'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const newProject: Project = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || `https://picsum.photos/800/800?random=${Date.now()}`,
        likes: 0,
        comments: [],
        timestamp: Date.now(),
        category: formData.category
      };
      
      // onAdd bu yerda storageService.saveProject ni chaqiradi
      // bu esa rasmni bulutga yuklashni o'z ichiga oladi
      await onAdd(newProject);
      
      setIsFormOpen(false);
      setFormData({ title: '', description: '', imageUrl: '', category: 'General' });
    } catch (error) {
      console.error("Failed to save project", error);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Fayl hajmini tekshirish (masalan 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Fayl hajmi juda katta (Max: 10MB)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const categories = ['Poster', 'Branding', 'Social Media', 'Logo', 'UI/UX', 'Illustration'];

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white font-serif">Admin Dashboard</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yangi Loyiha Qo'shish
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-dark-card border border-white/5 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Jami Loyihalar</p>
          <p className="text-3xl font-bold text-white mt-2">{projects.length}</p>
        </div>
        <div className="bg-dark-card border border-white/5 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Jami Layklar</p>
          <p className="text-3xl font-bold text-brand-400 mt-2">
            {projects.reduce((acc, curr) => acc + curr.likes, 0)}
          </p>
        </div>
        <div className="bg-dark-card border border-white/5 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Jami Izohlar</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">
            {projects.reduce((acc, curr) => acc + curr.comments.length, 0)}
          </p>
        </div>
      </div>

      {/* Projects List Table */}
      <div className="bg-dark-card rounded-xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-black/20 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Rasm</th>
              <th className="px-6 py-4">Nomi</th>
              <th className="px-6 py-4">Kategoriya</th>
              <th className="px-6 py-4">Statistika</th>
              <th className="px-6 py-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <img src={project.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />
                </td>
                <td className="px-6 py-4 font-medium text-white">{project.title}</td>
                <td className="px-6 py-4 text-gray-400">
                  <span className="px-2 py-1 rounded-full bg-white/5 text-xs">
                    {project.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {project.likes} likes • {project.comments.length} comments
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(project.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Project Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-card w-full max-w-lg rounded-2xl p-6 border border-white/10 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Yangi Loyiha</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Loyiha Nomi</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Kategoriya</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Izoh (Description)</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Rasm</label>
                
                {/* Image Preview Area */}
                <div className="space-y-3">
                  {formData.imageUrl && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 group">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, imageUrl: ''})}
                        className="absolute top-2 right-2 p-1 bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                     {/* Upload Button */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer border border-dashed border-white/20 hover:border-brand-500 hover:bg-brand-500/5 rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all h-24"
                    >
                      <Upload className="w-6 h-6 text-brand-500 mb-1" />
                      <span className="text-xs text-gray-400">Fayl Yuklash</span>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                    </div>

                    {/* Or URL input */}
                    <div className="border border-white/10 rounded-lg p-3 flex flex-col justify-center h-24 bg-black/20">
                       <label className="text-xs text-gray-500 mb-1">Yoki URL kiriting:</label>
                       <div className="flex items-center bg-dark-bg rounded border border-white/10 px-2">
                         <ImageIcon className="w-3 h-3 text-gray-500 mr-2" />
                         <input
                          type="url"
                          placeholder="https://..."
                          value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                          className="w-full bg-transparent py-1 text-xs text-white focus:outline-none"
                         />
                       </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">*Katta hajmdagi rasmlar saytni sekinlashtirishi mumkin.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    "Saqlash"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};