import { OK } from "../constant/HttpStatus.js";
import SupplierSchema from "../models/SupplierSchema.js"

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
                data: filteredSupplier,
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