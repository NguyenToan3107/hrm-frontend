import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      mobile: "300px",

      tablet: "640px",
      // => @media (min-width: 640px) { ... }

      laptop: "1024px",
      // => @media (min-width: 1024px) { ... }

      desktop: "1280px",
      // => @media (min-width: 1280px) { ... }
    },
    extend: {
      borderWidth: {
        "0.5": "0.5px",
        "0.25": "0.25px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "text-gray": "var(--gray)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          second: "var(--second-primary)",
        },
        sidebar: {
          primary: "var(--sidebar-primary)",
          hover: "var(--sidebar-hover)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        red_login: "var(--red-logout)",
        red_login_hover: "var(--red-logout-hover)",
        active: "var(--green)",
        active_hover: "var(--green-hover)",
        inactive: "var(--inactive)",
        inactive_hover: "var(--inactive-hover)",
        block: "var(--block)",
        block_hover: "var(--block-hover)",
        button: {
          search: "var(--btn-search)",
          "search-hover": "var(--btn-search-hover)",
          create: "var(--btn-create-new)",
          "create-hover": "var(--btn-create-new-hover)",
          edit: "var(--btn-edit)",
          "edit-hover": "var(--btn-edit-hover)",
          confirm: "var(--btn-confirm)",
          "confirm-hover": "var(--btn-confirm-hover)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/line-clamp")],
};
export default config;
