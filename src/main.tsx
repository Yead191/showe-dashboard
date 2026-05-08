import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { router } from './routes';
import { antdTheme } from './lib/antd-theme';

import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={antdTheme}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        offset={20}
        closeButton
        duration={3500}
        toastOptions={{
          classNames: {
            toast: '!shadow-medium !border-line',
            title: 'font-semibold',
          },
        }}
      />
    </ConfigProvider>
  </StrictMode>
);
