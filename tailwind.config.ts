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
        primary: "#1A6B5A",
        "primary-dark": "#0F4D40",
        secondary: "#D4A017",
        accent: "#6C63FF",
        "bg-light": "#F5F7F6",
        surface: "#FFFFFF",
        error: "#E74C3C",
        success: "#27AE60",
        warning: "#F39C12",
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};
export default config;
