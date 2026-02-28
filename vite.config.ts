import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const LOVABLE_CLOUD_PROJECT_ID = "kcxpeafdcdoarggrfyrw";
const LOVABLE_CLOUD_FALLBACK_URL = `https://${LOVABLE_CLOUD_PROJECT_ID}.supabase.co`;
const LOVABLE_CLOUD_FALLBACK_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjeHBlYWZkY2RvYXJnZ3JmeXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjE1OTEsImV4cCI6MjA4Nzc5NzU5MX0.nsYHXJr4MgJDfZiS-_d5WVF5X061XnXaA3K3hemTSbU";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL ?? LOVABLE_CLOUD_FALLBACK_URL
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? LOVABLE_CLOUD_FALLBACK_PUBLISHABLE_KEY
    ),
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
