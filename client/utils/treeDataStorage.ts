/**
 * 樹狀圖資料持久化儲存工具
 * 
 * 功能：
 * - 將編輯後的樹狀圖資料儲存到 localStorage
 * - 從 localStorage 載入已儲存的資料
 * - 支援多個不同的樹狀圖頁面（透過唯一 key）
 * - 自動合併原始資料與已儲存的編輯資料
 */

import { TreeNode } from '../components/Tree/TreeDiagram';

const STORAGE_PREFIX = 'tree-data-';

/**
 * 儲存樹狀圖資料到 localStorage
 * @param pageKey 頁面唯一識別碼 (例如: 'ui-layout', 'psd-structure')
 * @param treeData 完整的樹狀圖資料
 */
export function saveTreeData(pageKey: string, treeData: TreeNode): void {
  try {
    const storageKey = `${STORAGE_PREFIX}${pageKey}`;
    const dataString = JSON.stringify(treeData);
    localStorage.setItem(storageKey, dataString);
    console.log(`[TreeDataStorage] 已儲存: ${pageKey}`);
  } catch (error) {
    console.error('[TreeDataStorage] 儲存失敗:', error);
  }
}

/**
 * 從 localStorage 載入樹狀圖資料
 * @param pageKey 頁面唯一識別碼
 * @returns 已儲存的樹狀圖資料，若無則返回 null
 */
export function loadTreeData(pageKey: string): TreeNode | null {
  try {
    const storageKey = `${STORAGE_PREFIX}${pageKey}`;
    const dataString = localStorage.getItem(storageKey);
    
    if (!dataString) {
      return null;
    }
    
    const treeData = JSON.parse(dataString) as TreeNode;
    console.log(`[TreeDataStorage] 已載入: ${pageKey}`);
    return treeData;
  } catch (error) {
    console.error('[TreeDataStorage] 載入失敗:', error);
    return null;
  }
}

/**
 * 合併已儲存的資料與原始資料
 * 保留已編輯的 metadata，但使用原始資料的結構
 * 
 * @param originalTree 原始樹狀圖資料（從 JSON 檔案載入）
 * @param savedTree 已儲存的樹狀圖資料（從 localStorage 載入）
 * @returns 合併後的樹狀圖資料
 */
export function mergeTreeData(originalTree: TreeNode, savedTree: TreeNode | null): TreeNode {
  if (!savedTree) {
    return originalTree;
  }

  const savedNodeIndex = new Map<string, TreeNode>();

  const cloneNode = (node: TreeNode): TreeNode => ({
    ...node,
    children: node.children ? node.children.map(cloneNode) : undefined,
    metadata: node.metadata ? { ...node.metadata } : node.metadata,
  });

  const buildIndex = (node: TreeNode) => {
    savedNodeIndex.set(node.id, node);
    node.children?.forEach(buildIndex);
  };

  buildIndex(savedTree);

  const mergeNode = (originalNode: TreeNode, savedNode?: TreeNode): TreeNode => {
    if (!savedNode) {
      return {
        ...originalNode,
        children: originalNode.children?.map(child => mergeNode(child)),
        metadata: originalNode.metadata ? { ...originalNode.metadata } : originalNode.metadata,
      };
    }

    const { children: savedChildren, metadata: savedMetadata, ...savedRest } = savedNode;

    const merged: TreeNode = {
      ...originalNode,
      ...savedRest,
    };

    if (Object.prototype.hasOwnProperty.call(savedNode, 'metadata')) {
      if (savedMetadata === undefined || savedMetadata === null) {
        merged.metadata = undefined;
      } else {
        merged.metadata = {
          ...(originalNode.metadata || {}),
          ...savedMetadata,
        };
      }
    } else if (originalNode.metadata) {
      merged.metadata = { ...originalNode.metadata };
    }

    const originalChildren = originalNode.children ?? [];
    const savedChildrenList = savedChildren ?? [];
    const savedChildrenMap = new Map(savedChildrenList.map(child => [child.id, child] as const));

    const mergedChildren: TreeNode[] = originalChildren.map(child =>
      mergeNode(child, savedChildrenMap.get(child.id))
    );

    const originalChildIds = new Set(originalChildren.map(child => child.id));
    savedChildrenList.forEach(child => {
      if (!originalChildIds.has(child.id)) {
        mergedChildren.push(cloneNode(child));
      }
    });

    merged.children = mergedChildren.length > 0 ? mergedChildren : undefined;

    return merged;
  };

  return mergeNode(originalTree, savedNodeIndex.get(originalTree.id));
}

/**
 * 清除指定頁面的已儲存資料
 * @param pageKey 頁面唯一識別碼
 */
export function clearTreeData(pageKey: string): void {
  try {
    const storageKey = `${STORAGE_PREFIX}${pageKey}`;
    localStorage.removeItem(storageKey);
    console.log(`[TreeDataStorage] 已清除: ${pageKey}`);
  } catch (error) {
    console.error('[TreeDataStorage] 清除失敗:', error);
  }
}

/**
 * 檢查是否有已儲存的資料
 * @param pageKey 頁面唯一識別碼
 * @returns 是否存在已儲存的資料
 */
export function hasTreeData(pageKey: string): boolean {
  try {
    const storageKey = `${STORAGE_PREFIX}${pageKey}`;
    return localStorage.getItem(storageKey) !== null;
  } catch (error) {
    return false;
  }
}

/**
 * 獲取已儲存資料的最後修改時間
 * （需要額外儲存時間戳記，此為擴展功能）
 */
export function getLastModifiedTime(pageKey: string): Date | null {
  try {
    const timestampKey = `${STORAGE_PREFIX}${pageKey}-timestamp`;
    const timestamp = localStorage.getItem(timestampKey);
    return timestamp ? new Date(parseInt(timestamp, 10)) : null;
  } catch (error) {
    return null;
  }
}

/**
 * 儲存時同時記錄時間戳記
 */
export function saveTreeDataWithTimestamp(pageKey: string, treeData: TreeNode): void {
  saveTreeData(pageKey, treeData);
  try {
    const timestampKey = `${STORAGE_PREFIX}${pageKey}-timestamp`;
    localStorage.setItem(timestampKey, Date.now().toString());
  } catch (error) {
    console.error('[TreeDataStorage] 時間戳記儲存失敗:', error);
  }
}

/**
 * 匯出樹狀圖資料為 JSON 檔案
 * @param pageKey 頁面唯一識別碼
 * @param treeData 樹狀圖資料
 * @param filename 檔案名稱（不含副檔名）
 */
export function exportTreeDataToFile(pageKey: string, treeData: TreeNode, filename?: string): void {
  try {
    const dataString = JSON.stringify(treeData, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename || pageKey}-tree-data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(`[TreeDataStorage] 已匯出: ${filename || pageKey}`);
  } catch (error) {
    console.error('[TreeDataStorage] 匯出失敗:', error);
  }
}

/**
 * 從 JSON 檔案匯入樹狀圖資料
 * @param file File 物件
 * @returns Promise<TreeNode>
 */
export function importTreeDataFromFile(file: File): Promise<TreeNode> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const dataString = event.target?.result as string;
        const treeData = JSON.parse(dataString) as TreeNode;
        console.log('[TreeDataStorage] 已匯入檔案');
        resolve(treeData);
      } catch (error) {
        console.error('[TreeDataStorage] 匯入失敗:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('檔案讀取失敗'));
    };
    
    reader.readAsText(file);
  });
}
