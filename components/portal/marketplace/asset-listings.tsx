"use client";

import { Box, Eye, MessageCircle } from "lucide-react";

export function AssetListings({
  listings,
}: {
  listings: {
    title: string;
    category: string;
    status: string;
    views: number;
    inquiries: number;
    engagement_rate: number;
    listed_at: string;
  }[];
}) {
  if (!listings?.length) return null;

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Box className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-ink">Asset Listings</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Securitized loan portfolios, equity shares, and B2B service matching on the MEMMIC ecosystem.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Asset</th>
              <th className="pb-3 pr-4 font-medium">Category</th>
              <th className="pb-3 pr-4 font-medium">Views</th>
              <th className="pb-3 pr-4 font-medium">Inquiries</th>
              <th className="pb-3 pr-4 font-medium">Engagement</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.title} className="border-b border-border last:border-0">
                <td className="py-3 pr-4 font-medium text-ink">{l.title}</td>
                <td className="py-3 pr-4 text-muted-foreground">{l.category}</td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Eye className="size-3.5" /> {l.views.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="size-3.5" /> {l.inquiries}
                  </span>
                </td>
                <td className="py-3 pr-4 font-semibold text-ink">{l.engagement_rate}%</td>
                <td className="py-3">
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 capitalize">
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
