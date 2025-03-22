declare global {
  interface Window {
    env: {
      API_URL: string
    }
  }
}

// Permet d'utiliser window.env.API_URL sans erreur de TypeScript
export {}
