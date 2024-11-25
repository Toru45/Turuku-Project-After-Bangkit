import express from 'express';
import db from './config/Database.js';
const app = express();

try {
    await db.authenticate();
    console.log('Connection has been established successfully.')
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});