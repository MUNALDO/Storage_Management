import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
    {
        request_date: {
            type: Date,
            required: true
        },
        answer_date: {
            type: Date,
        },
        distributor_id: {
            type: String,
            required: true,
        },
        distributor_name: {
            type: String,
        },
        distributor_address: {
            type: String,
        },
        supplier_id: {
            type: String,
            required: true,
        },
        supplier_name: {
            type: String,
        },
        supplier_address: {
            type: String,
        },
        storage_id: {
            type: String,
            required: true,
        },
        storage_name: {
            type: String,
        },
        storage_address: {
            type: String,
        },
        product_category: {
            type: String,
            required: true,
        },
        product_name: {
            type: String,
            required: true,
        },
        product_quantity: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["accept", "decline", "pending"],
            default: "pending"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Request", requestSchema);

