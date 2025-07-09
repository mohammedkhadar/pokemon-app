import "../styles/globals.css"



import type { AppProps } from "next/app"
import { ReactQueryProvider } from "@/lib/react-query-provider"

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ReactQueryProvider>
      <Component {...pageProps} />
    </ReactQueryProvider>
  )
}
