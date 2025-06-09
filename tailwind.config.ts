import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import twColors from "tailwindcss/colors";

const novaColors = {
  text: {
    "100": "hsl(var(--nova-text-100))",
    "90": "hsl(var(--nova-text-90))",
    "80": "hsl(var(--nova-text-80))",
    "70": "hsl(var(--nova-text-70))",
    "0": "hsl(var(--nova-text-0))",
  },
  primary: {
    "110": "hsl(var(--nova-primary-110))",
    "100": "hsl(var(--nova-primary-100))",
    "50": "hsl(var(--nova-primary-50))",
    "40": "hsl(var(--nova-primary-40))",
    "30": "hsl(var(--nova-primary-30))",
    "20": "hsl(var(--nova-primary-20))",
    "10": "hsl(var(--nova-primary-10))",
    "05": "hsl(var(--nova-primary-05))",
  },
  secondary: {
    "110": "hsl(var(--nova-secondary-110))",
    "100": "hsl(var(--nova-secondary-100))",
    "40": "hsl(var(--nova-secondary-40))",
    "30": "hsl(var(--nova-secondary-30))",
    "20": "hsl(var(--nova-secondary-20))",
    "10": "hsl(var(--nova-secondary-10))",
  },
  neutral: {
    "60": "hsl(var(--nova-neutral-60))",
    "40": "hsl(var(--nova-neutral-40))",
    "30": "hsl(var(--nova-neutral-30))",
    "20": "hsl(var(--nova-neutral-20))",
    "10": "hsl(var(--nova-neutral-10))",
    "0": "hsl(var(--nova-neutral-0))",
  },
  error: {
    "110": "hsl(var(--nova-error-110))",
    "100": "hsl(var(--nova-error-100))",
    "10": "hsl(var(--nova-error-10))",
  },
  success: {
    "110": "hsl(var(--nova-success-110))",
    "100": "hsl(var(--nova-success-100))",
    "10": "hsl(var(--nova-success-10))",
  },
  warning: {
    "110": "hsl(var(--nova-warning-110))",
    "100": "hsl(var(--nova-warning-100))",
    "10": "hsl(var(--nova-warning-10))",
  },
  label: {
    "1": "hsl(var(--nova-label-1))",
    "2": "hsl(var(--nova-label-2))",
  },
  overlay: "hsl(var(--nova-overlay))",
};

export default {
  darkMode: ["class"],
  safelist: ["dark"],
  content: ["./**/*.vue"],
  prefix: "",
  theme: {
    extend: {
      boxShadow: {
        popover: "0 2px 10px 0 var(--color-overlay)",
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
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
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-in-out",
        "collapsible-up": "collapsible-up 0.2s ease-in-out",
      },
    },
    colors: {
      ...twColors,
      ...novaColors,
      neutral: {
        ...novaColors.neutral,
      },
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        ...novaColors.primary,
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        ...novaColors.secondary,
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
    },
  },

  plugins: [animate],
} satisfies Config;
