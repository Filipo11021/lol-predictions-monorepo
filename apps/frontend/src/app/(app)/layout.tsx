import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="bg-background">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <div>{children}</div>
        </ThemeProvider>
      </div>
      <Script
        async
        src="/stats/script.js"
        data-website-id="e3de5d2c-5740-4c7c-a7e9-65d9d939bc7c"
      />
    </>
  );
}
