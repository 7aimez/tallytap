import { notFound } from "next/navigation";
import RatingFlow from "./RatingFlow";

type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  googleReviewUrl: string;
};

async function getBusiness(slug: string): Promise<PublicBusiness | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/public/businesses/${slug}`, { cache: "no-store" });
  if (!response.ok) return null;
  const data = (await response.json()) as { business: PublicBusiness };
  return data.business;
}

export default async function RatingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusiness(slug);

  if (!business) {
    notFound();
  }

  return <RatingFlow business={business} />;
}
