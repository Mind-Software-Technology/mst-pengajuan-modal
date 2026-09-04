"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem("mst_team_session");
    if (!session) {
      router.replace("/login");
      return;
    }
    setIsChecked(true);
  }, [router]);

  if (!isChecked) return null;

  return <>{children}</>;
}
