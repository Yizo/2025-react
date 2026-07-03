import type { ReactNode } from 'react';

export type ThreeNavigationItem = {
  key: string;
  title: string;
  element: ReactNode;
};

export type ThreeNavigationGroup = {
  key: string;
  title: string;
  items: ThreeNavigationItem[];
};
