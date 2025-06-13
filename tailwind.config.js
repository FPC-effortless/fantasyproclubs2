/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#111111",
        foreground: "#F5F5F5",
        primary: {
          DEFAULT: "#176A2F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#232323",
          foreground: "#F5F5F5",
        },
        destructive: {
          DEFAULT: "#E63946",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#A0A0A0",
        },
        accent: {
          DEFAULT: "#FFD600",
          foreground: "#232323",
        },
        popover: {
          DEFAULT: "#232323",
          foreground: "#F5F5F5",
        },
        card: {
          DEFAULT: "#232323",
          foreground: "#F5F5F5",
        },
        success: {
          DEFAULT: "#00C853",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#2196F3",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FFD600",
          foreground: "#232323",
        },
        error: {
          DEFAULT: "#E63946",
          foreground: "#FFFFFF",
        },
        "ea-black": "#000000",
        "ea-green": "#00ff87",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
