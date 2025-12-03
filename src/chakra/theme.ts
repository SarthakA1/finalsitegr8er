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
      50: "#eef6fc",
      100: "#dbeafe",
      500: "#4682B4", // Steel Blue
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
        bg: "gray.50", // Lighter, cleaner gray
        color: "gray.800",
      }
    })
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full", // Modern rounded buttons
        fontWeight: "600",
        _focus: {
          boxShadow: "none", // Remove default blue ring
        },
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
            transform: "translateY(-1px)",
            boxShadow: "md",
          },
          _active: {
            transform: "translateY(0)",
          },
        },
        outline: {
          borderColor: "brand.500",
          color: "brand.500",
          _hover: {
            bg: "brand.50",
            transform: "translateY(-1px)",
            boxShadow: "sm",
          },
        },
        ghost: {
          _hover: {
            bg: "brand.50",
            color: "brand.600",
          },
        },
      },
    },
    // Add Card component style for consistency if used, or just generic Box usage
  }
})
