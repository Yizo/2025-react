import { createRoot } from 'react-dom/client';
import { ConfigProvider, App, theme, type ThemeConfig } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useAppSelector } from '@/store';
import { persistor as persistorStore } from '@/store';
import store from '@/store';
import zhCN from 'antd/locale/zh_CN';
import Router from '@/router';
import '@/styles/index.css';

dayjs.locale('zh-cn');

function LoadingScreen() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div>正在加载...</div>
    </div>
  );
}

function AppContent() {
  const systemTheme = useAppSelector((state) => state.system.theme);
  const appTheme = useMemo(() => {
    const base: ThemeConfig = {
      algorithm: systemTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        // colorPrimary: 'var(--color-primary)',
        // colorTextBase: 'var(--color-primary-content)',
        // colorPrimaryText: 'var(--color-primary-content)',
        colorPrimary: '#fa8c16',
        colorTextBase: '#fdd5a6d9',
        colorPrimaryText: '#fdd5a6d9',
      },
      components: {
        Layout: {},
        Menu: {
          darkItemBg: 'var(--color-base-100)',
          darkSubMenuItemBg: 'var(--color-base-200)',
        },
      },
    };

    return base;
  }, [systemTheme]);

  useEffect(() => {
    document.body.setAttribute('data-theme', systemTheme);
  }, [systemTheme]);

  return (
    <ConfigProvider locale={zhCN} theme={appTheme}>
      <App>
        <Router />
      </App>
    </ConfigProvider>
  );
}

export function MainApp() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistorStore}>
        <AppContent />
      </PersistGate>
    </ReduxProvider>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<MainApp />);
// 关闭loading
const firstElement = document.getElementById('first');
if (firstElement && firstElement.style?.display !== 'none') {
  firstElement.style.display = 'none';
}
