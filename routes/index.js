import express from 'express';
import { getUsers, register, login, logout, userdata } from '../controller/users.js';
import { verifyToken } from '../middleware/verifyToken..js';
import { refreshToken } from '../controller/refreshToken.js';

const router = express.Router(); 

router.get('/users',verifyToken,getUsers)
router.post('/register',register)
router.post('/login',login)
router.get('/token',refreshToken)
router.delete('/logout',logout)
router.post('/userdata', userdata)

export default router

