import { CONFLICT, CREATED, NOT_FOUND, OK } from "../constant/HttpStatus.js";
import StorageSchema from "../models/StorageSchema.js";
import SupplierSchema from "../models/SupplierSchema.js";
import { createError } from "../utils/error.js";

export const createStorage = async (req, res, next) => {
    const supplierID = req.query.supplierID;
    const supplierName = req.query.supplierName;
    try {
        const supplier = await SupplierSchema.findOne({ id: supplierID, name: supplierName });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"))

        const storageExists = supplier.storage.some(storage => storage.id === req.body.id && storage.name === req.body.name);
        if (storageExists) return next(createError(CONFLICT, "Storage is already exists!"))

        const newStorage = new StorageSchema({
            id: req.body.id,
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
            address: req.body.address
        })
        await newStorage.save();

        supplier.storage.push({
            id: newStorage.id,
            name: newStorage.name,
            password: newStorage.password,
            email: newStorage.email,
            address: newStorage.address,
        })
        await supplier.save();

        res.status(CREATED).json({
            success: true,
            status: CREATED,
            message: newStorage,
        });
    } catch (err) {
        next();
    }
}

export const updateStorage = async (req, res, next) => {
    const { storageID, supplierID, supplierName } = req.query;
    const updateData = {
        id: req.body.id,
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        address: req.body.address,
    };
    try {
        // Update storage document
        const updatedStorage = await StorageSchema.findOneAndUpdate({ id: storageID }, updateData, { new: true });
        if (!updatedStorage) return next(createError(NOT_FOUND, "Storage not found"));

        // Find supplier and update storage information in the supplier's storage array
        const supplier = await SupplierSchema.findOne({ id: supplierID, name: supplierName });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        const storageIndex = supplier.storage.findIndex(storage => storage.id === storageID);
        if (storageIndex !== -1) {
            supplier.storage[storageIndex] = { ...updateData };
            await supplier.save();
        }

        res.status(OK).json({
            success: true,
            status: OK,
            message: updatedStorage,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteStorage = async (req, res, next) => {
    const { storageID, supplierID, supplierName } = req.query;
    try {
        // Find supplier and remove storage information from the supplier's storage array
        const supplier = await SupplierSchema.findOne({ id: supplierID, name: supplierName });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        supplier.storage = supplier.storage.filter(storage => storage.id !== storageID);
        await supplier.save();

        // Delete storage document
        const deletedStorage = await StorageSchema.findOneAndDelete({ id: storageID });
        if (!deletedStorage) return next(createError(NOT_FOUND, "Storage not found"));

        res.status(OK).json({
            success: true,
            status: OK,
            message: "Storage deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};

export const getAllStorage = async (req, res, next) => {
    const { supplierID, supplierName } = req.query;
    try {
        const supplier = await SupplierSchema.findOne({ id: supplierID, name: supplierName });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        res.status(OK).json({
            success: true,
            status: OK,
            message: supplier.storage,
        });
    } catch (err) {
        next(err);
    }
};

export const getStorageSpecific = async (req, res, next) => {
    const { supplierID, supplierName } = req.query;
    const searchQuery = {};

    if (req.query.id) searchQuery["storage.id"] = req.query.id;
    if (req.query.name) searchQuery["storage.name"] = req.query.name;
    if (req.query.address) searchQuery["storage.address"] = req.query.address;
    try {
        const supplier = await SupplierSchema.findOne({ id: supplierID, name: supplierName });

        if (!supplier) {
            return next(createError(NOT_FOUND, "Supplier not found"));
        }

        let filteredStorage = supplier.storage;

        // Check if there are no search options specified
        if (Object.keys(searchQuery).length === 0) {
            res.status(OK).json({
                success: true,
                status: OK,
                data: filteredStorage,
            });
        } else {
            // Filter the storage array based on the search criteria
            if (req.query.id) filteredStorage = filteredStorage.filter(storage => storage.id === req.query.id);
            if (req.query.name) filteredStorage = filteredStorage.filter(storage => storage.name === req.query.name);
            if (req.query.address) filteredStorage = filteredStorage.filter(storage => storage.address === req.query.address);

            res.status(OK).json({
                success: true,
                status: OK,
                data: filteredStorage,
            });
        }
    } catch (err) {
        next(err);
    }
};

export const getStorageById = async (req, res, next) => {
    const { storageID } = req.query;
    const { passwordStorage } = req.body;
    try {
        const storage = await StorageSchema.findOne({ id: storageID, password: passwordStorage });
        if (!storage) return next(createError(NOT_FOUND, "Storage not found"));

        res.status(OK).json({
            success: true,
            status: OK,
            message: storage,
        });
    } catch (err) {
        next();
    }
}

export const addProductToStorage = async (req, res, next) => {
    const { storageID } = req.query;
    const { product_category, product_name, product_quantity } = req.body;

    try {
        // Find the storage document by ID
        const storage = await StorageSchema.findOne({ id: storageID });
        if (!storage) return next(createError(NOT_FOUND, "Storage not found"));

        // Check if the product_category already exists
        const existingProductCategory = storage.products.find(product => product.product_category === product_category);

        if (existingProductCategory) {
            // Check if product_name already exists within the existing product_category
            const existingProduct = existingProductCategory.product_value.find(product => product.name === product_name);

            if (existingProduct) {
                // Case 1: Update the product_quantity for an existing product
                existingProduct.quantity = product_quantity;
            } else {
                // Case 2: Add a new product_value object with product_name and product_quantity
                existingProductCategory.product_value.push({
                    name: product_name,
                    quantity: product_quantity,
                });
            }
        } else {
            // Case 3: Add a new product_category with product_name and product_quantity
            storage.products.push({
                product_category,
                product_value: [{
                    name: product_name,
                    quantity: product_quantity,
                }],
            });
        }

        await storage.save();

        res.status(OK).json({
            success: true,
            status: OK,
            message: storage.products,
        });
    } catch (err) {
        next(err);
    }
};

export const removeProductFromStorage = async (req, res, next) => {
    const { storageID } = req.query;

    // Extract product information from the request body
    const { product_category, product_name } = req.body;

    try {
        // Find the storage document by ID
        const storage = await StorageSchema.findOne({ id: storageID });

        if (!storage) {
            return next(createError(NOT_FOUND, "Storage not found"));
        }

        // Check if the product_category exists within the products array
        const existingProductCategoryIndex = storage.products.findIndex(product => product.product_category === product_category);

        if (existingProductCategoryIndex !== -1) {
            const existingProductCategory = storage.products[existingProductCategoryIndex];
            
            // Check if product_name exists within the existing product_category
            const existingProductIndex = existingProductCategory.product_value.findIndex(product => product.name === product_name);

            if (existingProductIndex !== -1) {
                // Remove the product with matching product_name from the existing product_category
                existingProductCategory.product_value.splice(existingProductIndex, 1);

                // If there are no more product_value objects in the product_category, remove the product_category itself
                if (existingProductCategory.product_value.length === 0) {
                    storage.products.splice(existingProductCategoryIndex, 1);
                }

                // Save the updated storage document
                await storage.save();

                res.status(OK).json({
                    success: true,
                    status: OK,
                    message: "Product removed from storage successfully",
                });
            } else {
                return next(createError(NOT_FOUND, "Product not found in the specified product category"));
            }
        } else {
            return next(createError(NOT_FOUND, "Product category not found in storage"));
        }
    } catch (err) {
        next(err);
    }
};
