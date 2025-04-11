import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTaskSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";

// Extend the task schema with frontend validation
const taskValidationSchema = insertTaskSchema.extend({
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  description: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskValidationSchema>;

interface TaskModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  task: any; // Using any here to make it easier with partial task data
  onClose: () => void;
}

export default function TaskModal({ isOpen, isEditMode, task, onClose }: TaskModalProps) {
  const { toast } = useToast();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  
  // Configure form with validation
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskValidationSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date(),
      completed: false,
      categoryId: 1, // Default to first category
    },
  });
  
  // Set form values when editing a task
  useEffect(() => {
    if (isEditMode && task) {
      const dueDate = typeof task.dueDate === 'string' 
        ? parseISO(task.dueDate) 
        : task.dueDate;
      
      form.reset({
        title: task.title,
        description: task.description || "",
        dueDate: dueDate,
        completed: task.completed,
        categoryId: task.categoryId,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        dueDate: new Date(),
        completed: false,
        categoryId: categories && categories.length > 0 ? categories[0].id : 1,
      });
    }
  }, [isOpen, isEditMode, task, form, categories]);
  
  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      return await apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task created successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error creating task",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  // Update task mutation
  const updateTask = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      return await apiRequest("PUT", `/api/tasks/${task.id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: TaskFormValues) => {
    if (isEditMode) {
      updateTask.mutate(data);
    } else {
      createTask.mutate(data);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter task title" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseISO(value) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories && categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createTask.isPending || updateTask.isPending}
              >
                {isEditMode ? "Save Changes" : "Add Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
