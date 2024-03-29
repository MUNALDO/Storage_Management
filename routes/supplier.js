import express from 'express';
import { verifyTokenSupplier } from '../utils/verifyToken.js';
import {
    addProductToStorage, createStorage, deleteStorage, getAllStorage, getRequest, getStorageById,
    getStorageSpecific, handleRequest, removeProductFromStorage, updateProductInStorage, updateStorage
} from '../controllers/supplierController.js';

const router = express.Router();

// manage storage
router.post('/manage-storage/create', verifyTokenSupplier, createStorage);
router.put('/manage-storage/update', verifyTokenSupplier, updateStorage);
router.delete('/manage-storage/delete', verifyTokenSupplier, deleteStorage);
router.get('/manage-storage/get-all', verifyTokenSupplier, getAllStorage);
router.get('/manage-storage/get-specific', verifyTokenSupplier, getStorageSpecific);
router.get('/manage-storage/get-by-id', verifyTokenSupplier, getStorageById);
router.put('/manage-storage/add-product', verifyTokenSupplier, addProductToStorage);
router.put('/manage-storage/remove-product', verifyTokenSupplier, removeProductFromStorage);
router.put('/manage-storage/update-product', verifyTokenSupplier, updateProductInStorage);

// manage request
router.put('/manage-request/handle/:_id', verifyTokenSupplier, handleRequest);
router.get('/manage-request/get-specific', verifyTokenSupplier, getRequest)

export default router;