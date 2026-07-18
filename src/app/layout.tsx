import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });


export const metadata: Metadata = {
  title: "JanVoice",
  description: "Collect, organize, and prioritize citizen feedback into actionable insights that help governments make faster, smarter, and more transparent decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = 'system';
                let accent = 'default';
                let stateStr = localStorage.getItem('janvoice_ui_settings');
                if (stateStr) {
                  const state = JSON.parse(stateStr).state;
                  if (state.theme) theme = state.theme;
                  if (state.accent) accent = state.accent;
                }
                
                document.documentElement.setAttribute('data-accent', accent);
                
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                
                function applyTheme(t) {
                  if (t === 'system') {
                    document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
                  } else {
                    document.documentElement.setAttribute('data-theme', t);
                  }
                }
                
                applyTheme(theme);
                
                mediaQuery.addEventListener('change', () => {
                  let currentState = localStorage.getItem('janvoice_ui_settings');
                  if (currentState) {
                     const parsedTheme = JSON.parse(currentState).state.theme;
                     if (parsedTheme === 'system') applyTheme('system');
                  } else {
                     applyTheme('system');
                  }
                });
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
