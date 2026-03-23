/**
 * Create or promote a superuser (role: superuser).
 *
 * Usage:
 *   node scripts/createSuperuser.js <email> <password> [name]
 *
 * Or set env: SUPERUSER_EMAIL, SUPERUSER_PASSWORD, SUPERUSER_NAME
 *
 * If the email already exists, that account is promoted to superuser and the password is updated.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/userModel.js";

const email =
  process.argv[2]?.trim() || process.env.SUPERUSER_EMAIL?.trim();
const password =
  process.argv[3] || process.env.SUPERUSER_PASSWORD;
const name =
  process.argv[4]?.trim() ||
  process.env.SUPERUSER_NAME?.trim() ||
  "Superuser";

async function main() {
  if (!email || !password) {
    console.error(
      "Missing email or password.\n" +
        "  node scripts/createSuperuser.js <email> <password> [name]\n" +
        "  or set SUPERUSER_EMAIL and SUPERUSER_PASSWORD in .env"
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();
  const hashed = await bcrypt.hash(password, 10);

  const escaped = email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existing = await User.findOne({
    email: new RegExp(`^${escaped}$`, "i"),
  });
  if (existing) {
    existing.role = "superuser";
    existing.password = hashed;
    await existing.save();
    console.log("Promoted existing user to superuser:", existing.email);
  } else {
    const doc = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password: hashed,
      role: "superuser",
    });
    console.log("Created superuser:", doc.email);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
