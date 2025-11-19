import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollIndicatorProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollIndicator = ({ children, className }: ScrollIndicatorProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    
    setShowTopShadow(scrollTop > 10);
    setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 10);
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // Check initial state
    handleScroll();

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      {showTopShadow && (
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
      )}
      <div
        ref={scrollRef}
        className={cn("overflow-y-auto scroll-smooth", className)}
      >
        {children}
      </div>
      {showBottomShadow && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
      )}
    </div>
  );
};
