import express from 'express';
import { users, register, login, logout, createUserDataAndHistory,changePassword, getUserHistory } from '../controller/users.js';
import { verifyToken } from '../middleware/verifyToken..js';
import { refreshToken } from '../controller/refreshToken.js';

const router = express.Router(); 

router.get('/api/v1/users',verifyToken,users)
router.post('/api/v1/register',register)
router.post('/api/v1/login', login)
router.get('/api/v1/token', refreshToken)
router.delete('/api/v1/logout',logout)
router.post('/api/v1/userdata', createUserDataAndHistory)
router.get('/api/v1/history', getUserHistory)
router.patch('/api/v1/changePassword', verifyToken, changePassword)

export default router

