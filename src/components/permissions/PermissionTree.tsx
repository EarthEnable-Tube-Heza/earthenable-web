"use client";

/**
 * Permission Tree Component
 *
 * Hierarchical checkbox tree for selecting permissions with access levels.
 * Supports parent-child relationships and bulk selection.
 */

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/src/lib/theme";
import type { PermissionTreeNode } from "@/src/types/permission";

type AccessLevel = "full" | "read_only" | "none";

interface PermissionSelection {
  permission_key: string;
  access_level: AccessLevel;
}

interface PermissionTreeProps {
  permissions: PermissionTreeNode[];
  selectedPermissions: PermissionSelection[];
  onChange: (permissions: PermissionSelection[]) => void;
  disabled?: boolean;
}

interface TreeNodeProps {
  node: PermissionTreeNode;
  level: number;
  selectedPermissions: Map<string, AccessLevel>;
  onToggle: (key: string, accessLevel: AccessLevel | null) => void;
  onAccessLevelChange: (key: string, accessLevel: AccessLevel) => void;
  disabled?: boolean;
  expandedNodes: Set<string>;
  onToggleExpand: (key: string) => void;
}

function TreeNode({
  node,
  level,
  selectedPermissions,
  onToggle,
  onAccessLevelChange,
  disabled,
  expandedNodes,
  onToggleExpand,
}: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.key);
  const currentSelection = selectedPermissions.get(node.key);
  const isSelected = currentSelection !== undefined && currentSelection !== "none";

  // Check if any children are selected
  const getChildSelectionState = useCallback((): "all" | "some" | "none" => {
    if (!hasChildren) return isSelected ? "all" : "none";

    const checkChildren = (children: PermissionTreeNode[]): { selected: number; total: number } => {
      let selected = 0;
      let total = 0;

      for (const child of children) {
        const childSelection = selectedPermissions.get(child.key);
        if (childSelection && childSelection !== "none") {
          selected++;
        }
        total++;

        if (child.children && child.children.length > 0) {
          const childResult = checkChildren(child.children);
          selected += childResult.selected;
          total += childResult.total;
        }
      }

      return { selected, total };
    };

    const result = checkChildren(node.children);
    if (result.selected === 0) return "none";
    if (result.selected === result.total) return "all";
    return "some";
  }, [hasChildren, isSelected, node.children, selectedPermissions]);

  const childSelectionState = getChildSelectionState();

  const handleCheckboxChange = () => {
    if (isSelected) {
      onToggle(node.key, null);
    } else {
      onToggle(node.key, "full");
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md hover:bg-background-light transition-colors",
          level > 0 && "ml-6"
        )}
      >
        {/* Expand/Collapse button for nodes with children */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.key)}
            className="w-5 h-5 flex items-center justify-center text-text-secondary hover:text-text-primary"
            disabled={disabled}
          >
            <svg
              className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Checkbox */}
        <label className="flex items-center gap-3 flex-1 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={isSelected || childSelectionState !== "none"}
              onChange={handleCheckboxChange}
              disabled={disabled}
              className="sr-only"
            />
            <div
              className={cn(
                "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                isSelected || childSelectionState === "all"
                  ? "bg-primary border-primary"
                  : childSelectionState === "some"
                    ? "bg-primary/50 border-primary"
                    : "border-border-medium bg-white",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {(isSelected || childSelectionState !== "none") && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                  {childSelectionState === "some" && !isSelected ? (
                    <rect x="2" y="5" width="8" height="2" rx="1" />
                  ) : (
                    <path d="M10.28 2.28a.75.75 0 00-1.06-1.06L4.5 5.94 2.78 4.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25z" />
                  )}
                </svg>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="font-medium text-sm text-text-primary">{node.name}</div>
            {node.description && (
              <div className="text-xs text-text-secondary">{node.description}</div>
            )}
          </div>
        </label>

        {/* Access Level Selector */}
        {isSelected && (
          <select
            value={currentSelection}
            onChange={(e) => onAccessLevelChange(node.key, e.target.value as AccessLevel)}
            disabled={disabled}
            className={cn(
              "text-xs px-2 py-1 rounded border border-border-light bg-white",
              "focus:outline-none focus:ring-1 focus:ring-primary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <option value="full">Full Access</option>
            <option value="read_only">Read Only</option>
          </select>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="border-l-2 border-border-light ml-5">
          {node.children.map((child) => (
            <TreeNode
              key={child.key}
              node={child}
              level={level + 1}
              selectedPermissions={selectedPermissions}
              onToggle={onToggle}
              onAccessLevelChange={onAccessLevelChange}
              disabled={disabled}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PermissionTree({
  permissions,
  selectedPermissions,
  onChange,
  disabled = false,
}: PermissionTreeProps) {
  // Convert array to Map for efficient lookups
  const selectedMap = useMemo(() => {
    const map = new Map<string, AccessLevel>();
    selectedPermissions.forEach((p) => {
      map.set(p.permission_key, p.access_level);
    });
    return map;
  }, [selectedPermissions]);

  // Track expanded nodes
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Initially expand top-level nodes
    return new Set(permissions.map((p) => p.key));
  });

  const handleToggleExpand = useCallback((key: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // Collect all descendant keys for a node
  const getAllDescendantKeys = useCallback((node: PermissionTreeNode): string[] => {
    const keys: string[] = [];
    const collect = (n: PermissionTreeNode) => {
      keys.push(n.key);
      if (n.children) {
        n.children.forEach(collect);
      }
    };
    collect(node);
    return keys;
  }, []);

  // Find a node by key
  const findNode = useCallback(
    (key: string, nodes: PermissionTreeNode[] = permissions): PermissionTreeNode | null => {
      for (const node of nodes) {
        if (node.key === key) return node;
        if (node.children) {
          const found = findNode(key, node.children);
          if (found) return found;
        }
      }
      return null;
    },
    [permissions]
  );

  const handleToggle = useCallback(
    (key: string, accessLevel: AccessLevel | null) => {
      const newSelected = new Map(selectedMap);
      const node = findNode(key);

      if (accessLevel === null) {
        // Removing - remove this node and all descendants
        if (node) {
          const keys = getAllDescendantKeys(node);
          keys.forEach((k) => newSelected.delete(k));
        } else {
          newSelected.delete(key);
        }
      } else {
        // Adding - add this node and all descendants with the same access level
        if (node) {
          const keys = getAllDescendantKeys(node);
          keys.forEach((k) => newSelected.set(k, accessLevel));
        } else {
          newSelected.set(key, accessLevel);
        }
      }

      // Convert back to array
      const result: PermissionSelection[] = [];
      newSelected.forEach((level, permKey) => {
        result.push({ permission_key: permKey, access_level: level });
      });
      onChange(result);
    },
    [selectedMap, findNode, getAllDescendantKeys, onChange]
  );

  const handleAccessLevelChange = useCallback(
    (key: string, accessLevel: AccessLevel) => {
      const newSelected = new Map(selectedMap);
      newSelected.set(key, accessLevel);

      // Convert back to array
      const result: PermissionSelection[] = [];
      newSelected.forEach((level, permKey) => {
        result.push({ permission_key: permKey, access_level: level });
      });
      onChange(result);
    },
    [selectedMap, onChange]
  );

  // Expand/collapse all
  const handleExpandAll = () => {
    const allKeys: string[] = [];
    const collectKeys = (nodes: PermissionTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allKeys.push(node.key);
          collectKeys(node.children);
        }
      });
    };
    collectKeys(permissions);
    setExpandedNodes(new Set(allKeys));
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Select/deselect all
  const handleSelectAll = () => {
    const allKeys: PermissionSelection[] = [];
    const collectKeys = (nodes: PermissionTreeNode[]) => {
      nodes.forEach((node) => {
        allKeys.push({ permission_key: node.key, access_level: "full" });
        if (node.children) {
          collectKeys(node.children);
        }
      });
    };
    collectKeys(permissions);
    onChange(allKeys);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleExpandAll}
          disabled={disabled}
          className="text-xs px-2 py-1 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
        >
          Expand All
        </button>
        <button
          type="button"
          onClick={handleCollapseAll}
          disabled={disabled}
          className="text-xs px-2 py-1 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
        >
          Collapse All
        </button>
        <span className="text-border-medium">|</span>
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={disabled}
          className="text-xs px-2 py-1 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={handleDeselectAll}
          disabled={disabled}
          className="text-xs px-2 py-1 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
        >
          Deselect All
        </button>
        <span className="text-xs text-text-secondary ml-auto">
          {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? "s" : ""}{" "}
          selected
        </span>
      </div>

      {/* Tree */}
      <div className="border border-border-light rounded-lg p-2 max-h-[400px] overflow-y-auto">
        {permissions.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">No permissions available</div>
        ) : (
          permissions.map((node) => (
            <TreeNode
              key={node.key}
              node={node}
              level={0}
              selectedPermissions={selectedMap}
              onToggle={handleToggle}
              onAccessLevelChange={handleAccessLevelChange}
              disabled={disabled}
              expandedNodes={expandedNodes}
              onToggleExpand={handleToggleExpand}
            />
          ))
        )}
      </div>
    </div>
  );
}
