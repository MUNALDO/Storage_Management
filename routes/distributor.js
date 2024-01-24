import express from 'express';
import { getAllStorage, getStorageById, getStorageSpecific } from '../controllers/supplierController.js';
import { verifyTokenDistributor } from '../utils/verifyToken.js';
import { getAllSupplier, getSupplierSpecific } from '../controllers/distributorController.js';

const router = express.Router();

// get supplier
router.get('/manage-supplier/get-all', verifyTokenDistributor, getAllSupplier);
router.get('/manage-supplier/get-specific', verifyTokenDistributor, getSupplierSpecific);

// get storage
router.get('/manage-storage/get-all', verifyTokenDistributor, getAllStorage);
router.get('/manage-storage/get-specific', verifyTokenDistributor, getStorageSpecific);
router.get('/manage-storage/get-by-id', verifyTokenDistributor, getStorageById);

export default router;