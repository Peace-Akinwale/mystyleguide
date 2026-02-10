import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			success: 'hsl(var(--success))',
  			warning: 'hsl(var(--warning))',
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			'chat-user': {
  				bg: 'hsl(var(--chat-user-bg))',
  				text: 'hsl(var(--chat-user-text))'
  			},
  			'chat-assistant': {
  				bg: 'hsl(var(--chat-assistant-bg))',
  				text: 'hsl(var(--chat-assistant-text))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: '1rem',
  			'2xl': '1.5rem',
  		},
  		spacing: {
  			'18': '4.5rem',
  			'22': '5.5rem',
  		},
  		minHeight: {
  			'12': '3rem',
  			'14': '3.5rem',
  		},
  		animation: {
  			'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
  			'slide-in-right': 'slide-in-right 0.3s ease-out',
  			'fade-in': 'fade-in 0.2s ease-out',
  			'scale-in': 'scale-in 0.2s ease-out',
  		},
  		keyframes: {
  			'slide-in-bottom': {
  				from: { opacity: '0', transform: 'translateY(20px)' },
  				to: { opacity: '1', transform: 'translateY(0)' },
  			},
  			'slide-in-right': {
  				from: { opacity: '0', transform: 'translateX(-20px)' },
  				to: { opacity: '1', transform: 'translateX(0)' },
  			},
  			'fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' },
  			},
  			'scale-in': {
  				from: { opacity: '0', transform: 'scale(0.95)' },
  				to: { opacity: '1', transform: 'scale(1)' },
  			},
  		},
  		transitionProperty: {
  			'height': 'height',
  			'spacing': 'margin, padding',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
