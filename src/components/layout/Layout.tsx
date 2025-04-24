import React from "react";
import { MobileNav } from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

export const Layout = ({ children, onRefresh }: LayoutProps) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const lastY = React.useRef(0);
  const pullStartY = React.useRef(0);
  const refreshThreshold = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    lastY.current = e.touches[0].clientY;
    pullStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = async (e: React.TouchEvent) => {
    const y = e.touches[0].clientY;
    const scrollTop = e.currentTarget.scrollTop;
    const pullDistance = y - pullStartY.current;

    if (scrollTop === 0 && pullDistance > 0 && !isRefreshing && onRefresh) {
      if (pullDistance > refreshThreshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
    }

    lastY.current = y;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav />
      
      {/* Main Content Area */}
      <main className="pt-16 min-h-screen">
        {/* Scrollable Container with Pull-to-Refresh */}
        <div 
          className="h-[calc(100vh-4rem)] overflow-y-auto overscroll-y-contain pb-6 px-4 sm:px-6 lg:px-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Pull-to-Refresh Indicator */}
          {isRefreshing && (
            <div className="flex justify-center items-center h-16 text-gray-500">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Refreshing...
            </div>
          )}

          {/* Max Width Container */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}; 