import { NextApiRequest, NextApiResponse } from "next";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { items } = req.body;
        // In a real app, calculate the order total on the server to prevent
        // people from directly manipulating the amount on the client
        // For this MVP, we assume a fixed price of $5.00 for any item as per requirements

        try {
            if (!process.env.STRIPE_SECRET_KEY) {
                console.error("STRIPE_SECRET_KEY is missing in environment variables.");
                throw new Error("Missing Stripe Secret Key");
            }

            // Validate Items
            if (!items || !items.length) {
                throw new Error("No items provided");
            }

            const itemId = items[0].id;

            // Fetch the document using standard imports
            // Note: In Next.js API routes, the client SDK works fine for reading public collections
            const docRef = doc(firestore, "content_library", itemId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error("Item not found");
            }

            const itemData = docSnap.data();
            const price = itemData.price;

            // Calculate amount in cents
            const amount = Math.round(price * 100);

            console.log(`Creating PaymentIntent for ${itemData.title} at $${price}...`);

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    itemId: itemId,
                    title: itemData.title
                }
            });

            console.log("PaymentIntent created successfully:", paymentIntent.id);
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error: any) {
            console.error("Error in create-payment-intent:", error);
            res.status(500).json({ statusCode: 500, message: error.message });
        }

    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};
