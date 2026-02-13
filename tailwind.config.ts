import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        academy: {
          bg: "#0b1020",
          card: "#121a30",
          accent: "#7c8cff",
          mint: "#5eead4",
          violet: "#a78bfa",
          text: "#e2e8f0",
          muted: "#94a3b8",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124, 140, 255, 0.18), 0 10px 30px rgba(124, 140, 255, 0.25)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
        shine: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        shine: "shine 3s linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
