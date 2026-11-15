import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#10192F", soft: "#1A2540" },
        cyan: { brand: "#29B9E5", deep: "#1467A8" }, // deep: beyaz ve açık zeminlerde WCAG AA (≥5:1)
        paper: "#F3F5F9",
        alliance: { red: "#E5303E", blue: "#2E5BFF" },
        adc: "#8DC63F",
        adcpro: "#93268F",
      },
      fontFamily: {
        display: ["var(--font-display)", "Chakra Petch", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        plate: "6px 6px 0 0 var(--tw-shadow-color)",
        plateSm: "4px 4px 0 0 var(--tw-shadow-color)",
        plateLg: "10px 10px 0 0 var(--tw-shadow-color)",
      },
    },
  },
  plugins: [],
};
export default config;
