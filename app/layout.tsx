import { Geist, Geist_Mono, Inter, IBM_Plex_Sans } from "next/font/google"
import { getSessionUser } from "@/lib/authHelper";
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const ibmPlexSansHeading = IBM_Plex_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {


    return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, ibmPlexSansHeading.variable)}
    >
      <body>
        
          <ThemeProvider attribute={"class"} defaultTheme="dark" enableSystem disableTransitionOnChange>{children}</ThemeProvider>
       
      </body>
    </html>
  )
}
