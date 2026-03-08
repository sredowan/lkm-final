'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Tag {
    id: number;
    name: string;
}

interface TagInputProps {
    value: string; // Comma separated tags
    onChange: (value: string) => void;
    placeholder?: string;
}

export function TagInput({ value, onChange, placeholder = "Add tags..." }: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await fetch('/api/admin/tags');
                if (res.ok) {
                    const data = await res.json();
                    setAllTags(data);
                }
            } catch (err) {
                console.error('Failed to fetch tags:', err);
            }
        };
        fetchTags();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateSuggestions = (val: string) => {
        if (!val.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const filtered = allTags.filter(t =>
            t.name.toLowerCase().includes(val.toLowerCase()) &&
            !tags.includes(t.name)
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(-1);
    };

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            const newTags = [...tags, trimmedTag];
            onChange(newTags.join(', '));
        }
        setInputValue('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = tags.filter(t => t !== tagToRemove);
        onChange(newTags.join(', '));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                addTag(suggestions[selectedIndex].name);
            } else {
                addTag(inputValue);
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="flex flex-wrap gap-2 p-2 min-h-[44px] w-full rounded-xl border border-gray-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100 group"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="p-0.5 hover:bg-blue-100 rounded-full transition-colors"
                        >
                            <X size={14} className="text-blue-400 group-hover:text-blue-600" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        updateSuggestions(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => updateSuggestions(inputValue)}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm p-1"
                    placeholder={tags.length === 0 ? placeholder : ""}
                />
            </div>

            {showSuggestions && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => addTag(suggestion.name)}
                            className={cn(
                                "w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between group",
                                index === selectedIndex ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            <span>{suggestion.name}</span>
                            <Plus size={14} className={cn(
                                "text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity",
                                index === selectedIndex && "opacity-100 text-blue-500"
                            )} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
