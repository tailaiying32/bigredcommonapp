"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function TeamFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  function handleFilter(category: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`/teams?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!active ? "default" : "outline"}
        size="sm"
        onClick={() => handleFilter(null)}
      >
        All
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={active === cat ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilter(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
  );
}
