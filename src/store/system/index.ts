import type { System } from './system';
import {
  systemSlice,
  setSystemName,
  setTheme,
  setSystem,
  addLoading,
  removeLoading,
  resetLoading,
  toggleTheme,
} from './system';
import { setThemeVariables, getAntdThemeTokens } from './theme';

import reducer from './system';

export {
  systemSlice,
  setSystemName,
  setTheme,
  setSystem,
  addLoading,
  removeLoading,
  resetLoading,
  toggleTheme,
  reducer,
  setThemeVariables,
  getAntdThemeTokens,
  type System,
};
