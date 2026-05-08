import type { ThemeConfig } from 'antd';

/**
 * AntD ConfigProvider theme — keeps tokens in sync with our Tailwind brand.
 * We only use AntD for: Tables, Buttons, Tabs, Modals, Dropdowns.
 */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#014B52',
    colorInfo: '#006494',
    colorSuccess: '#437A22',
    colorWarning: '#DA7101',
    colorError: '#B42318',
    colorTextBase: '#28251D',
    colorBgBase: '#FBFAF7',
    colorBorder: 'rgba(40, 37, 29, 0.11)',
    borderRadius: 12,
    fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif",
    fontSize: 14,
    controlHeight: 40,
    motionDurationMid: '0.18s',
  },
  components: {
    Button: {
      controlHeight: 40,
      fontWeight: 600,
      primaryShadow: 'none',
    },
    Table: {
      headerBg: '#F2EFE9',
      headerColor: '#6C665D',
      rowHoverBg: '#F2EFE9',
      borderColor: '#EBE7DF',
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
    },
    Tabs: {
      itemColor: '#6C665D',
      itemActiveColor: '#014B52',
      itemSelectedColor: '#014B52',
      inkBarColor: '#F5A800',
      titleFontSize: 14,
    },
    Modal: {
      borderRadiusLG: 24,
      titleFontSize: 22,
    },
    Dropdown: {
      borderRadiusLG: 14,
      paddingBlock: 8,
    },
    Pagination: {
      itemActiveBg: 'rgba(1, 75, 82, 0.08)',
    },
    Switch: {
      colorPrimary: '#014B52',
      colorPrimaryHover: '#013D43',
    },
  },
};
