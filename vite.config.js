import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = "medipen-proofreader";

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
});
