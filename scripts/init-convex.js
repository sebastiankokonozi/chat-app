const { execSync } = require("child_process");

console.log("Initializing Convex...");

try {
  // Initialize Convex
  execSync("npx convex dev", { stdio: "inherit" });
} catch (error) {
  console.error("Failed to initialize Convex:", error);
  process.exit(1);
}
