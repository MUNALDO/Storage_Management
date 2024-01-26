import express from 'express';
import { getAllStorage, getRequest, getStorageById, getStorageSpecific } from '../controllers/supplierController.js';
import { verifyTokenDistributor } from '../utils/verifyToken.js';
import { createRequest, getAllSupplier, getSupplierSpecific } from '../controllers/distributorController.js';

const router = express.Router();

// get supplier
router.get('/manage-supplier/get-all', verifyTokenDistributor, getAllSupplier);
router.get('/manage-supplier/get-specific', verifyTokenDistributor, getSupplierSpecific);

// get storage
router.get('/manage-storage/get-all', verifyTokenDistributor, getAllStorage);
router.get('/manage-storage/get-specific', verifyTokenDistributor, getStorageSpecific);
router.get('/manage-storage/get-by-id', verifyTokenDistributor, getStorageById);

// manage request
router.post('/manage-request/create', verifyTokenDistributor, createRequest);
router.get('/manage-request/get-specific', verifyTokenDistributor, getRequest)

export default router;