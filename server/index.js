import express from "express";
import { dbConnection } from "./Database/dbConnection.js";
import { bootstrap } from "./src/bootstrap.js";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import cors from "cors";
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
dbConnection();
bootstrap(app);

app.listen(port, () => console.log(`App listening on port ${port}!`));
