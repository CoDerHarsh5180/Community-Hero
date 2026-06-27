// app/components/AuthProvider.tsx
"use client"

import { SessionProvider } from "next-auth/react"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

// components/AuthProvider.tsx
// "use client"

// export default function AuthProvider({ children }: { children: React.ReactNode }) {
//   return <>{children}</>
// }