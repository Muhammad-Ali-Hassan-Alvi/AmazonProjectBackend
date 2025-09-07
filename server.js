import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";


dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => res.send('Server Up and Running'));

app.use("/api/v1", userRoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});