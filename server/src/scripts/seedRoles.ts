/**
 * Port of Backend/seed_roles.py, extended to also seed the four client-portal
 * roles that the Python app seeds via an Alembic data migration
 * (Backend/alembic/versions/c9e41f2aa1d1_add_client_portal_support.py) rather
 * than seed_roles.py. Consolidating them here means a single `npm run
 * seed:roles` fully bootstraps role data for this Node backend.
 */
import { prisma } from "../db";

const ROLES: Array<{ name: string; description: string }> = [
  { name: "Invester", description: "nil" },
  { name: "Admin", description: "nil" },
  { name: "Manager", description: "nil" },
  { name: "evaluation_client", description: "Evaluation portal client" },
  { name: "investment_client", description: "Investment portal client" },
  { name: "marketplace_client", description: "Market Place portal client" },
  { name: "management_client", description: "Management portal client" },
];

async function seedRoles() {
  for (const { name, description } of ROLES) {
    const exists = await prisma.role.findUnique({ where: { name } });
    if (!exists) {
      await prisma.role.create({ data: { name, description } });
    }
  }
  console.log("Roles seed successfully");
}

seedRoles()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
