import typography from "@tailwindcss/typography";
import debugScreens from "tailwindcss-debug-screens";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx}",
    "./src/ui/**/*.{js,ts,jsx,tsx}",
    "./mdx-components.tsx",
    "./src/content/**/*.mdx",
  ],
  plugins: [typography, debugScreens],
  theme: {
    extend: {
      animation: {
        "fade-in": "fade-in 3s ease-in-out forwards",
        title: "title 3s ease-out forwards",
      },
      backgroundImage: {
        "gradient-radial":
          "radial-gradient(50% 50% at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        display: ["var(--font-calsans)"],
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        "2.5xl": "1.6875rem",
      },
      keyframes: {
        "fade-in": {
          "0%": {
            opacity: "0%",
          },
          "75%": {
            opacity: "0%",
          },
          "100%": {
            opacity: "100%",
          },
        },
        title: {
          "0%": {
            "letter-spacing": "0.25em",
            "line-height": "0%",
            opacity: "0",
          },
          "25%": {
            "line-height": "0%",
            opacity: "0%",
          },
          "80%": {
            opacity: "100%",
          },
          "100%": {
            "line-height": "100%",
            opacity: "100%",
          },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            "code::after": {
              content: '""',
            },
            "code::before": {
              content: '""',
            },
          },
        },
        quoteless: {
          css: {
            "blockquote p:first-of-type::after": { content: "none" },
            "blockquote p:first-of-type::before": { content: "none" },
          },
        },
      },
    },
  },
};
