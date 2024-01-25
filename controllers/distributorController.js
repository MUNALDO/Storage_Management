import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from "../constant/HttpStatus.js";
import DistributorCompanySchema from "../models/DistributorCompanySchema.js";
import RequestSchema from "../models/RequestSchema.js";
import StorageSchema from "../models/StorageSchema.js";
import SupplierSchema from "../models/SupplierSchema.js"
import { createError } from "../utils/error.js";

export const getAllSupplier = async (req, res, next) => {
    try {
        const suppliers = await SupplierSchema.find();
        res.status(OK).json({
            success: true,
            status: OK,
            message: suppliers,
        });
    } catch (err) {
        next(err)
    }
}

export const getSupplierSpecific = async (req, res, next) => {
    const searchQuery = {};

    if (req.query.id) searchQuery["id"] = req.query.id;
    if (req.query.name) searchQuery["name"] = req.query.name;
    if (req.query.address) searchQuery["address"] = req.query.address;
    try {
        const supplier = await SupplierSchema.find();
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        let filteredSupplier = supplier;

        // Check if there are no search options specified
        if (Object.keys(searchQuery).length === 0) {
            res.status(OK).json({
                success: true,
                status: OK,
                message: filteredSupplier,
            });
        } else {
            // Filter the storage array based on the search criteria
            if (req.query.id) filteredSupplier = filteredSupplier.filter(supplier => supplier.id === req.query.id);
            if (req.query.name) filteredSupplier = filteredSupplier.filter(supplier => supplier.name === req.query.name);
            if (req.query.address) filteredSupplier = filteredSupplier.filter(supplier => supplier.address === req.query.address);

            res.status(OK).json({
                success: true,
                status: OK,
                data: filteredSupplier,
            });
        }
    } catch (err) {
        next(err);
    }
};

export const createRequest = async (req, res, next) => {
    const distributorID = req.query.distributorID;
    const supplierID = req.query.supplierID;
    const storageID = req.query.storageID;
    try {
        const distributor = await DistributorCompanySchema.findOne({ id: distributorID });
        if (!distributor) return next(createError(NOT_FOUND, "Distributor not found"));

        const supplier = await SupplierSchema.findOne({ id: supplierID });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        const storage = await StorageSchema.findOne({ id: storageID, supplier_id: supplier.id, supplier_name: supplier.name });
        if (!storage) return next(createError(NOT_FOUND, "Storage not found"));

        const newRequest = new RequestSchema({
            request_date: new Date(),
            distributor_id: distributor.id,
            distributor_name: distributor.name, 
            distributor_address: distributor.address,
            supplier_id: supplier.id,
            supplier_name: supplier.name,
            supplier_address: supplier.address,
            storage_id: storage.id,
            storage_name: storage.name,
            storage_address: storage.address,
            product_category: req.body.product_category,
            product_name: req.body.product_name,
            product_quantity: req.body.product_quantity
        })
        const existingProductCategory = storage.products.find(product => product.product_category === newRequest.product_category);
        if (!existingProductCategory) return next(createError(NOT_FOUND, "Product category not found"));

        const existingProductName = existingProductCategory.product_value.find(product => product.name === newRequest.product_name);
        if (!existingProductName) return next(createError(NOT_FOUND, "Product name not found"));

        const existingProductQuantity = existingProductName.quantity;
        if (existingProductQuantity < newRequest.product_quantity) return next(createError(BAD_REQUEST, "Product quantity not enough"));

        await newRequest.save();
        res.status(CREATED).json({
            success: true,
            status: CREATED,
            message: newRequest,
        });
    } catch (err) {
        next();
    }
}