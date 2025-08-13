// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, where, Timestamp } from 'firebase/firestore';
import { db } from './config/firebaseConfig';
import { Task, TabName } from './types';
import TaskItem from './components/TaskItem';
import TaskInput from './components/TaskInput';
import { endOfDay, endOfWeek, endOfMonth, endOfYear, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import './App.css'; // Ana uygulama stilleri

// Görev Listesi Bileşeni - Router ile kullanılacak
interface TaskListProps {
  tabName: TabName;
}

const TaskList: React.FC<TaskListProps> = ({ tabName }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    const tasksCollectionRef = collection(db, 'tasks');
    const now = new Date();

    // Filtreleme mantığı React Native ile aynı kalır
    switch (tabName) {
      case 'today':
        q = query(
          tasksCollectionRef,
          where('dueDate', '>=', Timestamp.fromDate(startOfDay(now))),
          where('dueDate', '<=', Timestamp.fromDate(endOfDay(now))),
          orderBy('dueDate', 'asc')
        );
        break;
      case 'weekly':
        q = query(
          tasksCollectionRef,
          where('dueDate', '>=', Timestamp.fromDate(startOfWeek(now, { weekStartsOn: 1 }))),
          where('dueDate', '<=', Timestamp.fromDate(endOfWeek(now, { weekStartsOn: 1 }))),
          orderBy('dueDate', 'asc')
        );
        break;
      case 'monthly':
        q = query(
          tasksCollectionRef,
          where('dueDate', '>=', Timestamp.fromDate(startOfMonth(now))),
          where('dueDate', '<=', Timestamp.fromDate(endOfMonth(now))),
          orderBy('dueDate', 'asc')
        );
        break;
      case 'yearly':
        q = query(
          tasksCollectionRef,
          where('dueDate', '>=', Timestamp.fromDate(startOfYear(now))),
          where('dueDate', '<=', Timestamp.fromDate(endOfYear(now))),
          orderBy('dueDate', 'asc')
        );
        break;
      case 'all': // Tüm görevleri görmek için yeni bir sekme
      default:
        q = query(tasksCollectionRef, orderBy('createdAt', 'desc'));
        break;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks: Task[] = snapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        completed: doc.data().completed,
        createdAt: doc.data().createdAt.toDate(),
        dueDate: doc.data().dueDate ? doc.data().dueDate.toDate() : undefined,
      }));
      setTasks(fetchedTasks);
      setLoading(false);
    }, (error) => {
      console.error("Görevleri çekerken hata oluştu: ", error);
      alert("Hata: Görevleri yüklerken bir sorun oluştu.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tabName]);

  const handleAddTask = async (text: string) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        text: text,
        completed: false,
        createdAt: Timestamp.now(),
        dueDate: Timestamp.fromDate(new Date()), // Yeni eklenen görevi varsayılan olarak bugün bitiş tarihiyle ekle
      });
    } catch (error) {
      console.error("Görev eklerken hata oluştu: ", error);
      alert("Hata: Görev eklenirken bir sorun oluştu.");
    }
  };

  const handleToggleComplete = async (id: string) => {
    const taskRef = doc(db, 'tasks', id);
    const taskToUpdate = tasks.find(t => t.id === id);
    if (taskToUpdate) {
      try {
        await updateDoc(taskRef, {
          completed: !taskToUpdate.completed,
        });
      } catch (error) {
        console.error("Görev güncellenirken hata oluştu: ", error);
        alert("Hata: Görev güncellenirken bir sorun oluştu.");
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm("Bu görevi silmek istediğinizden emin misiniz?")) {
      try {
        await deleteDoc(doc(db, 'tasks', id));
      } catch (error) {
        console.error("Görev silinirken hata oluştu: ", error);
        alert("Hata: Görev silinirken bir sorun oluştu.");
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div> {/* Basit bir yükleme spinner'ı */}
        <p>Görevler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="task-list-page">
      <h2>{
        tabName === 'today' ? 'Bugün Yapılacaklar' :
        tabName === 'weekly' ? 'Haftalık Yapılacaklar' :
        tabName === 'monthly' ? 'Aylık Yapılacaklar' :
        tabName === 'yearly' ? 'Yıllık Planlar' :
        'Tüm Görevler'
      }</h2>
      <TaskInput onAddTask={handleAddTask} />
      {tasks.length === 0 ? (
        <p className="empty-list-message">Henüz görev yok!</p>
      ) : (
        <div className="task-items-container">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Ana App Bileşeni
function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <h1 className="app-title">To-Do List</h1>
          <nav>
            <ul>
              <li><Link to="/today">Bugün</Link></li>
              <li><Link to="/weekly">Haftalık</Link></li>
              <li><Link to="/monthly">Aylık</Link></li>
              <li><Link to="/yearly">Yıllık</Link></li>
              <li><Link to="/all">Tüm Görevler</Link></li>
            </ul>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<TaskList tabName="today" />} /> {/* Varsayılan rota */}
            <Route path="/today" element={<TaskList tabName="today" />} />
            <Route path="/weekly" element={<TaskList tabName="weekly" />} />
            <Route path="/monthly" element={<TaskList tabName="monthly" />} />
            <Route path="/yearly" element={<TaskList tabName="yearly" />} />
            <Route path="/all" element={<TaskList tabName="all" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;