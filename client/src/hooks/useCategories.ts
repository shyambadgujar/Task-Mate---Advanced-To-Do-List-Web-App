import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

interface CategoryWithCount extends Category {
  count?: number;
}

export function useCategories() {
  return useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });
}

export function useCategory(categoryId: number) {
  return useQuery<Category>({
    queryKey: [`/api/categories/${categoryId}`],
    enabled: !!categoryId, // Only run if categoryId is provided
  });
}
