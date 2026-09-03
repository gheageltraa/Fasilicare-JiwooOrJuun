import "dotenv/config";
import { seedLocations } from "../server/db";
await seedLocations();
console.log("FasiliCare locations seeded.");
