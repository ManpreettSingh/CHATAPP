import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// 💡 IMPORTANT: Import the Tailwind CSS Vite plugin
import tailwindcss from '@tailwindcss/vite' 

export default defineConfig({
  plugins: [
    react(), 
    // 💡 Add the tailwindcss plugin here
    tailwindcss(), 
  ],
})