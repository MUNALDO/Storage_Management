import jwt from "jsonwebtoken";
import { FORBIDDEN, UNAUTHORIZED } from "../constant/HttpStatus.js";
import { createError } from "../utils/error.js";
import dotenv from 'dotenv';

dotenv.config();

export const verifyTokenSupplier = (req, res, next) => {
    const token_supplier = req.cookies.access_token_supplier;
    if (!token_supplier) return next(createError(UNAUTHORIZED, "You are not authenticated as Supplier"));

    jwt.verify(token_supplier, process.env.JWT_SUPPLIER, (err, supplier) => {
        if (err) {
            return next(createError(FORBIDDEN, "Token is not valid"));
        } else {
            // console.log(req);
            req.supplier = supplier;
            next();
        }
    });
};

export const verifyTokenDistributor = (req, res, next) => {
    const token_distributor = req.cookies.access_token_distributor;
    if (!token_distributor) return next(createError(UNAUTHORIZED, "You are not authenticated as Distributor"));

    jwt.verify(token_distributor, process.env.JWT_DISTRIBUTOR, (err, distributor) => {
        if (err) {
            return next(createError(FORBIDDEN, "Token is not valid"));
        } else {
            // console.log(req);
            req.distributor = distributor;
            next();
        }
    });
};