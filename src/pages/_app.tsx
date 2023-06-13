// import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import { theme } from '../chakra/theme'
import Layout from '@/components/layout/layout'
import { RecoilRoot } from 'recoil'

function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
    <ChakraProvider theme={theme}>
      <Layout>
      <Component {...pageProps}/>
      </Layout>
    </ChakraProvider>
    </RecoilRoot>
  )
}

export default App;
