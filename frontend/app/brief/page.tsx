"use client";

import dynamic from "next/dynamic";

const BriefDashboard = dynamic(() => import("@/components/BriefDashboard"), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center text-text-secondary">Loading...</div>,
});

export default function BriefPage() {
  return <BriefDashboard />;
}
