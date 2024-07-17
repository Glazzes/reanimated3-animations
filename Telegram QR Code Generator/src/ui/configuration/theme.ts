import { createTheme } from '@shopify/restyle';

const palette = {
  white: '#FFFFFF',
  black: '#000000',

  blackPrimary: '#1E1E1E',
  black2: '#232323',

  purpleLight: '#8C6FF7',
  purplePrimary: '#5A31F4',
  purpleDark: '#3F22AB',

  greenLight: '#56DCBA',
  greenPrimary: '#0ECD9D',
  greenDark: '#0A906E',
};

export const theme = createTheme({
  isDark: false,
  colors: {
    mainBackground: palette.white,

    // QR code generator
    patternBackground: palette.black,
    shareCodeText: palette.black2,
    shareButtonText: palette.white,
    shareBtnDisableBG: '#EBEBEB',

    cardPrimaryBackground: palette.purpleLight,
    titleColor: palette.black,
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },
  breakpoints: {
    xm: 0,
    sm: 400,
    md: 678,
    l: 1024,
  },
  textVariants: {
    defaults: {},
    title: {
      fontFamily: 'Inter-Bold',
      fontSize: 40,
    },
    body: {
      fontFamily: 'Inter-Regular',
    },
  },
});

export type Theme = typeof theme;

// Additional themes
export let darkTheme: Theme = {
  ...theme,
  isDark: true,
  colors: {
    ...theme.colors,
    mainBackground: palette.blackPrimary,
    shareCodeText: palette.white,
    shareBtnDisableBG: '#27272A',
    cardPrimaryBackground: palette.purpleLight,
  },
};
