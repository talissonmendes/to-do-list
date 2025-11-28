import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Search, Calendar, GripVertical, CheckCircle2, Circle, Clock } from 'lucide-react';

// --- Tipos ---
type Priority = 'Baixa' | 'Média' | 'Alta';
type Status = 'todo' | 'doing' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  createdAt: string;
}

// --- Componentes UI Reutilizáveis (Princípios React) ---

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    Baixa: 'bg-info-light text-info-foreground',
    Média: 'bg-warning-light text-warning-foreground',
    Alta: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };
  return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors[priority]}`}>{priority}</span>;
};

// --- Modal de Tarefa (Criação/Edição/Detalhes) ---
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  task?: Task | null;
}

const TaskModal = ({ isOpen, onClose, onSave, onDelete, task }: TaskModalProps) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Média',
    status: 'todo'
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({ title: '', description: '', priority: 'Média', status: 'todo' });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary">
          <h2 className="text-xl font-bold text-card-foreground">{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition"><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Título</label>
            <input 
              type="text" 
              className="w-full bg-background border border-border rounded-md p-2 focus:ring-2 focus:ring-primary outline-none transition text-foreground"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Criar API de Login"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
            <textarea 
              className="w-full bg-background border border-border rounded-md p-2 h-24 focus:ring-2 focus:ring-primary outline-none transition resize-none text-foreground"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detalhes da atividade..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prioridade</label>
              <select 
                className="w-full bg-background border border-border rounded-md p-2 text-foreground"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as Priority})}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-foreground mb-1">Status</label>
               <select 
                className="w-full bg-background border border-border rounded-md p-2 text-foreground"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as Status})}
              >
                <option value="todo">A Fazer</option>
                <option value="doing">Em Progresso</option>
                <option value="done">Concluído</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-secondary flex justify-between items-center">
          {task ? (
             <button 
             onClick={() => { onDelete && onDelete(task.id); onClose(); }}
             className="text-destructive hover:text-destructive/80 text-sm font-medium flex items-center gap-1"
           >
             <Trash2 size={16} /> Excluir
           </button>
          ) : <div></div>}
         
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-md transition">Cancelar</button>
            <button 
              onClick={() => { onSave(formData); onClose(); }}
              disabled={!formData.title}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---

export default function KanbanBoard() {
  // Estado das tarefas e filtros
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Configurar Banco de Dados', description: 'Instalar PostgreSQL e criar schemas', status: 'done', priority: 'Alta', createdAt: new Date().toISOString() },
    { id: '2', title: 'Criar Rotas da API', description: 'Definir endpoints RESTful', status: 'doing', priority: 'Alta', createdAt: new Date().toISOString() },
    { id: '3', title: 'Estilizar Frontend', description: 'Aplicar Tailwind CSS', status: 'todo', priority: 'Média', createdAt: new Date().toISOString() },
  ]);
  
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Estado para Drag and Drop
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Handlers de CRUD
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t));
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...taskData as Task
      };
      setTasks([...tasks, newTask]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if(confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Lógica de Drag and Drop (HTML5 Nativo)
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessário para permitir o drop
  };

  const onDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (draggedTaskId) {
      setTasks(tasks.map(t => t.id === draggedTaskId ? { ...t, status } : t));
      setDraggedTaskId(null);
    }
  };

  // Filtragem
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(filter.toLowerCase()) || 
    t.description.toLowerCase().includes(filter.toLowerCase())
  );

  const getTasksByStatus = (status: Status) => filteredTasks.filter(t => t.status === status);

  // Renderização da Coluna
  const renderColumn = (title: string, status: Status, icon: React.ReactNode, colorClass: string) => (
    <div 
      className={`flex-1 min-w-[300px] bg-secondary rounded-xl p-4 flex flex-col h-full border-t-4 ${colorClass}`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          {icon} {title}
        </h3>
        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs font-bold">
          {getTasksByStatus(status).length}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {getTasksByStatus(status).map(task => (
          <div 
            key={task.id}
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            onClick={() => openEditModal(task)}
            className="bg-card p-4 rounded-lg shadow-sm border border-border cursor-pointer hover:shadow-md hover:border-primary/50 transition group active:cursor-grabbing"
          >
            <div className="flex justify-between items-start mb-2">
              <PriorityBadge priority={task.priority} />
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h4 className="font-semibold text-card-foreground mb-1">{task.title}</h4>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{task.description}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(task.createdAt).toLocaleDateString()}</span>
              <GripVertical size={14} className="text-muted-foreground/50" />
            </div>
          </div>
        ))}
        {getTasksByStatus(status).length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm">
            Arraste tarefas aqui ou crie uma nova
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dev Tasks</h1>
            <p className="text-muted-foreground">Gerencie seu projeto de Backend</p>
          </div>
          <button 
            onClick={openNewTaskModal}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary-hover transition shadow-lg hover:shadow-primary/30"
          >
            <Plus size={20} /> Nova Atividade
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-card p-4 rounded-lg shadow-sm flex items-center gap-3 border border-border">
          <Search className="text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Filtrar atividades por título ou descrição..." 
            className="flex-1 outline-none text-foreground bg-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* Kanban Board */}
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-250px)] overflow-x-auto pb-4">
          {renderColumn('A Fazer', 'todo', <Circle size={20} className="text-muted-foreground"/>, 'border-muted-foreground')}
          {renderColumn('Em Andamento', 'doing', <Clock size={20} className="text-info"/>, 'border-info')}
          {renderColumn('Concluído', 'done', <CheckCircle2 size={20} className="text-success"/>, 'border-success')}
        </div>

      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
      />
    </div>
  );
}
