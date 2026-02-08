import express from "express";
import { authRouter } from "./routes/auth.route.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});
