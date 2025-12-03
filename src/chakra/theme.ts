// 1. Import `extendTheme`
import '@fontsource/open-sans/300.css'
import '@fontsource/open-sans/400.css'
import '@fontsource/open-sans/700.css'
import { extendTheme } from "@chakra-ui/react"
import { Button } from './button'

// 2. Call `extendTheme` and pass your custom values
export const theme = extendTheme({
  colors: {
    brand: {
      100: "#4682B4", // Steel Blue
      500: "#4682B4", // Steel Blue for buttons/highlights
      600: "#315b7d", // Darker Steel Blue for hover
    },
  },
  fonts: {
    body: "Open Sans, sans-serif",
    heading: "Open Sans, sans-serif",
  },
  styles: {
    global: () => ({
      body: {
        bg: "gray.100",
      }
    })
  },
  components: {
    Button,
  }
})
