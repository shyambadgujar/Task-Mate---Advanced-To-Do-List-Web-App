import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  tasks, type Task, type InsertTask, type TaskWithCategory
} from "@shared/schema";

export interface IStorage {
  // User methods (keeping original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Task methods
  getAllTasks(): Promise<TaskWithCategory[]>;
  getTaskById(id: number): Promise<TaskWithCategory | undefined>;
  getTasksByCategory(categoryId: number): Promise<TaskWithCategory[]>;
  searchTasks(query: string): Promise<TaskWithCategory[]>;
  createTask(task: InsertTask): Promise<TaskWithCategory>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<TaskWithCategory | undefined>;
  deleteTask(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private tasks: Map<number, Task>;
  
  private userId: number;
  private categoryId: number;
  private taskId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.tasks = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.taskId = 1;
    
    // Initialize with default categories
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Create default categories
    const defaultCategories: InsertCategory[] = [
      { name: "Work", color: "blue" },
      { name: "Personal", color: "green" },
      { name: "Health", color: "purple" },
      { name: "Shopping", color: "yellow" }
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category Methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryUpdate };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    if (!this.categories.has(id)) return false;
    
    // Get tasks with this category
    const tasksWithCategory = Array.from(this.tasks.values()).filter(
      task => task.categoryId === id
    );
    
    // Cannot delete a category that has tasks
    if (tasksWithCategory.length > 0) return false;
    
    return this.categories.delete(id);
  }
  
  // Task Methods
  async getAllTasks(): Promise<TaskWithCategory[]> {
    return this.getTasksWithCategories(Array.from(this.tasks.values()));
  }
  
  async getTaskById(id: number): Promise<TaskWithCategory | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const category = this.categories.get(task.categoryId);
    if (!category) return undefined;
    
    return { ...task, category };
  }
  
  async getTasksByCategory(categoryId: number): Promise<TaskWithCategory[]> {
    const categoryTasks = Array.from(this.tasks.values()).filter(
      task => task.categoryId === categoryId
    );
    
    return this.getTasksWithCategories(categoryTasks);
  }
  
  async searchTasks(query: string): Promise<TaskWithCategory[]> {
    const lowerCaseQuery = query.toLowerCase();
    const filteredTasks = Array.from(this.tasks.values()).filter(
      task => 
        task.title.toLowerCase().includes(lowerCaseQuery) || 
        (task.description && task.description.toLowerCase().includes(lowerCaseQuery))
    );
    
    return this.getTasksWithCategories(filteredTasks);
  }
  
  async createTask(insertTask: InsertTask): Promise<TaskWithCategory> {
    const id = this.taskId++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    
    const category = this.categories.get(task.categoryId);
    if (!category) {
      throw new Error("Invalid category ID");
    }
    
    return { ...task, category };
  }
  
  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<TaskWithCategory | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    
    const category = this.categories.get(updatedTask.categoryId);
    if (!category) {
      throw new Error("Invalid category ID");
    }
    
    return { ...updatedTask, category };
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Helper method
  private async getTasksWithCategories(tasks: Task[]): Promise<TaskWithCategory[]> {
    const tasksWithCategories: TaskWithCategory[] = [];
    
    for (const task of tasks) {
      const category = this.categories.get(task.categoryId);
      if (category) {
        tasksWithCategories.push({ ...task, category });
      }
    }
    
    return tasksWithCategories;
  }
}

export const storage = new MemStorage();
