import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        rankup: "#387C44",
      },
      fontFamily: {
        // This sets the default font (font-sans) to Inter
        sans: ["var(--font-inter)", "sans-serif"],
        // This creates the special class (font-space) for headings
        space: ["var(--font-space)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;