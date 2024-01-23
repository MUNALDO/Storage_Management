import mongoose from "mongoose";

const storageSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        address: {
            type: String,
        },
        products: [
            {
                product_category: {
                    type: String
                },
                product_value: [
                    {
                        name: {
                            type: String
                        },
                        quantity: {
                            type: Number
                        },
                    }
                ]
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model("Storage", storageSchema);

