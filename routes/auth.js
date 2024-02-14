import express from 'express';
import {
    loginDistributor, loginSupplier, logoutDistributor, logoutSupplier,
    registerDistributor, registerSupplier
} from '../controllers/authController.js';
import { verifyTokenDistributor, verifyTokenSupplier } from '../utils/verifyToken.js';

const router = express.Router();

// authenticate supplier
router.post('/manage-supplier/register-supplier', registerSupplier);
router.post('/manage-supplier/login-supplier', loginSupplier);
router.post('/manage-supplier/logout-supplier', verifyTokenSupplier, logoutSupplier);

// authenticate distributor
router.post('/manage-distributor/register-distributor', registerDistributor);
router.post('/manage-distributor/login-distributor', loginDistributor);
router.post('/manage-distributor/logout-distributor', verifyTokenDistributor, logoutDistributor);

export default router;