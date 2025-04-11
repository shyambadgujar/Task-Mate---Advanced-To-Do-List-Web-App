import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCategorySchema, insertTaskSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Category Routes
  apiRouter.get("/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      // Get task count for each category
      const tasks = await storage.getAllTasks();
      
      const categoriesWithCount = categories.map(category => {
        const count = tasks.filter(task => task.categoryId === category.id).length;
        return { ...category, count };
      });
      
      res.json(categoriesWithCount);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving categories", error: String(error) });
    }
  });
  
  apiRouter.post("/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Error creating category", error: String(error) });
      }
    }
  });
  
  apiRouter.put("/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Error updating category", error: String(error) });
      }
    }
  });
  
  apiRouter.delete("/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found or has associated tasks" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting category", error: String(error) });
    }
  });
  
  // Task Routes
  apiRouter.get("/tasks", async (req: Request, res: Response) => {
    try {
      let tasks;
      
      const { categoryId, search, completed } = req.query;
      
      if (categoryId) {
        const id = parseInt(categoryId as string);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
        tasks = await storage.getTasksByCategory(id);
      } else if (search) {
        tasks = await storage.searchTasks(search as string);
      } else {
        tasks = await storage.getAllTasks();
      }
      
      // Filter by completion status if provided
      if (completed !== undefined) {
        const isCompleted = completed === 'true';
        tasks = tasks.filter(task => task.completed === isCompleted);
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving tasks", error: String(error) });
    }
  });
  
  apiRouter.get("/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTaskById(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving task", error: String(error) });
    }
  });
  
  apiRouter.post("/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Error creating task", error: String(error) });
      }
    }
  });
  
  apiRouter.put("/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const taskData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Error updating task", error: String(error) });
      }
    }
  });
  
  apiRouter.delete("/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting task", error: String(error) });
    }
  });
  
  // Use the API router with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
