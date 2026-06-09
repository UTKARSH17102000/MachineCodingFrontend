import { useState, useCallback } from 'react';

export function useTabs(initialTab) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const select = useCallback((id) => setActiveTab(id), []);
  return { activeTab, select };
}
