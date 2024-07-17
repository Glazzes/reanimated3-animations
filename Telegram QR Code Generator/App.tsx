import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@shopify/restyle';

import QRCodeGenerator from './src';
import { darkTheme, theme } from '@ui/configuration/theme';
import { listenTothemeChangeEvent } from '@events/index';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const sub = listenTothemeChangeEvent(() => {
      setIsDark((prev) => !prev);
    });

    return () => {
      sub.remove();
    };
  });

  return (
    <GestureHandlerRootView>
      <ThemeProvider theme={isDark ? darkTheme : theme}>
        <QRCodeGenerator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
