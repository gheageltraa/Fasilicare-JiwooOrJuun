import "dotenv/config";
import { getUserByLogin, hashPassword, seedLocations, updateUser, upsertUser } from "../server/db";
await seedLocations();
for (const [email, username, name] of [["dhanny.aljael@gmail.com", "dhanny.aljael", "Dhanny Aljael"], ["ghea.geltra@gmail.com", "ghea.geltra", "Ghea Geltra"]] as const) {
	const existing = await getUserByLogin(email);
	if (existing) {
		await updateUser(existing.id, { role: "admin", username, name, email });
		const { setUserPassword } = await import("../server/db");
		await setUserPassword(existing.id, "12345678");
	} else {
		await upsertUser({ openId: `local:${username}`, username, name, email, role: "admin", loginMethod: "password", passwordHash: await hashPassword("12345678") });
	}
}
console.log("FasiliCare locations seeded.");
