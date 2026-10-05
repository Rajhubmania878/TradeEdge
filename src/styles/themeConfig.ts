import { theme } from 'antd';
import { blue, cyan, green, red, gold, volcano, purple, geekblue } from '@ant-design/colors';

export const darkThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: geekblue[5], // #3c89e8 (Ant Geekblue)
    colorSuccess: green[5],   // #49aa19 (Ant Green)
    colorError: red[5],       // #dc4446 (Ant Red)
    colorWarning: gold[5],    // #d89614 (Ant Gold)
    colorInfo: blue[5],       // #177ddc (Ant Blue)
    colorBgBase: '#0b0f19',
    colorBgContainer: '#121826',
    colorBgElevated: '#1a2234',
    colorBgLayout: '#0b0f19',
    colorBgSpotlight: '#1a2234',
    colorBorder: '#2d374d',
    colorBorderSecondary: '#1f293d',
    colorText: '#f9fafb',
    colorTextSecondary: '#9ca3af',
    colorTextTertiary: '#6b7280',
    colorTextQuaternary: '#4b5563',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontFamilyCode: "'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    borderRadius: 8,
    borderRadiusLG: 8,
    borderRadiusSM: 8,
    borderRadiusXS: 8,
    borderRadiusOuter: 8,
    controlHeight: 38,
    fontSize: 13,
    fontSizeSM: 11,
    fontSizeLG: 15,
    fontSizeXL: 18,
    fontSizeHeading1: 28,
    fontSizeHeading2: 22,
    fontSizeHeading3: 18,
    fontSizeHeading4: 15,
    fontSizeHeading5: 13,
    lineHeight: 1.4,
    lineHeightSM: 1.28,
    lineHeightLG: 1.45,
    lineHeightHeading1: 1.25,
    lineHeightHeading2: 1.3,
    lineHeightHeading3: 1.35,
    lineHeightHeading4: 1.38,
    lineHeightHeading5: 1.4,
    fontWeightStrong: 600,
  },
  components: {
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
      colorText: '#f9fafb',
      colorTextSecondary: '#9ca3af',
      colorTextDescription: '#6b7280',
    },
    Button: {
      controlHeight: 38,
      borderRadius: 8,
      fontWeight: 600,
      colorPrimary: geekblue[5],
      colorPrimaryHover: geekblue[4],
      colorPrimaryActive: geekblue[6],
    },
    Select: {
      controlHeight: 38,
      borderRadius: 8,
      colorBgContainer: '#121826',
      colorBorder: '#2d374d',
    },
    Input: {
      controlHeight: 38,
      borderRadius: 8,
      colorBgContainer: '#121826',
      colorBorder: '#2d374d',
    },
    InputNumber: {
      controlHeight: 38,
      borderRadius: 8,
      colorBgContainer: '#121826',
      colorBorder: '#2d374d',
    },
    Segmented: {
      trackBg: '#0b0f19',
      itemSelectedBg: '#1a2234',
      itemSelectedColor: '#ffffff',
      itemHoverBg: 'rgba(26, 34, 52, 0.6)',
      itemColor: '#9ca3af',
      borderRadius: 8,
    },
    Modal: {
      contentBg: '#121826',
      headerBg: '#121826',
      titleColor: '#f9fafb',
      titleFontSize: 16,
    },
    Drawer: {
      colorBgElevated: '#121826',
      titleFontSize: 16,
    },
    Tag: {
      borderRadius: 4,
      fontSize: 11,
      lineHeight: 1.28,
    },
    Table: {
      colorBgContainer: '#0b0f19',
      headerBg: '#121826',
      borderColor: '#1f293d',
      fontSize: 12,
      headerBorderRadius: 0,
      borderRadius: 0,
    },
    Card: {
      colorBgContainer: '#121826',
      colorBorderSecondary: '#2d374d',
      headerFontSize: 15,
    }
  }
};

export const lightThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: geekblue[6], // #2f54eb (Ant Geekblue Primary)
    colorSuccess: green[6],   // #52c41a (Ant Primary Green)
    colorError: red[5],       // #ff4d4f (Ant Primary Red)
    colorWarning: gold[6],    // #faad14 (Ant Primary Gold)
    colorInfo: blue[6],       // #1677ff (Ant Primary Blue)
    colorBgBase: '#f8fafc',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f1f5f9',
    colorBgSpotlight: '#0f172a',
    colorBorder: '#cbd5e1',
    colorBorderSecondary: '#e2e8f0',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#64748b',
    colorTextQuaternary: '#94a3b8',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontFamilyCode: "'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    borderRadius: 8,
    borderRadiusLG: 8,
    borderRadiusSM: 8,
    borderRadiusXS: 8,
    borderRadiusOuter: 8,
    controlHeight: 38,
    fontSize: 13,
    fontSizeSM: 11,
    fontSizeLG: 15,
    fontSizeXL: 18,
    fontSizeHeading1: 28,
    fontSizeHeading2: 22,
    fontSizeHeading3: 18,
    fontSizeHeading4: 15,
    fontSizeHeading5: 13,
    lineHeight: 1.4,
    lineHeightSM: 1.28,
    lineHeightLG: 1.45,
    lineHeightHeading1: 1.25,
    lineHeightHeading2: 1.3,
    lineHeightHeading3: 1.35,
    lineHeightHeading4: 1.38,
    lineHeightHeading5: 1.4,
    fontWeightStrong: 600,
  },
  components: {
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
      colorText: '#0f172a',
      colorTextSecondary: '#475569',
      colorTextDescription: '#64748b',
    },
    Button: {
      controlHeight: 38,
      borderRadius: 8,
      fontWeight: 600,
      colorPrimary: geekblue[6],
      colorPrimaryHover: geekblue[5],
      colorPrimaryActive: geekblue[7],
    },
    Select: {
      controlHeight: 38,
      borderRadius: 8,
      colorBgContainer: '#ffffff',
      colorBorder: '#cbd5e1',
    },
    Input: {
      controlHeight: 38,
      borderRadius: 8,
      colorBgContainer: '#ffffff',
      colorBorder: '#cbd5e1',
    },
    InputNumber: {
      controlHeight: 38,
      borderRadius: 8,
      colorBgContainer: '#ffffff',
      colorBorder: '#cbd5e1',
    },
    Segmented: {
      trackBg: '#e2e8f0',
      itemSelectedBg: '#ffffff',
      itemSelectedColor: '#0f172a',
      itemHoverBg: 'rgba(255, 255, 255, 0.6)',
      itemColor: '#475569',
      borderRadius: 8,
    },
    Modal: {
      contentBg: '#ffffff',
      headerBg: '#ffffff',
      titleColor: '#0f172a',
      titleFontSize: 16,
    },
    Drawer: {
      colorBgElevated: '#ffffff',
      titleFontSize: 16,
    },
    Tag: {
      borderRadius: 4,
      fontSize: 11,
      lineHeight: 1.28,
    },
    Table: {
      colorBgContainer: '#ffffff',
      headerBg: '#f8fafc',
      borderColor: '#e2e8f0',
      fontSize: 12,
      headerBorderRadius: 0,
      borderRadius: 0,
    },
    Card: {
      colorBgContainer: '#ffffff',
      colorBorderSecondary: '#e2e8f0',
      headerFontSize: 15,
    }
  }
};


