"use client";

import dynamic from "next/dynamic";

const HomePage = dynamic(() => import("../homepage"), {
  ssr: false,
});

export default function Page() {
  return <HomePage />;
}
