import { NextResponse } from "next/server";
import { authCookie, hashPassword, signJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug";
import { signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, businessName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const businessSlug = await generateUniqueSlug(businessName);

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      businesses: {
        create: {
          name: businessName,
          slug: businessSlug,
          googleReviewUrl: "https://search.google.com/local/writereview",
        },
      },
    },
    select: { id: true, email: true },
  });

  const token = await signJwt({ sub: user.id });

  const response = NextResponse.json({ user });
  response.cookies.set(authCookie.name, token, authCookie.options);
  return response;
}
