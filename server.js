import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // ✅ lowercase variable name

// ES module directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Auto-load route files from /myroutes
const routesPath = path.join(__dirname, "myroutes");
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith(".js")) {
    import(path.join(routesPath, file))
      .then((routeModule) => {
        const routeName = "/" + file.replace(".js", "");
        app.use(routeName, routeModule.default);
        console.log(`✅ Loaded route: ${routeName}`);
      })
      .catch((err) => console.error(`❌ Error loading ${file}:`, err));
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ✅ Start server correctly
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
});
