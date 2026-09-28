import { cookies } from "next/headers";
import { authCookie, verifyJwt } from "@/lib/auth";

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookie.name)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyJwt(token);
  return payload?.sub ?? null;
}
