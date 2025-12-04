// 1. Import `extendTheme`
import { extendTheme } from "@chakra-ui/react"
import { Button } from './button'

// 2. Call `extendTheme` and pass your custom values
export const theme = extendTheme({
  colors: {
    brand: {
      50: "#eef2ff",
      100: "#e0e7ff",
      500: "#6366f1", // Electric Indigo
      600: "#4f46e5", // Violet
      700: "#4338ca",
    },
    accent: {
      100: "#f3e8ff",
      500: "#a855f7", // Purple
    }
  },
  fonts: {
    body: "var(--font-inter), sans-serif",
    heading: "var(--font-outfit), sans-serif",
  },
  styles: {
    global: () => ({
      body: {
        bg: "gray.50",
        // Subtle mesh gradient background
        backgroundImage: "radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)",
        backgroundAttachment: "fixed",
        // We'll use a lighter version for the light mode, let's stick to a clean light mesh for now
        // Overriding the dark gradient above with a light one for the current light theme
        bgGradient: "linear(to-br, gray.50, brand.50, accent.100)",
        color: "gray.800",
      }
    })
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: "600",
        _focus: {
          boxShadow: "none",
        },
      },
      variants: {
        solid: {
          bgGradient: "linear(to-r, brand.500, brand.600)",
          color: "white",
          _hover: {
            bgGradient: "linear(to-r, brand.600, brand.700)",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)", // Glow effect
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
    // Card component style for consistency
    Card: {
      baseStyle: {
        bg: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid",
        borderColor: "whiteAlpha.300",
        borderRadius: "xl",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
      }
    }
  }
})
