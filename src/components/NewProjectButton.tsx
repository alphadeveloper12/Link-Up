'use client';

import { useState } from 'react';
import PostProjectModal from './PostProjectModal';

export function NewProjectButton({ onCreated }: { onCreated?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onCreated?.();
  };

  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
      >
        New Project
      </button>
      
      <PostProjectModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}

export default NewProjectButton;