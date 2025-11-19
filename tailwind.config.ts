import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1200px",
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1200px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        'bg-elevated': {
          '1': "hsl(var(--bg-elevated-1))",
          '2': "hsl(var(--bg-elevated-2))",
          '3': "hsl(var(--bg-elevated-3))",
        },
        'primary-alpha': {
          '10': "var(--primary-alpha-10)",
          '20': "var(--primary-alpha-20)",
          '30': "var(--primary-alpha-30)",
          '50': "var(--primary-alpha-50)",
        },
        'black-alpha': {
          '5': "var(--black-alpha-5)",
          '10': "var(--black-alpha-10)",
          '20': "var(--black-alpha-20)",
        },
        'white-alpha': {
          '10': "var(--white-alpha-10)",
          '20': "var(--white-alpha-20)",
          '80': "var(--white-alpha-80)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
      },
      lineHeight: {
        'tight': 'var(--line-height-tight)',
        'normal': 'var(--line-height-normal)',
        'relaxed': 'var(--line-height-relaxed)',
        'loose': 'var(--line-height-loose)',
      },
      spacing: {
        'section': 'var(--spacing-section)',
        'card-gap': 'var(--spacing-card-gap)',
        'element': 'var(--spacing-element)',
        'card-padding': 'var(--spacing-card-padding)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      minWidth: {
        'touch': 'var(--touch-target-min)',
      },
      minHeight: {
        'touch': 'var(--touch-target-min)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-sunset': 'var(--gradient-sunset)',
        'gradient-ocean': 'var(--gradient-ocean)',
        'gradient-glass': 'var(--gradient-glass)',
        'gradient-glow-primary': 'var(--gradient-glow-primary)',
        'gradient-glow-success': 'var(--gradient-glow-success)',
        'gradient-rainbow': 'var(--gradient-rainbow)',
        'gradient-primary-spin': 'var(--gradient-primary-spin)',
      },
      boxShadow: {
        'z1': 'var(--shadow-z1)',
        'z2': 'var(--shadow-z2)',
        'z3': 'var(--shadow-z3)',
        'z4': 'var(--shadow-z4)',
        'z5': 'var(--shadow-z5)',
        'z6': 'var(--shadow-z6)',
        'glow-primary': 'var(--shadow-glow-primary)',
        'glow-success': 'var(--shadow-glow-success)',
        'glow-warning': 'var(--shadow-glow-warning)',
        'inner-subtle': 'var(--shadow-inner-subtle)',
        'inner-strong': 'var(--shadow-inner-strong)',
        'colored-primary': 'var(--shadow-colored-primary)',
        'colored-success': 'var(--shadow-colored-success)',
      },
      blur: {
        'xs': 'var(--blur-sm)',
        'DEFAULT': 'var(--blur-base)',
        'md': 'var(--blur-md)',
        'lg': 'var(--blur-lg)',
        'xl': 'var(--blur-xl)',
      },
      backdropBlur: {
        'glass-light': 'var(--glass-backdrop-light)',
        'glass-dark': 'var(--glass-backdrop-dark)',
      },
      transitionDuration: {
        'fast': '150ms',
        'DEFAULT': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: any) {
      const newUtilities = {
        '.glass': {
          'background': 'var(--glass-bg-light)',
          'backdrop-filter': 'var(--glass-backdrop-light)',
          '-webkit-backdrop-filter': 'var(--glass-backdrop-light)',
          'border': '1px solid var(--glass-border-light)',
        },
        '.dark .glass': {
          'background': 'var(--glass-bg-dark)',
          'backdrop-filter': 'var(--glass-backdrop-dark)',
          '-webkit-backdrop-filter': 'var(--glass-backdrop-dark)',
          'border-color': 'var(--glass-border-dark)',
        },
        '.glass-strong': {
          'background': 'var(--white-alpha-20)',
          'backdrop-filter': 'blur(16px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(16px) saturate(180%)',
          'border': '1px solid var(--glass-border-light)',
        },
        '.dark .glass-strong': {
          'background': 'var(--black-alpha-20)',
          'backdrop-filter': 'blur(20px) saturate(200%)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(200%)',
          'border-color': 'var(--glass-border-dark)',
        },
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.perspective': {
          'perspective': '1000px',
        },
        '.perspective-lg': {
          'perspective': '2000px',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.elevation-1': {
          'box-shadow': 'var(--shadow-z1)',
        },
        '.elevation-2': {
          'box-shadow': 'var(--shadow-z2)',
        },
        '.elevation-3': {
          'box-shadow': 'var(--shadow-z3)',
        },
        '.elevation-4': {
          'box-shadow': 'var(--shadow-z4)',
        },
        '.elevation-5': {
          'box-shadow': 'var(--shadow-z5)',
        },
        '.elevation-6': {
          'box-shadow': 'var(--shadow-z6)',
        },
        '.glow-hover': {
          'transition': 'box-shadow var(--transition-base)',
        },
        '.glow-hover:hover': {
          'box-shadow': 'var(--shadow-glow-primary)',
        },
        '.text-gradient-primary': {
          'background': 'var(--gradient-primary)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-gradient-success': {
          'background': 'var(--gradient-success)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover', 'dark'])
    }
  ],
} satisfies Config;
