"use client";

import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  accentColor?: string;
}

export default function MetricCard({
  title, value, subtitle, icon, trend, trendType = "neutral", accentColor
}: MetricCardProps) {
  const trendColors = {
    up: "text-rc-success",
    down: "text-rc-danger",
    neutral: "text-rc-text-muted",
  };

  return (
    <div className="rc-metric-card group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-rc-text-secondary font-medium">{title}</p>
        <div className={`text-rc-text-muted group-hover:text-rc-gold transition-colors ${accentColor || ""}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${accentColor === "text-rc-danger" ? "text-rc-danger" : accentColor === "text-rc-gold" ? "text-rc-gold" : "text-white"}`}>
        {value}
      </p>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={`text-xs font-medium ${trendColors[trendType]}`}>
            {trend}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-rc-text-muted">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
