// src/components/TaskInput.tsx
import React, { useState } from 'react';
import './TaskInput.css'; // Stil dosyasını import ediyoruz

interface TaskInputProps {
  onAddTask: (taskText: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [taskText, setTaskText] = useState('');

  const handleAddTask = () => {
    if (taskText.trim().length > 0) {
      onAddTask(taskText);
      setTaskText('');
    } else {
      alert('Lütfen bir görev girin.'); // Web için basit alert
    }
  };

  return (
    <div className="task-input-container">
      <input
        type="text"
        className="task-input"
        placeholder="Yeni görev ekle..."
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleAddTask();
          }
        }}
      />
      <button className="add-button" onClick={handleAddTask}>
        Ekle
      </button>
    </div>
  );
};

export default TaskInput;