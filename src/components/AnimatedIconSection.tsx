import React, { useState, useEffect, useRef } from 'react';
import { Globe, Zap, Users } from 'lucide-react';

interface IconItemProps {
  icon: React.ReactNode;
  tooltip: string;
  delay: number;
}

const IconItem: React.FC<IconItemProps> = ({ icon, tooltip, delay }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay, hasAnimated]);

  return (
    <div ref={ref} className="relative">
      {/* Card with flip animation */}
      <div
        className={`
          relative w-32 h-32 cursor-pointer perspective-1000
          transform-style-preserve-3d transition-all duration-700 ease-out
          ${isVisible ? 'rotate-y-0' : 'rotate-y-180'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Card face */}
        <div className={`
          absolute inset-0 w-full h-full rounded-2xl bg-white border border-gray-100
          shadow-sm flex items-center justify-center backface-hidden
          transition-all duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}>
          {/* Icon with hover animation */}
          <div className={`
            transition-all duration-200 ease-out
            ${isHovered ? 'scale-110 brightness-110' : 'scale-100'}
          `}>
            {icon}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <div className={`
        absolute -bottom-10 left-1/2 transform -translate-x-1/2
        px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md
        transition-all duration-200 pointer-events-none whitespace-nowrap
        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
      `}>
        {tooltip}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </div>
    </div>
  );
};

const AnimatedIconSection: React.FC = () => {
  return (
    <div className="py-12">
      <div className="flex justify-center items-center space-x-20">
        <IconItem
          icon={<Globe className="w-12 h-12 text-blue-600" />}
          tooltip="Verified Global Teams"
          delay={0}
        />
        <IconItem
          icon={<Users className="w-12 h-12 text-purple-600" />}
          tooltip="AI Matching Engine"
          delay={200}
        />
        <IconItem
          icon={<Zap className="w-12 h-12 text-orange-500" />}
          tooltip="Lightning Start"
          delay={400}
        />
      </div>
    </div>
  );
};

export default AnimatedIconSection;