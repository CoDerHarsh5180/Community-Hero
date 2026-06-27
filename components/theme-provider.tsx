"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// React 19 throws a false-positive warning about the <script> tag that next-themes 
// injects to prevent a FOUC (flash of unstyled content) before dark mode loads.
// This safely intercepts and mutes that specific warning in development mode.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" && 
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return; // Skip logging this specific React 19 warning
    }
    originalConsoleError(...args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}