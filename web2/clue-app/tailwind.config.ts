import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      gridTemplateRows: {
        // Create a 25 row grid
        '25': 'repeat(25, minmax(0, 1fr))',
      },
      gridTemplateColumns: {
        // Create a 25 column grid
        '25': 'repeat(25, minmax(0, 1fr))',
      },
      height: {
        '1/24': '4.166666%',
      },
      width: {
        '1/25': '4%',
      },
      colors: {
        'periwinkle': {
          DEFAULT: '#babeee',
        },
        'lavender': {
          DEFAULT: '#7573b6',
        },
        'turquoise': {
          DEFAULT: '#70acb4',
        },
        'aqua': {
          DEFAULT: '#90d2c3',
        },
        'chartreuse': {
          DEFAULT: '#ecf4be',
        },
      },
    },
  },
  plugins: [],
};

export default config;