import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-7xl gap-4 p-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-32" key={index} />
        ))}
      </div>
      <Skeleton className="h-96" />
    </main>
  );
}
