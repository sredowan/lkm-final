'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Check } from 'lucide-react';
import clsx from 'clsx';

interface Category {
    id: number;
    name: string;
    parentId: number | null;
    children?: Category[];
}

interface CategoryTreeSelectorProps {
    categories: Category[];  // Can be flat list OR tree with children
    selectedId: number | null;
    onChange: (categoryId: number | null) => void;
}

// Flatten tree to find category by ID
function flattenTree(categories: Category[]): Category[] {
    const result: Category[] = [];
    const flatten = (cats: Category[]) => {
        cats.forEach(cat => {
            result.push(cat);
            if (cat.children && cat.children.length > 0) {
                flatten(cat.children);
            }
        });
    };
    flatten(categories);
    return result;
}

// Find selected category name for display
function findCategoryName(categories: Category[], id: number | null): string {
    if (!id) return 'Select category';
    const flat = flattenTree(categories);
    const cat = flat.find(c => c.id === id);
    return cat?.name || 'Select category';
}

// Find all parent IDs for a category
function findParentIds(categories: Category[], targetId: number): Set<number> {
    const parents = new Set<number>();

    const findInTree = (cats: Category[], parentPath: number[]): boolean => {
        for (const cat of cats) {
            if (cat.id === targetId) {
                parentPath.forEach(id => parents.add(id));
                return true;
            }
            if (cat.children && cat.children.length > 0) {
                if (findInTree(cat.children, [...parentPath, cat.id])) {
                    return true;
                }
            }
        }
        return false;
    };

    findInTree(categories, []);
    return parents;
}

// TreeNode component for recursive rendering
function TreeNodeItem({
    node,
    selectedId,
    onSelect,
    expandedIds,
    toggleExpand,
    depth = 0
}: {
    node: Category;
    selectedId: number | null;
    onSelect: (id: number) => void;
    expandedIds: Set<number>;
    toggleExpand: (id: number) => void;
    depth?: number;
}) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = node.id === selectedId;

    return (
        <div>
            <div
                className={clsx(
                    'flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors',
                    isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                )}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
                {/* Expand/Collapse Toggle */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren) toggleExpand(node.id);
                    }}
                    className={clsx(
                        'w-5 h-5 flex items-center justify-center rounded transition-colors flex-shrink-0',
                        hasChildren ? 'hover:bg-gray-200' : 'invisible'
                    )}
                >
                    {hasChildren && (
                        isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        )
                    )}
                </button>

                {/* Folder Icon */}
                <span className="text-gray-400 flex-shrink-0">
                    {hasChildren ? (
                        isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
                    ) : (
                        <div className="w-4 h-4" />
                    )}
                </span>

                {/* Category Name */}
                <button
                    type="button"
                    onClick={() => onSelect(node.id)}
                    className={clsx(
                        'flex-1 text-left text-sm truncate',
                        isSelected && 'font-medium'
                    )}
                >
                    {node.name}
                </button>

                {/* Selected Check */}
                {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div>
                    {node.children!.map(child => (
                        <TreeNodeItem
                            key={child.id}
                            node={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            expandedIds={expandedIds}
                            toggleExpand={toggleExpand}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CategoryTreeSelector({
    categories,
    selectedId,
    onChange
}: CategoryTreeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedName = findCategoryName(categories, selectedId);

    // Expand parents of selected category on mount
    useEffect(() => {
        if (selectedId && categories.length > 0) {
            const parentsToExpand = findParentIds(categories, selectedId);
            if (parentsToExpand.size > 0) {
                setExpandedIds(prev => new Set([...prev, ...parentsToExpand]));
            }
        }
    }, [selectedId, categories]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSelect = (id: number) => {
        onChange(id);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    'w-full flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm text-left transition-colors',
                    isOpen
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300',
                    selectedId ? 'text-gray-900' : 'text-gray-500'
                )}
            >
                <span className="truncate">{selectedName}</span>
                <ChevronDown className={clsx(
                    'w-4 h-4 text-gray-400 transition-transform',
                    isOpen && 'rotate-180'
                )} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg max-h-72 overflow-y-auto">
                    {/* Clear option */}
                    <button
                        type="button"
                        onClick={handleClear}
                        className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                    >
                        Select category
                    </button>

                    {/* Tree */}
                    <div className="p-2">
                        {categories.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No categories found</p>
                        ) : (
                            categories.map(node => (
                                <TreeNodeItem
                                    key={node.id}
                                    node={node}
                                    selectedId={selectedId}
                                    onSelect={handleSelect}
                                    expandedIds={expandedIds}
                                    toggleExpand={toggleExpand}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
