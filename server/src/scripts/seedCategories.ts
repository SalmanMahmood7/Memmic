/**
 * Seeds the four EnquiryCategory rows the public "What we do" pages
 * (evaluation / management / marketplace / investment) submit enquiries
 * against. Required for GET /admin/enquiry-categories/user?form_type=...
 * and POST /client/enquiry to have a category_id to resolve.
 */
import { prisma } from "../db";

const CATEGORIES: Array<{ formType: string; name: string; description: string }> = [
  { formType: "evaluation", name: "Evaluation", description: "Creator/studio evaluation enquiries" },
  { formType: "management", name: "Management", description: "Production management enquiries" },
  { formType: "marketplace", name: "Marketplace", description: "Marketplace briefs and bids" },
  { formType: "investment", name: "Investment", description: "Production financing enquiries" },
];

async function seedCategories() {
  for (const { formType, name, description } of CATEGORIES) {
    const exists = await prisma.enquiryCategory.findFirst({ where: { formType } });
    if (!exists) {
      await prisma.enquiryCategory.create({ data: { formType, name, description, isActive: 1 } });
    }
  }
  console.log("Enquiry categories seeded successfully");
}

seedCategories()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
