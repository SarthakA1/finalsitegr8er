import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
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

        let amount: number;

        if (itemId === 'PACKAGE_UNLIMITED') {
            // Fixed price for Unlimited Access: $15.00
            amount = 1500;
        } else {
            // Fetch item from Firestore to get real price
            const itemRef = doc(firestore, 'content_library', itemId);
            const itemSnap = await getDoc(itemRef);

            if (!itemSnap.exists()) {
                throw new Error("Item not found");
            }

            const itemData = itemSnap.data();
            const price = itemData.price;

            if (price === undefined || price === null) {
                throw new Error("Item price not found");
            }

            // Razorpay expects amount in smallest currency unit (paise for INR, cents for USD)
            // 1 USD = 100 cents.
            amount = Math.round(Number(price) * 100);
        }

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
