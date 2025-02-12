import { Router } from 'express';
import { signUp, signIn, logout, getUserData } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';

const userRouter = Router();

userRouter.post('/signup', signUp);
userRouter.post('/signin', signIn);
userRouter.post('/logout', logout);
userRouter.get('/user', authenticateToken, getUserData);

export default userRouter;