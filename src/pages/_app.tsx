// import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import { theme } from '../chakra/theme'
import Layout from '@/components/layout/layout'
import { RecoilRoot } from 'recoil';
import '../lib/css/customstyle.css';
import { Outfit, Inter } from '@next/font/google'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <style jsx global>{`
        :root {
          --font-outfit: ${outfit.style.fontFamily};
          --font-inter: ${inter.style.fontFamily};
        }
      `}</style>
      <ChakraProvider theme={theme}>
        <Layout>
          <main className={`${outfit.variable} ${inter.variable}`}>
            <Component {...pageProps} />
          </main>
        </Layout>
      </ChakraProvider>
    </RecoilRoot>
  )
}

export default App;
