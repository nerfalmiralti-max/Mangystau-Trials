import type { Metadata } from "next";
import ProfileClient from "@/components/ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  description: "MangystauTrails profile, local demo auth and saved travel context.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
