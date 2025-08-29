'use client';

import { DashboardView } from "@/components/dashboard-view";

// Dashboard sayfası artık sadece DashboardView bileşenini render edecek.
// Eski kod (importlar, state, JSX vb.) temizlendi.
export default function DashboardPage() {
  return (
    <DashboardView />
  );
}
