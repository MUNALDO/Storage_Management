import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createError } from "../utils/error.js";
import { BAD_REQUEST, CONFLICT, CREATED, NOT_FOUND, OK } from "../constant/HttpStatus.js";
import dotenv from 'dotenv';
import SupplierSchema from "../models/SupplierSchema.js";
import DistributorCompanySchema from "../models/DistributorCompanySchema.js";

dotenv.config();

export const registerSupplier = async (req, res, next) => {
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)
        const newSupplier = new SupplierSchema({
            ...req.body,
            id: req.body.id.trim(),
            name: req.body.name.trim(),
            password: hash,
        })
        const supplier = await SupplierSchema.findOne({ name: newSupplier.name });
        if (supplier) return next(createError(CONFLICT, "Supplier is already exists!"))

        await newSupplier.save()
        res.status(CREATED).json({
            success: true,
            status: CREATED,
            message: newSupplier,
        });
    } catch (err) {
        next(err)
    }
};

export const loginSupplier = async (req, res, next) => {
    try {
        const supplier = await SupplierSchema.findOne({ id: req.body.id });
        if (!supplier) return next(createError(NOT_FOUND, "Supplier not found!"))
        const isPasswordCorrect = await bcrypt.compare(
            req.body.password,
            supplier.password
        )
        if (!isPasswordCorrect) return next(createError(BAD_REQUEST, "Wrong password!"))
        const token_supplier = jwt.sign(
            { id: supplier.id },
            process.env.JWT_SUPPLIER,
            { expiresIn: "24h" },
        )
        const { password, ...otherDetails } = supplier._doc;
        res.cookie("access_token_supplier", token_supplier, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        }).status(OK).json({ details: { ...otherDetails } })
    } catch (err) {
        next(err)
    }
};

export const logoutSupplier = (req, res, next) => {
    res.clearCookie("access_token_supplier")
        .status(OK)
        .json("Supplier has been successfully logged out.");
};

export const registerDistributor = async (req, res, next) => {
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)
        const newDistributor = new DistributorCompanySchema({
            ...req.body,
            id: req.body.id.trim(),
            name: req.body.name.trim(),
            password: hash,
        })
        const distributor = await DistributorCompanySchema.findOne({ name: newDistributor.name });
        if (distributor) return next(createError(CONFLICT, "Distributor is already exists!"))

        await newDistributor.save()
        res.status(CREATED).json({
            success: true,
            status: CREATED,
            message: newDistributor,
        });
    } catch (err) {
        next(err)
    }
};

export const loginDistributor = async (req, res, next) => {
    try {
        const distributor = await DistributorCompanySchema.findOne({ id: req.body.id });
        if (!distributor) return next(createError(NOT_FOUND, "Distributor not found!"))
        const isPasswordCorrect = await bcrypt.compare(
            req.body.password,
            distributor.password
        )
        if (!isPasswordCorrect) return next(createError(BAD_REQUEST, "Wrong password!"))
        const token_distributor = jwt.sign(
            { id: distributor.id },
            process.env.JWT_DISTRIBUTOR,
            { expiresIn: "24h" },
        )
        const { password, ...otherDetails } = distributor._doc;
        res.cookie("access_token_distributor", token_distributor, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        }).status(OK).json({ details: { ...otherDetails } })
    } catch (err) {
        next(err)
    }
};

export const logoutDistributor = (req, res, next) => {
    res.clearCookie("access_token_distributor")
        .status(OK)
        .json("Distributor has been successfully logged out.");
};