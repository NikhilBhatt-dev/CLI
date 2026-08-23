import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// Required environment variables
const requiredEnvVars = [
  "JWT_SECRET",
  "MONGODB_URI",
];

const missingEnvVars = requiredEnvVars.filter(
  (key) => !process.env[key]
);

if (missingEnvVars.length > 0) {
  console.error(
  "\n❌ Missing required environment variables. Please add them to the .env file:"
);
  missingEnvVars.forEach((key) => {
    console.error(`   - ${key}`);
  });

  console.error("\n⚠️ Server startup aborted.");
  process.exit(1);
}

console.log("✅ Environment variables validated successfully.");