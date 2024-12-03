import express from 'express';
import dotenv from 'dotenv';
import db from './config/Database.js';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import rateLimit from 'express-rate-limit';

dotenv.config();


const app = express();
const limiter =rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 40, // Limit to 40 request per 15 minutes
    message: 'Too many requests from this IP, please try again later!'
})
app.use(limiter)

try {
    await db.authenticate();
    console.log('Connection has been established successfully.')
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

//middleware
app.use(express.json());
app.use(cookieParser())
app.use(router)




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});