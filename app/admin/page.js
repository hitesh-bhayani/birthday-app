// app/admin/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyAdminRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect /admin to the dynamic editor route for the default card config
    router.replace("/wish/default/edit");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
    </div>
  );
}
