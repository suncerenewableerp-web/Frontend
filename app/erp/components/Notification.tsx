"use client";

import { useEffect } from "react";

export default function Notification({
  msg,
  onDone,
}: {
  msg: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="notification">
      <span>✅</span>
      {msg}
    </div>
  );
}

