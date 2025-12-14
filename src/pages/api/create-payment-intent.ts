import { NextApiRequest, NextApiResponse } from "next";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
    if (req.method === 'POST') {
        const { items } = req.body;

        try {
            if (!process.env.STRIPE_SECRET_KEY) {
                console.error("STRIPE_SECRET_KEY is missing.");
                throw new Error("Missing Stripe Secret Key");
            }

            if (!items || !items.length) {
                throw new Error("No items provided");
            }

            const itemId = items[0].id;
            let itemData: any = null;

            // 1. Try fetching from Firestore
            try {
                // Note: using client SDK in API route is not recommended for production but works for simple setups
                // if the environment is configured correctly.
                if (firestore) {
                    const docRef = doc(firestore, "content_library", itemId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        itemData = docSnap.data();
                    }
                }
            } catch (fsError) {
                console.warn("Firestore fetch failed in API, falling back to mock data if available:", fsError);
            }

            // 2. Fallback to Mock Data if Firestore failed or didn't have it
            if (!itemData) {
                console.log(`Item ${itemId} not found in Firestore (or FS failed), checking mock data...`);
                const mockItem = MOCK_CONTENT_API.find(i => i.id === itemId);
                if (mockItem) {
                    itemData = mockItem;
                }
            }

            if (!itemData) {
                throw new Error("Item not found in database or mock data");
            }

            const price = itemData.price;

            // Calculate amount in cents
            // Ensure price is a number
            const amount = Math.round(Number(price) * 100);

            if (isNaN(amount) || amount <= 0) {
                throw new Error("Invalid price calculated");
            }

            console.log(`Creating PaymentIntent for ${itemData.title || 'Item'} at $${price}...`);

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    itemId: itemId,
                    title: itemData.title || "Unknown Title"
                }
            });

            console.log("PaymentIntent created successfully:", paymentIntent.id);
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error: any) {
            console.error("Error in create-payment-intent:", error);
            res.status(500).json({ statusCode: 500, message: error.message || "Internal Server Error" });
        }

    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};
