import * as React from 'react';
import { createPortal } from 'react-dom';

type SidebarRightContextValue = {
  container: HTMLElement | null;
  setContainer: (el: HTMLElement | null) => void;
};

const SidebarRightContext =
  React.createContext<SidebarRightContextValue | null>(null);

export function SidebarRightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  const value = React.useMemo(() => ({ container, setContainer }), [container]);

  return (
    <SidebarRightContext.Provider value={value}>
      {children}
    </SidebarRightContext.Provider>
  );
}

export function useSidebarRight() {
  const ctx = React.useContext(SidebarRightContext);
  if (!ctx) {
    throw new Error('useSidebarRight must be used within SidebarRightProvider');
  }
  return ctx;
}

export function SidebarRightPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  const { container } = useSidebarRight();
  if (!container) {
    return null;
  }
  return createPortal(children, container);
}
