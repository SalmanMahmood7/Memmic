export interface WhatWeDoListItem {
  number: string;
  title: string;
  description: string;
}

export interface WhatWeDoDetail {
  slug: string;
  navLabel: string;
  title: string;
  tagline: string;
  intro: string[];
  sections: {
    label: string;
    items: WhatWeDoListItem[];
  }[];
  quote: string;
}

export const WHAT_WE_DO_DETAILS: WhatWeDoDetail[] = [
  {
    slug: "evaluation",
    navLabel: "Evaluation",
    title: "Evaluation.",
    tagline: "Evidence, not endorsement.",
    intro: [
      "Every creator and production house that carries the MEMMIC name has been checked against a fixed set of criteria — delivered portfolio, audience authenticity, rights hygiene, and delivery track record.",
      "None of it is taken on reputation. Audience numbers are audited against platform data rather than accepted as claimed, and rights are traced rather than assumed clean. The result is a verdict that holds up because it's checked, not because it's asserted.",
    ],
    sections: [
      {
        label: "What we look at",
        items: [
          {
            number: "01",
            title: "Delivered portfolio",
            description:
              "A body of finished, shipped work — not decks or pitches. We look at what actually got made and released, not what was proposed.",
          },
          {
            number: "02",
            title: "Audience authenticity",
            description:
              "Reach and engagement checked against platform data and third-party tools — not self-reported screenshots.",
          },
          {
            number: "03",
            title: "Rights hygiene",
            description:
              "A clean chain of title on footage, music, likeness and IP — no orphaned rights that surface later as legal exposure.",
          },
          {
            number: "04",
            title: "Delivery track record",
            description:
              "An on-time, on-budget history across past briefs — a pattern, checked with past collaborators, not a one-off.",
          },
        ],
      },
      {
        label: "How we evaluate",
        items: [
          {
            number: "01",
            title: "Portfolio review",
            description:
              "The work itself, assessed on craft and consistency across projects.",
          },
          {
            number: "02",
            title: "Audience audit",
            description:
              "Independent verification of the claimed reach and engagement.",
          },
          {
            number: "03",
            title: "Rights & compliance check",
            description:
              "Contracts, licenses and ownership traced end to end, project by project.",
          },
          {
            number: "04",
            title: "Track record interview",
            description:
              "Delivery history checked against past collaborators, not just the creator's own account.",
          },
        ],
      },
    ],
    quote:
      "A creator or studio only carries the MEMMIC evaluation once all four hold up independently. That is what makes it a rating, not a recommendation.",
  },
  {
    slug: "management",
    navLabel: "Management",
    title: "Management.",
    tagline: "A spine, not a personality.",
    intro: [
      "Creative output only scales when it can run without one person holding it together. MEMMIC gives every studio and product it manages a production spine — budgeting, scheduling, IP and rights contracts, and revenue accounting.",
      "That spine is what makes a pipeline governable and sellable in its own right, rather than dependent on whoever happens to be running it that week.",
    ],
    sections: [
      {
        label: "The production spine",
        items: [
          {
            number: "01",
            title: "Budgeting",
            description:
              "Every project runs against a live budget, tracked to the line item — not a lump-sum estimate.",
          },
          {
            number: "02",
            title: "Scheduling",
            description:
              "Production calendars with named owners and dependencies, so delays are visible before they become late deliveries.",
          },
          {
            number: "03",
            title: "IP & rights contracts",
            description:
              "Standard paper for every commission: ownership, usage terms and revenue share defined before cameras roll.",
          },
          {
            number: "04",
            title: "Revenue accounting",
            description:
              "Income and costs booked against the project, not the studio's general ledger, so profitability is visible per title.",
          },
        ],
      },
      {
        label: "What this replaces",
        items: [
          {
            number: "01",
            title: "Ad hoc scoping → Managed scoping",
            description:
              "A signed SOW in place of a verbal understanding of what is being made.",
          },
          {
            number: "02",
            title: "Verbal rights → Written contracts",
            description:
              "Ownership and usage settled on paper before production, not negotiated after delivery.",
          },
          {
            number: "03",
            title: "Founder-memory → Shared calendar",
            description:
              "Scheduling that survives someone being on leave, or leaving.",
          },
          {
            number: "04",
            title: "Mixed accounts → Per-project accounting",
            description:
              "Every title accountable for its own costs and revenue, visible on its own.",
          },
        ],
      },
    ],
    quote:
      "The goal is a studio whose output doesn't depend on one person's memory or mood — governance that survives a change in personnel.",
  },
  {
    slug: "marketplace",
    navLabel: "Marketplace",
    title: "Marketplace.",
    tagline: "Demand, verified — before the bid.",
    intro: [
      "Brands and platforms with committed commissioning briefs or campaign budgets post real demand into the marketplace. Certified creators and producers — the ones who've cleared MEMMIC evaluation — bid for the brief.",
      "Auctions aren't new to advertising; adtech already runs on them. What's different here is the verification layer underneath the bid: certified creators, audited audiences, so the budget moves against something real.",
    ],
    sections: [
      {
        label: "What 'verified' means",
        items: [
          {
            number: "01",
            title: "Certified creators",
            description:
              "Creators and producers who have cleared MEMMIC evaluation — not an open, self-listed directory.",
          },
          {
            number: "02",
            title: "Audited audiences",
            description:
              "Reach figures checked against platform and third-party data, not claimed by the creator.",
          },
          {
            number: "03",
            title: "Committed briefs",
            description:
              "Brands and platforms bid against real commissioning budgets or campaign line items — not speculative interest.",
          },
          {
            number: "04",
            title: "Defined terms",
            description:
              "Scope, usage rights and payment terms set before the bid closes, not renegotiated after.",
          },
        ],
      },
      {
        label: "How a bid moves",
        items: [
          {
            number: "01",
            title: "Brief posted",
            description: "A brand or platform posts a brief with budget attached.",
          },
          {
            number: "02",
            title: "Certified bids",
            description:
              "Certified creators and producers submit bids against the brief.",
          },
          {
            number: "03",
            title: "Terms lock",
            description:
              "The brand selects; rights, usage and payment terms lock in.",
          },
          {
            number: "04",
            title: "Managed delivery",
            description:
              "Delivery runs through the same production spine as any managed project.",
          },
        ],
      },
    ],
    quote:
      "Advertising already runs on auctions — adtech proved that years ago. What MEMMIC adds is not the auction. It is knowing the bidder is real and the audience is real before the budget moves.",
  },
  {
    slug: "investment",
    navLabel: "Investment",
    title: "Investment.",
    tagline: "Capital that waits for proof.",
    intro: [
      "MEMMIC finances production against projects that are already green-lit and demand-contracted — a brief or buyer already committed, not a pitch hoping to find one.",
      "That sequencing inverts the usual risk in media financing: instead of backing speculative production and hoping demand shows up later, capital deploys only once demand is already verified.",
    ],
    sections: [
      {
        label: "What gets financed",
        items: [
          {
            number: "01",
            title: "Green-lit projects",
            description: "Commissioned and scoped work — not a pitch or a proposal.",
          },
          {
            number: "02",
            title: "Demand-contracted",
            description:
              "A brief, buyer or distribution commitment already in place before capital moves.",
          },
          {
            number: "03",
            title: "Verified economics",
            description:
              "Costs and expected revenue modelled against the production spine's own accounting, not a deck.",
          },
          {
            number: "04",
            title: "Aligned structure",
            description:
              "Shariah-compliant terms and patient capital, with no forced-exit pressure on the creative timeline.",
          },
        ],
      },
      {
        label: "The sequence",
        items: [
          {
            number: "01",
            title: "Demand verified",
            description:
              "A real commission or contracted buyer exists before anything else.",
          },
          {
            number: "02",
            title: "Production costed",
            description: "Budget and schedule set inside the managed pipeline.",
          },
          {
            number: "03",
            title: "Capital deploys",
            description: "Against the contracted project — not a speculative slate.",
          },
          {
            number: "04",
            title: "Returns tracked",
            description:
              "Through the same revenue accounting used to manage the project.",
          },
        ],
      },
    ],
    quote:
      "This inverts the usual model: instead of financing speculative production and hoping demand shows up, MEMMIC finances production once demand is already proven.",
  },
];

export function getWhatWeDoDetail(slug: string | undefined) {
  return WHAT_WE_DO_DETAILS.find((detail) => detail.slug === slug);
}
