"use client";

import { useEffect } from "react";
import { LuCircleCheck } from "react-icons/lu";

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
      <span aria-hidden style={{ display: "inline-flex" }}>
        <LuCircleCheck />
      </span>
      {msg}
    </div>
  );
}
