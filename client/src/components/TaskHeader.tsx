import { useState, useRef, useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface TaskHeaderProps {
  currentView: "all" | "today" | "upcoming" | "completed";
  selectedCategory: number | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddTask: () => void;
}

export default function TaskHeader({
  currentView,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onAddTask
}: TaskHeaderProps) {
  const [isCategoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [isStatusFilterOpen, setStatusFilterOpen] = useState(false);
  const [isDateFilterOpen, setDateFilterOpen] = useState(false);
  
  const categoryFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const dateFilterRef = useRef<HTMLDivElement>(null);
  
  const { data: categories } = useCategories();
  
  // Get the header title based on current view and selected category
  const getHeaderTitle = () => {
    if (selectedCategory && categories) {
      const category = categories.find(c => c.id === selectedCategory);
      return category ? category.name : "All Tasks";
    }
    
    switch (currentView) {
      case "today":
        return "Today's Tasks";
      case "upcoming":
        return "Upcoming Tasks";
      case "completed":
        return "Completed Tasks";
      default:
        return "All Tasks";
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target as Node)) {
        setCategoryFilterOpen(false);
      }
      
      if (statusFilterRef.current && !statusFilterRef.current.contains(event.target as Node)) {
        setStatusFilterOpen(false);
      }
      
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setDateFilterOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Mobile sidebar toggle button
  const MobileSidebarToggle = () => (
    <button className="md:hidden text-gray-500 focus:outline-none" onClick={() => {
      // Toggle sidebar via DOM for mobile (this is simpler than prop drilling)
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        sidebar.classList.remove('hidden');
      }
    }}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{getHeaderTitle()}</h1>
          <MobileSidebarToggle />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Input
              type="text"
              className="pl-10 pr-4"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Add Task Button */}
          <Button onClick={onAddTask} className="inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
          </Button>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="mt-4 flex items-center flex-wrap gap-2">
        <div className="mr-2 text-sm text-gray-700">Filter:</div>
        
        <div className="flex flex-wrap gap-2">
          {/* "All" filter applies when no filters are active */}
          <button className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            All
            <svg className="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Category Filter Dropdown */}
          <div className="relative inline-block" ref={categoryFilterRef}>
            <button 
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => setCategoryFilterOpen(!isCategoryFilterOpen)}
            >
              Category
              <svg className="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCategoryFilterOpen && (
              <div className="absolute mt-1 z-10 w-56 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="py-1">
                  {categories && categories.map(category => (
                    <button 
                      key={category.id}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => {
                        // Apply category filter logic (handled by parent component)
                        setCategoryFilterOpen(false);
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Status Filter Dropdown */}
          <div className="relative inline-block" ref={statusFilterRef}>
            <button 
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => setStatusFilterOpen(!isStatusFilterOpen)}
            >
              Status
              <svg className="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isStatusFilterOpen && (
              <div className="absolute mt-1 z-10 w-56 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="py-1">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => {
                      // Apply completed filter logic
                      setStatusFilterOpen(false);
                    }}
                  >
                    Completed
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => {
                      // Apply incomplete filter logic
                      setStatusFilterOpen(false);
                    }}
                  >
                    Incomplete
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Due Date Filter Dropdown */}
          <div className="relative inline-block" ref={dateFilterRef}>
            <button 
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => setDateFilterOpen(!isDateFilterOpen)}
            >
              Due Date
              <svg className="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDateFilterOpen && (
              <div className="absolute mt-1 z-10 w-56 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="py-1">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => {
                      // Apply today filter logic
                      setDateFilterOpen(false);
                    }}
                  >
                    Today
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => {
                      // Apply this week filter logic
                      setDateFilterOpen(false);
                    }}
                  >
                    This Week
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => {
                      // Apply this month filter logic
                      setDateFilterOpen(false);
                    }}
                  >
                    This Month
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
