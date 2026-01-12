// import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import { DefaultSeo } from 'next-seo';
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
      <DefaultSeo
        titleTemplate="%s | GR8ER IB"
        defaultTitle="GR8ER IB | The Best IB Resources"
        description="The all-in-one resource hub trusted by top achievers worldwide. Access IB MYP and DP resources, past papers, and expert guides."
        openGraph={{
          type: 'website',
          locale: 'en_IE',
          url: 'https://www.gr8er.live/',
          siteName: 'GR8ER IB',
        }}
        twitter={{
          handle: '@gr8er_ib',
          site: '@gr8er_ib',
          cardType: 'summary_large_image',
        }}
      />



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
