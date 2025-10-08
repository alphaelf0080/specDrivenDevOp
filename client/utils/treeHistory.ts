/**
 * 樹狀圖瀏覽歷史追蹤
 */

export interface TreeHistoryItem {
  id: string;
  name: string;
  path: string;
  visitedAt: string;
}

const STORAGE_KEY = 'tree_diagram_history';
const MAX_HISTORY = 3;

/**
 * 記錄樹狀圖訪問
 */
export function recordTreeVisit(id: string, name: string, path: string): void {
  try {
    const history = getTreeHistory();
    
    // 移除重複項目
    const filtered = history.filter(item => item.id !== id);
    
    // 加入新記錄到最前面
    const newItem: TreeHistoryItem = {
      id,
      name,
      path,
      visitedAt: new Date().toISOString(),
    };
    
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to record tree visit:', error);
  }
}

/**
 * 取得樹狀圖訪問歷史
 */
export function getTreeHistory(): TreeHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to get tree history:', error);
    return [];
  }
}

/**
 * 清除所有歷史記錄
 */
export function clearTreeHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear tree history:', error);
  }
}

/**
 * 格式化時間顯示
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '剛剛';
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-TW');
}
