import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				jarvis: {
					gold: 'hsl(var(--jarvis-gold))',
					'gold-bright': 'hsl(var(--jarvis-gold-bright))',
					red: 'hsl(var(--jarvis-red))',
					'red-dark': 'hsl(var(--jarvis-red-dark))',
					black: 'hsl(var(--jarvis-black))',
					grey: 'hsl(var(--jarvis-grey))'
				},
				status: {
					online: 'hsl(var(--status-online))',
					warning: 'hsl(var(--status-warning))',
					error: 'hsl(var(--status-error))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'jarvis-pulse': {
					'0%, 100%': { 
						opacity: '1',
						boxShadow: '0 0 20px hsl(var(--jarvis-gold) / 0.5)'
					},
					'50%': { 
						opacity: '0.8',
						boxShadow: '0 0 40px hsl(var(--jarvis-gold) / 0.8), 0 0 60px hsl(var(--jarvis-red) / 0.4)'
					}
				},
				'eyes-glow': {
					'0%, 100%': { 
						filter: 'drop-shadow(0 0 10px hsl(var(--jarvis-gold-bright) / 0.6))'
					},
					'50%': { 
						filter: 'drop-shadow(0 0 30px hsl(var(--jarvis-gold-bright) / 1))'
					}
				},
				'typing-dots': {
					'0%, 20%': { opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'glow-ring': {
					'0%': { 
						transform: 'scale(1)',
						opacity: '1'
					},
					'100%': { 
						transform: 'scale(1.5)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'jarvis-pulse': 'jarvis-pulse 2s ease-in-out infinite',
				'eyes-glow': 'eyes-glow 1.5s ease-in-out infinite',
				'typing-dots': 'typing-dots 1.4s ease-in-out infinite',
				'glow-ring': 'glow-ring 2s ease-out infinite'
			},
			boxShadow: {
				'jarvis-glow': '0 0 30px hsl(var(--jarvis-gold) / 0.3)',
				'jarvis-glow-strong': '0 0 50px hsl(var(--jarvis-gold) / 0.6)',
				'red-glow': '0 0 20px hsl(var(--jarvis-red) / 0.4)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
