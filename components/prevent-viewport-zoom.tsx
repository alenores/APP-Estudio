"use client";

import { useEffect } from "react";
import { mountViewportZoomPrevention } from "@/lib/prevent-viewport-zoom";

export function PreventViewportZoom() {
  useEffect(() => mountViewportZoomPrevention(), []);
  return null;
}
