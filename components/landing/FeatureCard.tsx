import React from "react";

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export default function FeatureCard({ title, desc, icon }: FeatureCardProps) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-slate-50">{icon}</div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-slate-600 mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}
