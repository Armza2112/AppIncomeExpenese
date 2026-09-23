"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function OverviewPage() {
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="flex flex-col items-center gap-6 px-6 pt-6 text-center font-sans text-foreground">
      
    </div>
  );
}

