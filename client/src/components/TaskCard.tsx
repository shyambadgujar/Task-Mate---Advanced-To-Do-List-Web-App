import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TaskWithCategory } from "@shared/schema";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: TaskWithCategory;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { toast } = useToast();
  
  // Format the date in a readable format
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) {
      return "Today";
    } else if (isTomorrow(dateObj)) {
      return "Tomorrow";
    } else {
      return format(dateObj, "MMM d, yyyy");
    }
  };
  
  // Get background color for category badge
  const getCategoryColor = (color: string) => {
    const colorMap: Record<string, { bg: string, text: string }> = {
      blue: { bg: "bg-blue-100", text: "text-blue-800" },
      green: { bg: "bg-green-100", text: "text-green-800" },
      purple: { bg: "bg-purple-100", text: "text-purple-800" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-800" },
      red: { bg: "bg-red-100", text: "text-red-800" },
      pink: { bg: "bg-pink-100", text: "text-pink-800" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-800" },
      cyan: { bg: "bg-cyan-100", text: "text-cyan-800" },
      orange: { bg: "bg-orange-100", text: "text-orange-800" },
      gray: { bg: "bg-gray-100", text: "text-gray-800" }
    };
    
    return colorMap[color] || { bg: "bg-blue-100", text: "text-blue-800" };
  };
  
  // Get due date text color based on date
  const getDueDateColor = () => {
    const dateObj = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
    
    if (isToday(dateObj)) {
      return "text-red-500 font-medium";
    }
    return "text-gray-500";
  };
  
  // Toggle task completion status
  const toggleCompletion = useMutation({
    mutationFn: async () => {
      return await apiRequest(
        "PUT", 
        `/api/tasks/${task.id}`, 
        { completed: !task.completed }
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: task.completed ? "Task marked as incomplete" : "Task marked as complete",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const categoryColorClasses = getCategoryColor(task.category.color);
  const dueDateColorClass = getDueDateColor();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <button 
              className={`h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 focus:outline-none ${
                task.completed ? 'bg-primary' : 'hover:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-primary'
              }`}
              onClick={() => toggleCompletion.mutate()}
              disabled={toggleCompletion.isPending}
            >
              {task.completed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            
            <div>
              <h3 className={`text-lg font-medium text-gray-900 ${task.completed ? 'line-through opacity-70' : ''}`}>
                {task.title}
              </h3>
              
              {task.description && (
                <div className={`mt-1 text-sm text-gray-600 ${task.completed ? 'line-through opacity-70' : ''}`}>
                  {task.description}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-500">
            <button 
              className="p-1 hover:text-primary rounded-full focus:outline-none"
              onClick={onEdit}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              className="p-1 hover:text-red-500 rounded-full focus:outline-none"
              onClick={onDelete}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColorClasses.bg} ${categoryColorClasses.text}`}>
              <span className={`w-2 h-2 rounded-full bg-${task.category.color}-500 mr-1.5`}></span>
              <span>{task.category.name}</span>
            </span>
          </div>
          
          <div className={`text-xs flex items-center ${dueDateColorClass}`}>
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(task.dueDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
