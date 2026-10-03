import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { darkThemeConfig, lightThemeConfig } from '@/styles/themeConfig';
import { AuthProvider } from '@/store/AuthContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

const ThemedAppRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <ConfigProvider theme={isDark ? darkThemeConfig : lightThemeConfig}>
      <AntdApp>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <ThemedAppRoot>
        {children}
      </ThemedAppRoot>
    </ThemeProvider>
  );
};
