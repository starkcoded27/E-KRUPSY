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
        brand: {
          50: "#fdf2f2",
          100: "#fde8e8",
          200: "#fbd5d5",
          300: "#f8b4b4",
          400: "#f98080",
          500: "#e02424",
          600: "#c81e1e",
          700: "#9b1c1c",
          800: "#771d1d",
          900: "#5a1318",
          maroon: "#7B1113",
          darkmaroon: "#590C0E",
          crimson: "#8B0000",
        },
      },
    },
  },
  plugins: [],
};
export default config;
