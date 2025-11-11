import { ChevronDown } from "lucide-react";

interface ScrollIndicatorProps {
  isVisible: boolean;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  isVisible,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20"
      aria-hidden="true"
    >
      {/* Using a custom animation class 'animate-subtle-bounce' which would need to be defined in CSS for a gentler effect. 
          For now, sticking to Tailwind's default bounce and customizing duration/delay for subtlety. 
          A true 'flash' would be an opacity pulse. 
      */}
      <ChevronDown
        className="w-5 h-5 text-sidebar-foreground/60 opacity-70"
        style={{
          animation: "subtle-bounce 1.5s infinite ease-in-out",
        }}
      />
      <ChevronDown
        className="w-5 h-5 text-sidebar-foreground/60 opacity-50 -mt-2.5"
        style={{
          animation: "subtle-bounce 1.5s 0.25s infinite ease-in-out",
        }}
      />
    </div>
  );
};

// It's better to define keyframes in a global CSS file (e.g., index.css or app.css)
// For example, in your global CSS:
/*
@keyframes subtle-bounce {
  0%, 100% {
    transform: translateY(-15%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}
*/
