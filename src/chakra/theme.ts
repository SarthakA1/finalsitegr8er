// 1. Import `extendTheme`
import { extendTheme } from "@chakra-ui/react"
import { Button } from './button'

// 2. Call `extendTheme` and pass your custom values
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#F8FAFC", // Slate-50 (Very close to white)
      100: "#F1F5F9", // Slate-100
      200: "#E2E8F0", // Slate-200
      300: "#CBD5E1", // Slate-300
      400: "#818CF8",
      500: "#6366F1", // Indigo-500 (Primary)
      600: "#4F46E5",
      700: "#4338CA",
      800: "#3730A3",
      900: "#312E81",
    },
    accent: {
      100: "#CCFBF1",
      200: "#99F6E4",
      300: "#5EEAD4",
      400: "#2DD4BF",
      500: "#14B8A6", // Teal-500 (Accent)
      600: "#0D9488",
    },
    fun: {
      pink: "#EC4899",
      purple: "#8B5CF6",
      cyan: "#06B6D4",
    }
  },
  fonts: {
    body: "var(--font-inter), sans-serif",
    heading: "var(--font-outfit), sans-serif",
  },
  styles: {
    global: () => ({
      body: {
        bg: "#fafafa", // Slate-900 or Slate-50
        // Aurora Mesh Gradients
        backgroundImage: "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 100% 0%, rgba(20, 184, 166, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)",
        backgroundAttachment: "fixed",
        color: "gray.800",
        cursor: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.77334 26.6508L4.35246 3.12053L25.9922 17.5855L14.71 18.2585L9.77334 26.6508Z' fill='%236366F1' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 2 2, auto`,
      },
      "button, a, [role='button']": {
        cursor: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.77334 26.6508L4.35246 3.12053L25.9922 17.5855L14.71 18.2585L9.77334 26.6508Z' fill='%236366F1' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 2 2, auto`
      },
      // Scrollbar styling for a cleaner look
      "::-webkit-scrollbar": {
        width: "8px",
      },
      "::-webkit-scrollbar-track": {
        bg: "gray.100",
      },
      "::-webkit-scrollbar-thumb": {
        bg: "gray.300",
        borderRadius: "full",
      },
    })
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "12px", // Modern slightly rounded corners
        fontWeight: "600",
        _focus: {
          boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.3)", // Focused ring
        },
      },
      variants: {
        solid: (props: any) => ({
          bg: "brand.600",
          color: "white",
          _hover: {
            bg: "brand.500",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)", // Strong Aurora Glow
          },
          _active: {
            transform: "translateY(0)",
          },
        }),
        outline: (props: any) => ({
          borderColor: "brand.500",
          color: "brand.600",
          _hover: {
            bg: "brand.50",
            transform: "translateY(-1px)",
          },
        }),
        ghost: {
          _hover: {
            bg: "blackAlpha.50",
            color: "brand.600",
          }
        },
        glass: (props: any) => ({
          bg: "whiteAlpha.600",
          backdropFilter: "blur(10px)",
          border: "1px solid",
          borderColor: "whiteAlpha.400",
          color: "gray.800",
          _hover: {
            bg: "whiteAlpha.800",
            transform: "translateY(-2px)",
            boxShadow: "lg",
          }
        })
      },
    },
    // Glassmorphic Modal & Card styles
    Modal: {
      baseStyle: (props: any) => ({
        dialog: {
          bg: "white",
          backdropFilter: "blur(16px)",
          borderRadius: "2xl",
          border: "1px solid",
          borderColor: "gray.100",
        }
      })
    },
    Menu: {
      baseStyle: (props: any) => ({
        list: {
          bg: "white",
          backdropFilter: "blur(12px)",
          border: "1px solid",
          borderColor: "gray.100",
          boxShadow: "xl",
          borderRadius: "xl",
        },
        item: {
          bg: "transparent",
          _focus: {
            bg: "gray.50",
          },
        }
      })
    },
    Card: {
      baseStyle: (props: any) => ({
        bg: "rgba(255, 255, 255, 0.8)", // Semi-transparent
        backdropFilter: "blur(20px)",
        border: "1px solid",
        borderColor: "whiteAlpha.600",
        borderRadius: "2xl",
        boxShadow: "0 8px 32px rgba(31, 38, 135, 0.05)",
      })
    }
  }
})
