// We use NextJS font integration
// Docs https://nextjs.org/docs/pages/building-your-application/optimizing/fonts#google-fonts
// Docs https://nextjs.org/docs/pages/building-your-application/optimizing/fonts#with-tailwind-css

// Preview https://fonts.google.com/specimen/Red+Hat+Text
import { clsx } from "clsx"
import { Red_Hat_Text } from "next/font/google"
export const fontRedHatText = Red_Hat_Text({
  subsets: ["latin"],
  weight: [
    // REMINDER: Also update the tailwind config
    "400", // regular
    "500", // medium
    "600", // semibold
    "700", // extrabold
  ],
  style: ["normal", "italic"],
  variable: "--font-red-hat-text",
  display: "swap",
})

// INTEGRATION
export const fontClasses = clsx(fontRedHatText.variable)
