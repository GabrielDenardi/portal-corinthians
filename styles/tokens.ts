export const tokens = {
  colors: {
    black: "#0B0B0C",
    white: "#FFFFFF",
    grayDark: "#1C1C1F",
    grayMedium: "#6B7280",
    grayLight: "#E5E7EB",
    redAlert: "#B91C1C",
    greenSuccess: "#15803D",
    yellowWarning: "#CA8A04",
  },
  backgrounds: {
    app: "#0B0B0C",
    surface: "#141416",
    card: "#1C1C1F",
    cardHover: "#252529",
    light: "#F8F9FA",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#C7C9D1",
    muted: "#8B8E98",
    dark: "#111827",
  },
  border: {
    default: "#2A2A2E",
    light: "#D1D5DB",
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
  shadows: {
    card: "0 18px 48px rgba(0, 0, 0, 0.28)",
    feature: "0 32px 80px rgba(0, 0, 0, 0.42)",
  },
  typography: {
    display: {
      fontFamily: "var(--font-barlow-condensed)",
      fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
      lineHeight: "0.95",
      fontWeight: 700,
    },
    h1: {
      fontFamily: "var(--font-barlow-condensed)",
      fontSize: "clamp(2.2rem, 4vw, 3rem)",
      lineHeight: "1.05",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "var(--font-barlow-condensed)",
      fontSize: "clamp(1.75rem, 2.8vw, 2.35rem)",
      lineHeight: "1.1",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "var(--font-barlow-condensed)",
      fontSize: "1.5rem",
      lineHeight: "1.15",
      fontWeight: 600,
    },
    bodyLarge: {
      fontFamily: "var(--font-inter)",
      fontSize: "1.125rem",
      lineHeight: "1.6",
      fontWeight: 400,
    },
    body: {
      fontFamily: "var(--font-inter)",
      fontSize: "1rem",
      lineHeight: "1.6",
      fontWeight: 400,
    },
    bodySmall: {
      fontFamily: "var(--font-inter)",
      fontSize: "0.875rem",
      lineHeight: "1.45",
      fontWeight: 500,
    },
    caption: {
      fontFamily: "var(--font-inter)",
      fontSize: "0.75rem",
      lineHeight: "1.4",
      fontWeight: 500,
    },
  },
  layout: {
    contentMax: "1280px",
    headerHeight: "84px",
    paddingInline: {
      mobile: "16px",
      tablet: "24px",
      desktop: "32px",
    },
  },
  motion: {
    fast: "160ms",
    base: "220ms",
  },
} as const;

export type Tokens = typeof tokens;
