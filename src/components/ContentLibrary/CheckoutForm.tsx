
import React, { useEffect, useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { Button, Alert, AlertIcon, Flex } from "@chakra-ui/react";
import { FaLock } from 'react-icons/fa';

interface CheckoutFormProps {
    onSuccess: () => void;
}

export default function CheckoutForm({ onSuccess }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    // This case is usually handled by redirect, but if we stay on page:
                    setMessage("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                // For this modal flow, we might want to handle it without redirect if possible?
                // standard stripe flow redirects. 
                // to avoid redirect we can use redirect: 'if_required'
                return_url: window.location.href,
            },
            redirect: "if_required",
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "An unexpected error occurred.");
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Handle successful payment logic here
            onSuccess();
        }

        setIsLoading(false);
    };

    const paymentElementOptions = {
        layout: "tabs" as const,
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" options={paymentElementOptions} />

            <Flex mt={6} justify="flex-end">
                <Button
                    disabled={isLoading || !stripe || !elements}
                    id="submit"
                    type="submit"
                    colorScheme="purple"
                    width="100%"
                    isLoading={isLoading}
                    loadingText="Processing..."
                    leftIcon={<FaLock />}
                >
                    Pay Now
                </Button>
            </Flex>

            {message && (
                <Alert status="error" mt={4} borderRadius="md">
                    <AlertIcon />
                    {message}
                </Alert>
            )}
        </form>
    );
}
