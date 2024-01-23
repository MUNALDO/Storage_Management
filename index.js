import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { SYSTEM_ERROR } from './constant/HttpStatus.js';
import cors from 'cors';
import authRoute from "./routes/auth.js";
import supplierRoute from "./routes/supplier.js"

const app = express();
dotenv.config();
mongoose.set('strictQuery', false);
process.env.TZ = 'Europe/Berlin';

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected");
    } catch (error) {
        throw error;
    }
}

mongoose.connection.on('disconnected', () => {
    console.log("Database disconnected");
});

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001',],
    credentials: true,
}));
// app.options('*', cors());

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/supplier", supplierRoute);

app.use((err, req, res, next) => {
    const errorStatus = err.status || SYSTEM_ERROR;
    const errorMessage = err.message || "Something went wrong";
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack
    });
});

const PORT = process.env.PORT || 8800;
async function startApp() {
    await connect();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startApp();
