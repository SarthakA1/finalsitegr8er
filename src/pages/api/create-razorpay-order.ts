import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";

// MOCK DATA for Server-Side Validation
const MOCK_CONTENT_API = [
    {
        id: "item_1",
        title: "Complete Algebra II Study Guide",
        price: 5.00,
    },
    {
        id: "item_2",
        title: "Physics Mechanics Cheat Sheet",
        price: 5.00,
    },
];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            console.error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing.");
            throw new Error("Server configuration error: Missing Razorpay Keys");
        }

        const instance = new Razorpay({
            key_id: key_id,
            key_secret: key_secret,
        });

        const { items } = req.body;
        if (!items || !items.length) {
            throw new Error("No items provided");
        }

        const itemId = items[0].id;
        let itemData = MOCK_CONTENT_API.find(i => i.id === itemId);

        if (!itemData) {
            console.warn(`Item ${itemId} not found. Using fallback.`);
            itemData = {
                id: itemId,
                title: "Premium Content",
                price: 5.00
            };
        }

        // Razorpay expects amount in smallest currency unit (paise for INR)
        // Note: Razorpay officially supports international currencies like USD.
        // 1 USD = 100 cents.
        const amount = Math.round(Number(itemData.price) * 100);

        const options = {
            amount: amount,
            currency: "USD",
            receipt: "order_rcptid_" + Math.random().toString(36).substring(7),
        };

        const order = await instance.orders.create(options);

        res.status(200).json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key_id: key_id // Sending Key ID to frontend is safe and needed for the script
        });

    } catch (error: any) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}
