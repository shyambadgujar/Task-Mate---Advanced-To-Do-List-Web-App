import { useQuery, useMutation } from "@tanstack/react-query";
import { TaskWithCategory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useTasks(options?: { categoryId?: number; search?: string; completed?: boolean }) {
  const queryParams = new URLSearchParams();
  
  if (options?.categoryId) {
    queryParams.append("categoryId", options.categoryId.toString());
  }
  
  if (options?.search) {
    queryParams.append("search", options.search);
  }
  
  if (options?.completed !== undefined) {
    queryParams.append("completed", options.completed.toString());
  }
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  
  return useQuery<TaskWithCategory[]>({
    queryKey: ["/api/tasks" + queryString],
  });
}

export function useTask(taskId: number) {
  return useQuery<TaskWithCategory>({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: !!taskId, // Only run if taskId is provided
  });
}

export function useToggleTaskCompletion() {
  return useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      return apiRequest("PUT", `/api/tasks/${taskId}`, { completed });
    },
  });
}
