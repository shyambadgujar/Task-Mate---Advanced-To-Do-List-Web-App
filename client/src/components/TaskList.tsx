import { useTasks } from "@/hooks/useTasks";
import TaskCard from "@/components/TaskCard";
import { isToday, isFuture, parseISO, addDays, formatRelative } from "date-fns";
import { useState, useEffect } from "react";
import { TaskWithCategory } from "@shared/schema";

interface TaskListProps {
  currentView: "all" | "today" | "upcoming" | "completed";
  selectedCategory: number | null;
  searchQuery: string;
  onEditTask: (task: TaskWithCategory) => void;
  onDeleteTask: (taskId: number) => void;
}

export default function TaskList({
  currentView,
  selectedCategory,
  searchQuery,
  onEditTask,
  onDeleteTask
}: TaskListProps) {
  const { data: allTasks, isLoading, error } = useTasks();
  const [filteredTasks, setFilteredTasks] = useState<TaskWithCategory[]>([]);
  
  // Filter tasks based on current view, category, and search query
  useEffect(() => {
    if (!allTasks) {
      setFilteredTasks([]);
      return;
    }
    
    let filtered = [...allTasks];
    
    // Apply view filters
    if (currentView === "today") {
      filtered = filtered.filter(task => isToday(parseISO(task.dueDate as unknown as string)));
    } else if (currentView === "upcoming") {
      filtered = filtered.filter(task => isFuture(parseISO(task.dueDate as unknown as string)));
    } else if (currentView === "completed") {
      filtered = filtered.filter(task => task.completed);
    }
    
    // Apply category filter
    if (selectedCategory !== null) {
      filtered = filtered.filter(task => task.categoryId === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task => 
          task.title.toLowerCase().includes(query) || 
          (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredTasks(filtered);
  }, [allTasks, currentView, selectedCategory, searchQuery]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading tasks</h3>
          <p className="mt-1 text-sm text-gray-500">{String(error)}</p>
        </div>
      </div>
    );
  }
  
  // Show empty state
  if (filteredTasks.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="py-12">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show task grid
  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onEdit={() => onEditTask(task)} 
            onDelete={() => onDeleteTask(task.id)} 
          />
        ))}
      </div>
    </div>
  );
}
