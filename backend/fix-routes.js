const fs = require("fs");
const path = require("path");

// List of route files to fix
const routeFiles = [
  "src/routes/users.ts",
  "src/routes/posts.ts",
  "src/routes/clubs.ts",
  "src/routes/coaches.ts",
  "src/routes/messages.ts",
  "src/routes/players.ts",
  "src/routes/scouts.ts",
];

function fixRouteFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  let content = fs.readFileSync(filePath, "utf8");

  // Fix async handler return types
  content = content.replace(
    /asyncHandler\(async \(req: Request, res: Response\) =>/g,
    "asyncHandler(async (req: Request, res: Response): Promise<void> =>"
  );

  // Fix return statements in responses
  content = content.replace(
    /return res\.status\((\d+)\)\.json\(/g,
    "res.status($1).json("
  );

  // Add return statements after status responses
  content = content.replace(
    /(res\.status\(\d+\)\.json\([^}]+}\s*as\s+ApiResponse\);)/g,
    "$1\n    return;"
  );

  // Fix ObjectId._id.toString() issues
  content = content.replace(
    /(\w+\._id)\.toString\(\)/g,
    "($1 as any).toString()"
  );

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

// Apply fixes to all route files
routeFiles.forEach((file) => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fixRouteFile(fullPath);
  } else {
    console.log(`File not found: ${fullPath}`);
  }
});

console.log("All route files have been fixed!");
