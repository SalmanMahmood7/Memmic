import { notFound } from "next/navigation";
import { getWhatWeDoDetail } from "@/data/whatWeDoDetails";
import WhatWeDoDetailPage from "@/components/WhatWeDoDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = getWhatWeDoDetail(slug);

  if (!detail) {
    notFound();
  }

  return <WhatWeDoDetailPage detail={detail} />;
}
