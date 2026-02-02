'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const colorVariants = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-rose-500 to-rose-600',
};

export default function StatCard({ title, value, icon, trend, subtitle, color = 'blue' }: StatCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            {/* Background decoration */}
            <div className={clsx(
                'absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-10',
                colorVariants[color]
            )} />

            <div className="relative">
                {/* Icon */}
                <div className={clsx(
                    'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                    colorVariants[color]
                )}>
                    {icon}
                </div>

                {/* Title */}
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>

                {/* Value */}
                <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>

                {/* Trend or Subtitle */}
                <div className="mt-2 flex items-center gap-2">
                    {trend && (
                        <span className={clsx(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                            trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        )}>
                            {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {trend.value}%
                        </span>
                    )}
                    {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
                </div>
            </div>
        </div>
    );
}
