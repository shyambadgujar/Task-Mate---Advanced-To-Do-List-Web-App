import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCategorySchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Create a validation schema for the category
const categoryValidationSchema = insertCategorySchema;

type CategoryFormValues = z.infer<typeof categoryValidationSchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Color options for categories
const colorOptions = [
  { value: "blue", bg: "bg-blue-500" },
  { value: "green", bg: "bg-green-500" },
  { value: "purple", bg: "bg-purple-500" },
  { value: "yellow", bg: "bg-yellow-500" },
  { value: "red", bg: "bg-red-500" },
  { value: "pink", bg: "bg-pink-500" },
  { value: "indigo", bg: "bg-indigo-500" },
  { value: "cyan", bg: "bg-cyan-500" },
  { value: "orange", bg: "bg-orange-500" },
  { value: "gray", bg: "bg-gray-500" },
];

export default function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState("blue");
  
  // Configure form with validation
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryValidationSchema),
    defaultValues: {
      name: "",
      color: "blue",
    },
  });
  
  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      return await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category created successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error creating category",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: CategoryFormValues) => {
    // Make sure the selected color is used
    data.color = selectedColor;
    createCategory.mutate(data);
  };
  
  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    form.setValue("color", color);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter category name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={() => (
                <FormItem>
                  <FormLabel>Category Color</FormLabel>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full ${color.bg} ${
                          selectedColor === color.value ? "ring-2 ring-offset-2 ring-blue-500" : ""
                        }`}
                        onClick={() => handleColorSelect(color.value)}
                      />
                    ))}
                  </div>
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
                disabled={createCategory.isPending}
              >
                Add Category
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
