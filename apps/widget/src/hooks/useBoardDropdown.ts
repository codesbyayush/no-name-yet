import { useEffect, useRef, useState } from 'react';

export function useBoardDropdown() {
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const boardDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (
        boardDropdownRef.current &&
        !boardDropdownRef.current.contains(e.target as Node)
      ) {
        setIsBoardOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsBoardOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return {
    isBoardOpen,
    setIsBoardOpen,
    boardDropdownRef,
  };
}
