
import { NextApiRequest, NextApiResponse } from "next";
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

            console.log("Creating PaymentIntent...");
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 500, // $5.00 in cents
                currency: "usd",
                // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            console.log("PaymentIntent created successfully:", paymentIntent.id);
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error: any) {
            console.error("Error in create-payment-intent:", error);
            if (error.message === "Missing Stripe Secret Key") {
                res.status(503).json({ statusCode: 503, message: "Stripe Configuration Missing. Please check server logs." });
            } else {
                res.status(500).json({ statusCode: 500, message: error.message });
            }
        }

    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};
