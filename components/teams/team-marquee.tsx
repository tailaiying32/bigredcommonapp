"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Team } from "@/types/database";

const SPEED = 0.3; // px per frame at 60fps

export function TeamMarquee({ teams }: { teams: Team[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const [, forceRender] = useState(0);

  // Duplicate for seamless loop
  const items = [...teams, ...teams];

  const tick = useCallback(() => {
    const el = containerRef.current;
    if (el) {
      const halfWidth = el.scrollWidth / 2;
      offsetRef.current = (offsetRef.current + SPEED) % halfWidth;
      el.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    // Force a render after mount so scrollWidth is accurate
    forceRender(1);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges — inset to match page padding */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[calc(max((100%-64rem)/2,1rem))] bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[calc(max((100%-64rem)/2,1rem))] bg-gradient-to-l from-background to-transparent" />

      <div ref={containerRef} className="flex w-max gap-4 will-change-transform">
        {items.map((team, i) => (
          <Card key={`${team.id}-${i}`} className="w-72 shrink-0">
            <CardHeader>
              <div className="flex items-start gap-3">
                {team.logo_url ? (
                  <Image
                    src={team.logo_url}
                    alt={`${team.name} logo`}
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-md object-contain"
                  />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-base font-bold text-primary">
                    {team.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">{team.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {team.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
