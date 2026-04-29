/**
 * this is unsed file
 * because we are using vite-plugin-pages for routing
 * default file is src/pages/index.tsx
 * 
 * This file is kept for reference and future use.
*/ 

// function App() {
//     return (
//         <>
//         </>
//     )
// }

// export default App


import type { ComponentType } from "react"

type AppProps = {
  Component: ComponentType<unknown>
  pageProps?: Record<string, unknown>
}

export function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}