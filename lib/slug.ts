import { prisma } from "@/lib/prisma";

export const RESERVED_SLUGS = new Set(["api", "dashboard", "login", "signup", "r", "admin", "_next"]);

export function baseSlug(input: string): string {
  const value = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return value || "business";
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export async function generateUniqueSlug(nameOrSlug: string, excludeId?: string): Promise<string> {
  let seed = baseSlug(nameOrSlug);
  if (isReservedSlug(seed)) {
    seed = `${seed}-1`;
  }

  let suffix = 1;
  let candidate = seed;

  while (true) {
    const existing = await prisma.business.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing && !isReservedSlug(candidate)) {
      return candidate;
    }

    suffix += 1;
    const maxBase = Math.max(1, 40 - (`-${suffix}`).length);
    candidate = `${seed.slice(0, maxBase)}-${suffix}`;
  }
}
