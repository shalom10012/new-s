import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // This 'define' block makes environment variables available to your client-side code.
  // Vite will replace any occurrence of 'process.env.API_KEY' in your code
  // with the value of the API_KEY from the environment it's running in.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  plugins: [react()],
})
