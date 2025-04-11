import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TaskHeader from "@/components/TaskHeader";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";
import DeleteModal from "@/components/DeleteModal";
import CategoryModal from "@/components/CategoryModal";
import { Category, Task, TaskWithCategory } from "@shared/schema";

type FilterView = "all" | "today" | "upcoming" | "completed";
type FilterCategory = number | null;

export default function Home() {
  // View/filter state
  const [currentView, setCurrentView] = useState<FilterView>("all");
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  
  // Edit mode and current task/category
  const [isEditMode, setEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskWithCategory | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  
  // Handler for opening add task modal
  const handleAddTask = () => {
    setCurrentTask(null);
    setEditMode(false);
    setTaskModalOpen(true);
  };
  
  // Handler for opening edit task modal
  const handleEditTask = (task: TaskWithCategory) => {
    setCurrentTask(task);
    setEditMode(true);
    setTaskModalOpen(true);
  };
  
  // Handler for opening delete confirmation
  const handleDeleteTask = (taskId: number) => {
    setTaskToDelete(taskId);
    setDeleteModalOpen(true);
  };
  
  // Handler for view changes
  const handleViewChange = (view: FilterView) => {
    setCurrentView(view);
    setSelectedCategory(null);
  };
  
  // Handler for category selection
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentView("all");
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        currentView={currentView}
        onViewChange={handleViewChange}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        onAddCategory={() => setCategoryModalOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <TaskHeader 
          currentView={currentView}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddTask={handleAddTask}
        />
        
        <TaskList 
          currentView={currentView}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </main>
      
      {/* Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen}
        isEditMode={isEditMode}
        task={currentTask}
        onClose={() => setTaskModalOpen(false)}
      />
      
      <DeleteModal 
        isOpen={isDeleteModalOpen}
        taskId={taskToDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
      
      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />
    </div>
  );
}
