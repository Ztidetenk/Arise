/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                arise: {
                    blue: '#3b82f6',
                    violet: '#8b5cf6',
                    dark: '#020617',
                },
            },
        },
    },
    plugins: [],
};
