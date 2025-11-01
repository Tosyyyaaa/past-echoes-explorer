import React, { Suspense } from "react";
import Timeline3D from "./Timeline3D";

export default function Interactive3DTimeline() {
  return (
    <main className="w-full h-[calc(100vh-220px)] bg-black overflow-hidden rounded-xl border-2 border-border">
      <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-white">Loading timeline...</div>}>
        <Timeline3D />
      </Suspense>
    </main>
  );
}


