import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileClient from "@/components/ProfileClient";
import PageLoadingSkeleton from "@/components/PageLoadingSkeleton";

export const metadata: Metadata = {
  title: "Profile",
  description: "MangystauTrails account and saved travel context.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton activeTab="profile" />}>
      <ProfileClient />
    </Suspense>
  );
}
