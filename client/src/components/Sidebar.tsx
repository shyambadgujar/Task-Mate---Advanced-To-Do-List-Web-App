import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@shared/schema";

type FilterView = "all" | "today" | "upcoming" | "completed";

interface SidebarProps {
  currentView: FilterView;
  onViewChange: (view: FilterView) => void;
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
  onAddCategory: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  selectedCategory,
  onCategorySelect,
  onAddCategory
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: categories, isLoading } = useCategories();
  
  const toggleMobileMenu = () => setIsMobileOpen(prev => !prev);
  
  const getCategoryColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
      cyan: "bg-cyan-500",
      orange: "bg-orange-500",
      gray: "bg-gray-500"
    };
    
    return colorMap[color] || "bg-blue-500";
  };
  
  return (
    <aside className={`bg-white border-r border-gray-200 w-full md:w-64 md:flex-shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto ${isMobileOpen ? 'fixed inset-0 z-50' : 'hidden md:block'}`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">TaskFlow</h1>
        <button 
          className="md:hidden text-gray-500 focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav className="p-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">OVERVIEW</h2>
          <ul>
            <li className="mb-1">
              <button 
                onClick={() => onViewChange('all')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                  currentView === 'all' && !selectedCategory ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:text-primary hover:bg-blue-50'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                All Tasks
              </button>
            </li>
            <li className="mb-1">
              <button 
                onClick={() => onViewChange('today')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                  currentView === 'today' ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:text-primary hover:bg-blue-50'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Today
              </button>
            </li>
            <li className="mb-1">
              <button 
                onClick={() => onViewChange('upcoming')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                  currentView === 'upcoming' ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:text-primary hover:bg-blue-50'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upcoming
              </button>
            </li>
            <li className="mb-1">
              <button 
                onClick={() => onViewChange('completed')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                  currentView === 'completed' ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:text-primary hover:bg-blue-50'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Completed
              </button>
            </li>
          </ul>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CATEGORIES</h2>
            <button 
              className="text-xs text-primary hover:text-primary-dark"
              onClick={onAddCategory}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          {isLoading ? (
            <div className="py-2 px-3 text-sm text-gray-500">Loading categories...</div>
          ) : (
            <ul>
              {categories && categories.map((category) => (
                <li key={category.id} className="mb-1">
                  <button 
                    onClick={() => onCategorySelect(category.id)}
                    className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                      selectedCategory === category.id ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:text-primary hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full ${getCategoryColorClasses(category.color)} mr-2`}></span>
                      <span>{category.name}</span>
                    </div>
                    {category.count !== undefined && (
                      <span className="text-xs text-gray-500">{category.count}</span>
                    )}
                  </button>
                </li>
              ))}
              
              {categories && categories.length === 0 && (
                <li className="text-sm text-gray-500 px-3 py-2">No categories found</li>
              )}
            </ul>
          )}
        </div>
      </nav>
      
      {isMobileOpen && (
        <div className="md:hidden absolute bottom-4 right-4">
          <button 
            onClick={toggleMobileMenu}
            className="bg-white p-2 rounded-full shadow-lg border border-gray-200"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
