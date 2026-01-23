/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoonIcon, SunIcon, MonitorIcon, ChevronDownIcon } from "lucide-react";
import SpinnerRing180 from "@/icons/180-spinner";
import { cn } from "@/utils/lib/utils";
import { motion } from "motion/react";
import { type Variants } from "motion/react";

export const DisabledSpinner = () => {
  return (
    <Button
      variant="outline"
      className="text-foreground rounded-full"
      size="icon"
      disabled
    >
      <span aria-hidden="true" className="">
        <SpinnerRing180 className="w-4" />
      </span>
    </Button>
  );
};

export function ThemeToggle({
  size = 14,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <DisabledSpinner />;

  const handleToggle = () => {
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      setTheme(theme === "light" ? "dark" : "light");
    }
  };

  const isDark = resolvedTheme === "dark";

  const parentVariants: Variants = {
    initial: {},
    hover: {},
  };

  const childVariants: Variants = {
    initial: {
      rotate: 0,
    },
    hover: {
      rotate: 180,
      transition: {
        type: "spring",
        ease: "easeInOut",
        duration: 0.2,
      },
    },
  };

  return (
    <motion.button
      variants={parentVariants}
      initial="initial"
      whileHover="hover"
      onClick={handleToggle}
      className={cn(
        "hover:bg-secondary/60 bg-secondary/40 cursor-pointer text-foreground/50 hover:text-foreground/90 max-w-max rounded-full border p-1.5 transition-colors duration-200",
        className,
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <motion.span variants={childVariants} className="block ease-in-out">
        {isDark ? <MoonIcon size={size} /> : <SunIcon size={size} />}
      </motion.span>
    </motion.button>
  );
}

export function ButtonGroupThemeToggle({
  className,
  size = 14,
}: {
  className?: string;
  size?: number;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <DisabledSpinner />;

  const options = [
    { value: "light", icon: <SunIcon size={size} />, label: "Light" },
    { value: "dark", icon: <MoonIcon size={size} />, label: "Dark" },
    { value: "system", icon: <MonitorIcon size={size} />, label: "System" },
  ];

  return (
    <div
      className={cn(
        "_wrapper bg-secondary/40 text-foreground/50 flex max-w-max rounded-full border p-0.5",
        className,
      )}
    >
      {options.map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 cursor-pointer rounded-full p-1.5 text-sm font-medium transition-colors duration-200 ${
            theme === value
              ? "dark:bg-primary/15 bg-primary/5 text-foreground" // active state
              : "hover:text-foreground" // default state
          } `}
          aria-label={`Switch to ${label.toLowerCase()} theme`}
        >
          {icon}
          <span className="hidden [sm:inline]">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function DropdownThemeToggle({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <DisabledSpinner />;

  const options = [
    { value: "light", icon: <SunIcon size={size} />, label: "Light" },
    { value: "dark", icon: <MoonIcon size={size} />, label: "Dark" },
    { value: "system", icon: <MonitorIcon size={size} />, label: "System" },
  ];

  const currentOption =
    options.find((option) => option.value === theme) || options[2]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="max-w-max gap-2 border">
          {currentOption.icon}
          <span>{currentOption.label}</span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {options.map(({ value, icon, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              `hover:bg-accent/40! gap-3 ${theme === value ? "bg-accent hover:bg-accent!" : ""}`,
              className,
            )}
          >
            {icon}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
