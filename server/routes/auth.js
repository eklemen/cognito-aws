import express from 'express';
import * as authController from '../controllers/authController';
const router = express.Router();

/* GET home page. */
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/validate', authController.validate_token);
router.post('/verificationCode', authController.verify_code);

export default router;
