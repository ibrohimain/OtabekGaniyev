import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <div 
      className="group relative break-inside-avoid mb-6 cursor-pointer overflow-hidden rounded-xl bg-dark-card border border-white/5 hover:border-brand-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10"
      onClick={() => onClick(project)}
    >
      {/* Image Container */}
      <div className="relative aspect-auto overflow-hidden">
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {project.category}
          </p>
          <h3 className="text-white text-lg font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
            {project.title}
          </h3>
        </div>
      </div>

      {/* Info Bar (Always visible on mobile, visible on hover desktop if desired, but here we keep it clean) */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-gray-400">
          <div className="flex items-center space-x-1 group-hover:text-pink-500 transition-colors">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{project.likes}</span>
          </div>
          <div className="flex items-center space-x-1 group-hover:text-blue-400 transition-colors">
            <MessageCircle className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{project.comments.length}</span>
          </div>
        </div>
        <span className="text-xs text-gray-600">
          {new Date(project.timestamp).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
