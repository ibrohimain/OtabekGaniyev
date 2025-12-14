import React, { useState } from 'react';
import { X, Heart, Download, Send, User } from 'lucide-react';
import { Project, Comment } from '../types';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  onLike: (id: string) => void;
  onComment: (id: string, comment: Comment) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiked) {
      onLike(project.id);
      setIsLiked(true);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !authorName.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: authorName,
      text: commentText,
      timestamp: Date.now(),
    };

    onComment(project.id, newComment);
    setCommentText('');
    setAuthorName('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-dark-card w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10 animate-slide-up">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white md:hidden"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Side: Image */}
        <div className="w-full md:w-3/5 bg-black flex items-center justify-center overflow-auto custom-scrollbar">
          <img 
            src={project.imageUrl} 
            alt={project.title} 
            className="w-full h-auto object-contain max-h-[60vh] md:max-h-full"
          />
        </div>

        {/* Right Side: Details & Comments */}
        <div className="w-full md:w-2/5 flex flex-col bg-dark-card h-[50vh] md:h-auto">
          
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{project.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{project.description}</p>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:block text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-4 flex items-center gap-4 border-b border-white/5 bg-white/5">
            <button 
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${isLiked ? 'bg-pink-500/20 text-pink-500' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              {project.likes + (isLiked ? 1 : 0)}
            </button>
            <a 
              href={project.downloadUrl || project.imageUrl} 
              download
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Download
            </a>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Comments ({project.comments.length})
            </h3>
            {project.comments.length === 0 ? (
              <p className="text-gray-600 text-center py-8 italic">No comments yet. Be the first!</p>
            ) : (
              project.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-white">{comment.author}</span>
                      <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <div className="p-4 border-t border-white/10 bg-dark-bg">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <input
                type="text"
                placeholder="Ismingiz (Name)..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-dark-card border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                required
              />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Fikringizni yozing..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-dark-card border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 pr-10"
                  required
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-400"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
