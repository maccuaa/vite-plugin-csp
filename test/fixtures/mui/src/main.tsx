import { Typography } from "@mui/material";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");

if (!root) {
  throw new Error("DOM root element not found");
}

createRoot(root).render(
  <Typography variant="h1" sx={{ color: "purple" }}>
    Hello World
  </Typography>,
);
