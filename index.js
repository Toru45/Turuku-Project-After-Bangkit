import express from 'express';
import dotenv from 'dotenv';
import db from './config/Database.js';
import router from './routes/index.js';

dotenv.config();


const app = express();

try {
    await db.authenticate();
    console.log('Connection has been established successfully.')
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

app.use(express.json());


//middleware
app.use(router)


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});