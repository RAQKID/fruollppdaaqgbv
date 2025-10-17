import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// ES module directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load routes from /myroutes
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

// ❌ Do NOT call app.listen() in Vercel Serverless

// ✅ Export handler for Vercel
export default app;
