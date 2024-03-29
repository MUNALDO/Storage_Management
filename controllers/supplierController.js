import { BAD_REQUEST, CONFLICT, CREATED, NOT_FOUND, OK } from "../constant/HttpStatus.js";
import DistributorCompanySchema from "../models/DistributorCompanySchema.js";
import RequestSchema from "../models/RequestSchema.js";
import StorageSchema from "../models/StorageSchema.js";
import SupplierSchema from "../models/SupplierSchema.js";
import { createError } from "../utils/error.js";
import nodemailer from "nodemailer";

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
        newStorage.supplier_id = supplier.id;
        newStorage.supplier_name = supplier.name;
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
        // Find supplier and update storage information in the supplier's storage array
        const supplier = await SupplierSchema.findOne({ id: supplierID, name: supplierName });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        // Update storage document
        const updatedStorage = await StorageSchema.findOneAndUpdate(
            { id: storageID, supplier_id: supplier.id, supplier_name: supplier.name },
            updateData,
            { new: true }
        );
        if (!updatedStorage) return next(createError(NOT_FOUND, "Storage not found"));

        const storageIndex = supplier.storage.findIndex(storage => storage.id === storageID);
        if (storageIndex !== -1) {
            supplier.storage[storageIndex] = {
                id: updatedStorage.id,
                name: updatedStorage.name,
                password: updatedStorage.password,
                email: updatedStorage.email,
                address: updatedStorage.address,
            };
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
        const deletedStorage = await StorageSchema.findOneAndDelete({ id: storageID, supplier_id: supplier.id, supplier_name: supplier.name });
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
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        let filteredStorage = supplier.storage;

        // Check if there are no search options specified
        if (Object.keys(searchQuery).length === 0) {
            res.status(OK).json({
                success: true,
                status: OK,
                message: filteredStorage,
            });
        } else {
            // Filter the storage array based on the search criteria
            if (req.query.id) filteredStorage = filteredStorage.filter(storage => storage.id === req.query.id);
            if (req.query.name) filteredStorage = filteredStorage.filter(storage => storage.name === req.query.name);
            if (req.query.address) filteredStorage = filteredStorage.filter(storage => storage.address === req.query.address);

            res.status(OK).json({
                success: true,
                status: OK,
                message: filteredStorage,
            });
        }
    } catch (err) {
        next(err);
    }
};

export const getStorageById = async (req, res, next) => {
    const { storageID, supplierID, supplierName } = req.query;
    const { passwordStorage } = req.body;
    try {
        const supplier = await SupplierSchema.findOne({ id: supplierID, name: supplierName });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        const storage = await StorageSchema.findOne({ id: storageID, supplier_id: supplier.id, supplier_name: supplier.name });
        if (!storage) return next(createError(NOT_FOUND, "Storage not found"));
        if (passwordStorage != storage.password) return next(createError(BAD_REQUEST, "Wrong password!"));

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
    const { storageID, supplierID, supplierName } = req.query;
    const { product_category, product_name, product_quantity } = req.body;
    try {
        // Find the storage document by ID
        const supplier = await SupplierSchema.findOne({ id: supplierID, name: supplierName });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        const storage = await StorageSchema.findOne({ id: storageID, supplier_id: supplier.id, supplier_name: supplier.name });
        if (!storage) return next(createError(NOT_FOUND, "Storage not found"));

        // Check if the product_category already exists
        const existingProductCategory = storage.products.find(product => product.product_category === product_category);

        if (existingProductCategory) {
            // Check if product_name already exists within the existing product_category
            const existingProduct = existingProductCategory.product_value.find(product => product.name === product_name);

            if (existingProduct) {
                // Case 1: Send error message for an existing product
                return next(createError(BAD_REQUEST, "Product already exists in the category"));
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

export const updateProductInStorage = async (req, res, next) => {
    const { storageID, supplierID, supplierName } = req.query;
    const { product_category, new_product_category, product_name, new_product_name, new_product_quantity } = req.body;
    try {
        // Find the storage document by ID
        const supplier = await SupplierSchema.findOne({ id: supplierID, name: supplierName });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        const storage = await StorageSchema.findOne({ id: storageID, supplier_id: supplier.id, supplier_name: supplier.name });
        if (!storage) return next(createError(NOT_FOUND, "Storage not found"));

        // Check if the product_category exists within the products array
        const existingProductCategoryIndex = storage.products.findIndex(product => product.product_category === product_category);

        if (existingProductCategoryIndex !== -1) {
            const existingProductCategory = storage.products[existingProductCategoryIndex];

            // Check if product_name exists within the existing product_category
            const existingProductIndex = existingProductCategory.product_value.findIndex(product => product.name === product_name);
            if (existingProductIndex !== -1) {
                // Case 1.1: Update the category name and all product_value (name, quantity)
                if (new_product_category) {
                    existingProductCategory.product_category = new_product_category;
                }
                if (new_product_name) {
                    // Check if the new product_name already exists in the category
                    const newProductIndex = existingProductCategory.product_value.findIndex(product => product.name === new_product_name);

                    if (newProductIndex !== -1) {
                        // Case 1.1: Send error message for an existing product with the new name
                        return next(createError(BAD_REQUEST, "Product with the new name already exists in the category"));
                    } else {
                        existingProductCategory.product_value[existingProductIndex].name = new_product_name;
                    }
                }
                if (new_product_quantity) {
                    existingProductCategory.product_value[existingProductIndex].quantity = new_product_quantity;
                }

                await storage.save();
                res.status(OK).json({
                    success: true,
                    status: OK,
                    message: storage,
                });
            } else {
                // Case 1.2: Update the category name only
                if (new_product_category) {
                    existingProductCategory.product_category = new_product_category;
                }

                // Save the updated storage document
                await storage.save();

                res.status(OK).json({
                    success: true,
                    status: OK,
                    message: storage,
                });
            }
        } else {
            // Case 1.3: Send error message for non-existing category
            return next(createError(BAD_REQUEST, "Product category not found in storage"));
        }
    } catch (err) {
        next(err);
    }
};

export const removeProductFromStorage = async (req, res, next) => {
    const { storageID, supplierID, supplierName } = req.query;
    const { product_category, product_name } = req.body;
    try {
        // Find the storage document by ID
        const supplier = await SupplierSchema.findOne({ id: supplierID, name: supplierName });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found"));

        const storage = await StorageSchema.findOne({ id: storageID, supplier_id: supplier.id, supplier_name: supplier.name });
        if (!storage) return next(createError(NOT_FOUND, "Storage not found"));

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

export const handleRequest = async (req, res, next) => {
    try {
        const updateRequest = await RequestSchema.findOneAndUpdate(
            { _id: req.params._id },
            {
                $set:
                {
                    answer_date: new Date(),
                    status: req.body.answer_status
                }
            },
            { new: true }
        );
        if (!updateRequest) return next(createError(NOT_FOUND, "Request not found!"));

        const distributor = await DistributorCompanySchema.findOne({ id: updateRequest.distributor_id, name: updateRequest.distributor_name });
        if (!distributor) return next(createError(NOT_FOUND, "Distributor not found"));

        const storage = await StorageSchema.findOne({ id: updateRequest.storage_id, supplier_id: updateRequest.supplier_id, supplier_name: updateRequest.supplier_name });
        if (!storage) return next(createError(NOT_FOUND, "Storage not found"));

        const existingProductCategory = storage.products.find(product => product.product_category === updateRequest.product_category);
        if (!existingProductCategory) return next(createError(NOT_FOUND, "Product category not found"));

        const existingProductName = existingProductCategory.product_value.find(product => product.name === updateRequest.product_name);
        if (!existingProductName) return next(createError(NOT_FOUND, "Product name not found"));

        if (updateRequest.status == "accept") {
            if (req.body.product_quantity) {
                updateRequest.product_quantity = req.body.product_quantity;
                existingProductName.quantity = existingProductName.quantity - req.body.product_quantity;
                await updateRequest.save();
                await storage.save();
            } else {
                existingProductName.quantity = existingProductName.quantity - updateRequest.product_quantity;
                await updateRequest.save();
                await storage.save();
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MAIL_ADDRESS,
                    pass: process.env.MAIL_PASSWORD,
                },
            });

            const emailSubject = `Update Request - ${updateRequest._id}`;

            const emailContent = `
                <div>
                    <p>Hi ${distributor.id} - ${distributor.name},</p>
                    <p>Your request has been updated.</p>
                    <p>Request Date: ${updateRequest.request_date}</p>
                    <p>Answer Date: ${new Date()}</p>
                    <p>Status: ${req.body.answer_status}</p>
                    <p>Thank you for using our service.</p>
                </div>
            `;

            const mailOptions = {
                from: '"No Reply" <no-reply@gmail.com>',
                to: distributor.email,
                subject: emailSubject,
                html: emailContent,
            };

            await transporter.sendMail(mailOptions);
            res.status(OK).json({
                success: true,
                status: OK,
                message: updateRequest,
                data: storage
            });
        } else if (updateRequest.status == "decline") {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MAIL_ADDRESS,
                    pass: process.env.MAIL_PASSWORD,
                },
            });

            const emailSubject = `Request Update`;

            const emailContent = `
                <div>
                    <p>Hi ${distributor.id} - ${distributor.name},</p>
                    <p>Your request has been updated.</p>
                    <p>Request Date: ${updateRequest.request_date}</p>
                    <p>Answer Date: ${new Date()}</p>
                    <p>Status: ${req.body.answer_status}</p>
                    <p>Thank you for using our service.</p>
                </div>
            `;

            const mailOptions = {
                from: '"No Reply" <no-reply@gmail.com>',
                to: distributor.email,
                subject: emailSubject,
                html: emailContent,
            };

            await transporter.sendMail(mailOptions);
            res.status(OK).json({
                success: true,
                status: OK,
                message: updateRequest,
                data: storage
            });
        }
    } catch (err) {
        next(err);
    }
}

export const getRequest = async (req, res, next) => {
    const { request_date, answer_date, distributorID, supplierID, storageID, status } = req.query;
    try {
        let query = {};

        if (request_date) {
            query.request_date = { $gte: new Date(request_date) };
        }
        if (answer_date) {
            query.answer_date = { $gte: new Date(answer_date) };
        }
        if (distributorID) {
            query.distributor_id = distributorID;
        }
        if (supplierID) {
            query.supplier_id = supplierID;
        }
        if (storageID) {
            query.storage_id = storageID;
        }
        if (status) {
            query.status = status;
        }

        const requests = await RequestSchema.find(query);
        res.status(OK).json({
            success: true,
            status: OK,
            message: requests,
        });
    } catch (err) {
        next(err);
    }
};