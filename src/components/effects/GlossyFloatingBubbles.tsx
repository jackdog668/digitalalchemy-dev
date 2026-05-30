"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import {
  User,
  GraduationCap,
  BookOpen,
  Sparkles,
  Laptop,
  ShoppingBag,
  Gift,
  PhoneCall,
  LucideIcon,
} from "lucide-react";

interface BubbleItem {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
  glowColor: string;
  rgb: string; // Custom RGB mapping for background liquid tints
  desktopPosition: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  floatDelay: number;
  floatDuration: number;
}

const BUBBLE_ITEMS: BubbleItem[] = [
  // LEFT SIDE (4 Bubbles)
  {
    label: "About",
    href: "/about",
    icon: User,
    color: "#818cf8", // Neon Indigo
    glowColor: "rgba(129, 140, 248, 0.45)",
    rgb: "129, 140, 248",
    desktopPosition: { top: "20%", left: "3%" },
    floatDelay: 0,
    floatDuration: 6,
  },
  {
    label: "School",
    href: "/school",
    icon: GraduationCap,
    color: "#9D66FF", // Neon Purple
    glowColor: "rgba(157, 102, 255, 0.45)",
    rgb: "157, 102, 255",
    desktopPosition: { top: "42%", left: "10%" },
    floatDelay: 1.5,
    floatDuration: 7,
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: ShoppingBag,
    color: "#FFDB40", // Electro Gold
    glowColor: "rgba(255, 219, 64, 0.5)",
    rgb: "255, 219, 64",
    desktopPosition: { top: "62%", left: "2.5%" },
    floatDelay: 1,
    floatDuration: 8.5,
  },
  {
    label: "Blog",
    href: "/blog",
    icon: BookOpen,
    color: "#D946EF", // Vivid Fuchsia/Magenta
    glowColor: "rgba(217, 70, 239, 0.45)",
    rgb: "217, 70, 239",
    desktopPosition: { bottom: "12%", left: "8%" },
    floatDelay: 3,
    floatDuration: 8,
  },
  // RIGHT SIDE (4 Bubbles)
  {
    label: "Freebies",
    href: "/freebies/domain-purchase-guide",
    icon: Gift,
    color: "#FF3D57", // Signal Red
    glowColor: "rgba(255, 61, 87, 0.5)",
    rgb: "255, 61, 87",
    desktopPosition: { top: "20%", right: "3%" },
    floatDelay: 2.5,
    floatDuration: 9,
  },
  {
    label: "Services",
    href: "/services",
    icon: Sparkles,
    color: "#00C8FF", // Veo Blue
    glowColor: "rgba(0, 200, 255, 0.5)",
    rgb: "0, 200, 255",
    desktopPosition: { top: "38%", right: "10%" },
    floatDelay: 0.5,
    floatDuration: 6.5,
  },
  {
    label: "Book Call",
    href: "/book",
    icon: PhoneCall,
    color: "#818cf8", // Neon Indigo
    glowColor: "rgba(129, 140, 248, 0.45)",
    rgb: "129, 140, 248",
    desktopPosition: { top: "68%", right: "2.5%" },
    floatDelay: 3.5,
    floatDuration: 6.8,
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: Laptop,
    color: "#40FF78", // Neon Green
    glowColor: "rgba(64, 255, 120, 0.5)",
    rgb: "64, 255, 120",
    desktopPosition: { bottom: "12%", right: "8%" },
    floatDelay: 2,
    floatDuration: 7.5,
  },
];

export function GlossyFloatingBubbles() {
  const router = useRouter();
  const { play } = useSound();
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  // Track dragging state to prevent accidental link navigation on release
  const isDragging = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleHover = () => play("hover");

  const handleTap = (href: string) => {
    if (isDragging.current) return;
    play("activate");
    router.push(href);
  };

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = () => {
    // Delay setting isDragging back to false so click handlers don't immediately fire on release
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  };

  if (!mounted) return null;

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 mt-10 w-full max-w-md mx-auto px-4"
      >
        <div className="grid grid-cols-4 gap-x-3 gap-y-5 justify-items-center">
          {BUBBLE_ITEMS.map((bubble) => {
            const Icon = bubble.icon;
            return (
              <div
                key={bubble.label}
                onClick={() => handleTap(bubble.href)}
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* Bubble Sphere */}
                <motion.div
                  onMouseEnter={handleHover}
                  whileTap={{ scale: 0.92 }}
                  animate={{
                    borderRadius: ["50%", "48% 52% 51% 49%", "51% 49% 48% 52%", "49% 51% 52% 48%", "50%"],
                  }}
                  transition={{
                    borderRadius: {
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: bubble.floatDelay,
                    },
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                  className="relative w-14 h-14 flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-300 active:scale-95 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.28) 0%, rgba(${bubble.rgb}, 0.12) 40%, rgba(10, 11, 13, 0.85) 100%)`,
                    boxShadow: `
                      0 4px 16px 0 rgba(0, 0, 0, 0.4),
                      inset 0 2px 6px rgba(255, 255, 255, 0.35),
                      inset 0 -3px 8px rgba(0, 0, 0, 0.65),
                      0 0 15px ${bubble.glowColor}
                    `,
                  }}
                >
                  {/* Glossy Top-Left Reflection Highlight */}
                  <div className="absolute top-0.5 left-1.5 w-9 h-3 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

                  {/* Glossy Top-Left Spotlight Dot */}
                  <div className="absolute top-1 left-2.5 w-1 h-1 rounded-full bg-white/80 pointer-events-none" />

                  {/* Glossy Bottom-Right Ambient Bounce */}
                  <div className="absolute bottom-1 right-2 w-6 h-2 rounded-full bg-gradient-to-t from-white/15 to-transparent pointer-events-none" />

                  {/* Icon */}
                  <Icon
                    size={16}
                    className="transition-colors duration-300"
                    color={bubble.color}
                    stroke={bubble.color}
                    strokeWidth={2.5}
                    style={{
                      stroke: bubble.color,
                      color: bubble.color,
                      filter: `drop-shadow(0 1.5px 2px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 6px ${bubble.color})`,
                    }}
                  />
                </motion.div>

                {/* Micro-Mono Label */}
                <span 
                  className="mt-2 text-[10px] font-semibold font-mono tracking-wider uppercase text-white text-center transition-all duration-300"
                  style={{
                    textShadow: `0 2px 3px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.9), 0 0 3px ${bubble.glowColor}`,
                  }}
                >
                  {bubble.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <div 
      ref={constraintsRef}
      className="absolute w-full h-full left-0 top-0 z-20 pointer-events-none"
    >
      <div className="relative w-full h-full pointer-events-none">
        {BUBBLE_ITEMS.map((bubble) => {
          const Icon = bubble.icon;
          return (
            <motion.div
              key={bubble.label}
              className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none"
              style={bubble.desktopPosition}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.65}
              dragTransition={{ bounceStiffness: 500, bounceDamping: 18 }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onTap={() => handleTap(bubble.href)}
              animate={{
                y: [0, -10, 5, -8, 0],
                x: [0, 4, -4, 3, 0],
              }}
              transition={{
                y: {
                  duration: bubble.floatDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: bubble.floatDelay,
                },
                x: {
                  duration: bubble.floatDuration * 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: bubble.floatDelay * 1.2,
                },
              }}
            >
              <div className="flex flex-col items-center group">
                {/* Bubble Sphere */}
                <motion.div
                  onMouseEnter={handleHover}
                  whileHover={{ scale: 1.15 }}
                  whileDrag={{ scale: 1.25, boxShadow: `0 15px 40px 0 rgba(0, 0, 0, 0.5), inset 0 4px 10px rgba(255, 255, 255, 0.4), inset 0 -6px 12px rgba(0, 0, 0, 0.7), 0 0 35px ${bubble.glowColor}` }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    borderRadius: ["50%", "48% 52% 51% 49%", "51% 49% 48% 52%", "49% 51% 52% 48%", "50%"],
                  }}
                  transition={{
                    borderRadius: {
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: bubble.floatDelay,
                    },
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                  className="relative w-16 h-16 flex items-center justify-center backdrop-blur-md border border-white/25 transition-all duration-300 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.28) 0%, rgba(${bubble.rgb}, 0.12) 40%, rgba(10, 11, 13, 0.85) 100%)`,
                    boxShadow: `
                      0 8px 32px 0 rgba(0, 0, 0, 0.45),
                      inset 0 4px 10px rgba(255, 255, 255, 0.4),
                      inset 0 -6px 12px rgba(0, 0, 0, 0.75),
                      0 0 25px ${bubble.glowColor}
                    `,
                  }}
                >
                    {/* Glossy Top-Left Reflection Highlight */}
                    <div className="absolute top-1 left-2 w-11 h-4 rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
                    
                    {/* Glossy Top-Left Spotlight Dot */}
                    <div className="absolute top-1.5 left-3 w-1.5 h-1.5 rounded-full bg-white/90 blur-[0.2px] pointer-events-none" />

                    {/* Glossy Bottom-Right Ambient Bounce */}
                    <div className="absolute bottom-1.5 right-2.5 w-8 h-3 rounded-full bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />

                    {/* Icon suspended in glass - bold strokeWidth and dual drop shadow */}
                    <Icon
                      size={20}
                      className="transition-all duration-300 group-hover:scale-110 pointer-events-none"
                      color={bubble.color}
                      stroke={bubble.color}
                      strokeWidth={2.5}
                      style={{
                        stroke: bubble.color,
                        color: bubble.color,
                        filter: `drop-shadow(0 2px 3px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 8px ${bubble.color})`,
                      }}
                    />
                  </motion.div>

                  {/* Mono Label Underneath - high legibility white with double-backing text shadow */}
                  <span
                    className="mt-2 text-[11px] font-semibold font-mono tracking-widest uppercase text-white transition-all duration-300 text-center pointer-events-none select-none"
                    style={{
                      textShadow: `0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9), 0 0 5px ${bubble.glowColor}`,
                    }}
                  >
                    {bubble.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
  );
}
