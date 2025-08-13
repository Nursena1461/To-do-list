// src/components/TaskItem.tsx
import React from 'react';
import { Task } from '../types';
import './TaskItem.css'; // Stil dosyasını import ediyoruz

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void; // Görev silme eklendi
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDeleteTask }) => {
  return (
    <div className="task-item">
      <div className="task-content">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          className="task-checkbox"
        />
        <span className={`task-text ${task.completed ? 'completed' : ''}`}>
          {task.text}
        </span>
      </div>
      <button className="delete-button" onClick={() => onDeleteTask(task.id)}>
        Sil
      </button>
    </div>
  );
};

export default TaskItem;