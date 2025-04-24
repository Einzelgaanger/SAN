
import React, { useEffect, useState } from "react";
import { 
  Star, Heart, CheckCircle, Award, Crown, Gift, 
  Sparkles, Zap, Smile, ThumbsUp, Medal, Trophy,
  PartyPopper, Lightbulb, Clock, Check, Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedIconProps {
  className?: string;
}

interface IconConfig {
  Icon: React.ElementType;
  color: string;
  size: number;
  top: string;
  left: string;
  delay: number;
  duration?: number;
  scale?: number;
}

export const AnimatedIcons: React.FC<AnimatedIconProps> = ({ className }) => {
  const { isMobile, windowWidth } = useIsMobile();
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);

  // Detect low-end devices using a simplified approach
  useEffect(() => {
    const checkPerformance = () => {
      // Check if it's a mobile device with a small screen as a simple heuristic
      // for performance mode (no longer using deviceMemory API which is not widely supported)
      if (isMobile && windowWidth < 640) {
        setPerformanceMode(true);
      }
    };
    
    try {
      checkPerformance();
    } catch (e) {
      console.log("Cannot detect device performance", e);
    }
  }, [isMobile, windowWidth]);

  // Reduce number of icons on mobile
  const iconCount = isMobile ? 6 : performanceMode ? 8 : 15;

  // Defined animated icons with vibrant colors based on the theme
  const icons: IconConfig[] = [
    { Icon: Star, color: "text-yellow-400", size: 32, top: "5%", left: "10%", delay: 0, duration: 4 },
    { Icon: Heart, color: "text-red-400", size: 24, top: "20%", left: "80%", delay: 0.7, duration: 3.5 },
    { Icon: CheckCircle, color: "text-green-500", size: 28, top: "70%", left: "85%", delay: 1.3, duration: 5 },
    { Icon: Award, color: "text-purple-500", size: 36, top: "85%", left: "15%", delay: 2.1, duration: 4.2 },
    { Icon: Crown, color: "text-yellow-500", size: 30, top: "10%", left: "90%", delay: 1.5, duration: 3.8 },
    { Icon: Gift, color: "text-blue-500", size: 26, top: "50%", left: "5%", delay: 0.9, duration: 4.5 },
    { Icon: Sparkles, color: "text-amber-500", size: 22, top: "30%", left: "25%", delay: 1.2, duration: 3.2 },
    { Icon: Zap, color: "text-yellow-600", size: 28, top: "60%", left: "75%", delay: 0.4, duration: 4.8 },
    { Icon: Smile, color: "text-green-400", size: 30, top: "40%", left: "88%", delay: 1.8, duration: 3.9 },
    { Icon: ThumbsUp, color: "text-blue-400", size: 24, top: "75%", left: "40%", delay: 0.6, duration: 4.3 },
    { Icon: Medal, color: "text-amber-600", size: 32, top: "15%", left: "45%", delay: 2.3, duration: 5.1 },
    { Icon: Trophy, color: "text-yellow-500", size: 40, top: "55%", left: "92%", delay: 1.1, duration: 4.7 },
    { Icon: PartyPopper, color: "text-pink-500", size: 38, top: "88%", left: "65%", delay: 0.5, duration: 5.5 },
    { Icon: Lightbulb, color: "text-amber-400", size: 30, top: "25%", left: "8%", delay: 1.9, duration: 4.1 },
    { Icon: Clock, color: "text-indigo-500", size: 36, top: "65%", left: "18%", delay: 2.5, duration: 5.2 },
    { Icon: Check, color: "text-green-500", size: 26, top: "35%", left: "60%", delay: 0.8, duration: 3.7 },
    { Icon: Leaf, color: "text-green-600", size: 28, top: "78%", left: "28%", delay: 1.7, duration: 4.6 },
  ].slice(0, iconCount);

  return (
    <div className={cn("fixed inset-0 pointer-events-none overflow-hidden z-0", className)}>
      {animationEnabled && icons.map((icon, index) => {
        // Calculate position based on percentage but with some randomness
        const topPosition = icon.top;
        const leftPosition = icon.left;
        
        const animationDuration = icon.duration || 4;
        const animationDelay = icon.delay;
        const scale = icon.scale || 1;
        
        return (
          <div
            key={index}
            className="floating-icon absolute"
            style={{
              top: topPosition,
              left: leftPosition,
              animationDelay: `${animationDelay}s`,
              animationDuration: `${animationDuration}s`,
              opacity: 0.25,
              transform: `scale(${scale})`,
            }}
          >
            <icon.Icon 
              size={icon.size} 
              className={cn("float pulse", icon.color)} 
            />
          </div>
        );
      })}
    </div>
  );
};
