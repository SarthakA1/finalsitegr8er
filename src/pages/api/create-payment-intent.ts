
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

            // Validate Items
            if (!items || !items.length) {
                throw new Error("No items provided");
            }

            const itemId = items[0].id;

            // Fetch Item from Firestore (Using Client SDK in API - works for public read)
            // Note: In strict production with rules, you might need Admin SDK, 
            // but for this MVP with open/user rules, this allows us to get the price securely on server.
            // We'll import firestore from a new internal helper or just recreate the instance if needed 
            // BUT: initializing client app in API route can be tricky with multiple instances.
            // BETTER APPROACH: We'll assume the client passes the ID, we verify it exists. 
            // Actually, for "Simple MVP" requested by user, we can trust the client OR ideally fetch.
            // Let's try to fetch using the existing client setup if possible, or just standard fetch if we had an endpoint.
            // Since initializing firebase app server-side with client SDK can duplicate app errors, let's handle that.

            // To be robust and simple without firebase-admin:
            // We will trust the price for NOW if we can't easily fetch, BUT user asked for "revamp properly".
            // So we MUST fetch.
            // Let's use a dynamic import for firebase to avoid init issues or just check apps.

            // ... Actually, the user already has `src/firebase/clientApp.ts` which exports `firestore`.
            // Importing it here might work if `window` check handles node env.
            // The `clientApp.ts` has `!getApps().length ? ...` check so it should be safe-ish.

            const { doc, getDoc } = require("firebase/firestore");
            const { firestore } = require("@/firebase/clientApp"); // This might fail if it depends on browser globals

            // Fallback: If we can't easily fetch server-side without admin SDK, we might have to pass price 
            // from client BUT verify signature? No that's too complex.
            // Let's try to use the `firestore` instance we have. 

            // Fetch the document
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
            if (error.code === 'MODULE_NOT_FOUND') {
                // Fallback if firebase import fails in API route (Node env issues)
                // This is a risk. If we can't read DB, we can't verify price.
                res.status(500).json({ statusCode: 500, message: "Server Configuration Error: Cannot verify item price." });
            } else {
                res.status(500).json({ statusCode: 500, message: error.message });
            }
        }

    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};
