import React, { useState } from 'react';
import {
    Box,
    Flex,
    Text,
    SimpleGrid,
    Image,
    Button,
    Badge,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    useToast,
    Spinner,
    Icon
} from '@chakra-ui/react';
import { FaLock, FaDownload, FaCheckCircle, FaCreditCard } from 'react-icons/fa';
import useContentLibrary, { ContentItem } from '@/hooks/useContentLibrary';
import Head from 'next/head';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/ContentLibrary/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const ContentLibraryPage: React.FC = () => {
    const { contentItems, loading } = useContentLibrary();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
    const [clientSecret, setClientSecret] = useState("");
    const toast = useToast();

    const handleBuyClick = async (item: ContentItem) => {
        setSelectedItem(item);

        // Create PaymentIntent as soon as the purchase modal opens
        try {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [{ id: item.id }] }),
            });

            if (!res.ok) {
                throw new Error(`Server returned ${res.status} ${res.statusText}`);
            }

            const data = await res.json();

            if (!data.clientSecret) {
                throw new Error("No client secret returned from server");
            }

            setClientSecret(data.clientSecret);
            onOpen();
        } catch (error: any) {
            console.error("Error creating payment intent", error);
            toast({
                title: "Payment Error",
                description: "Could not initialize payment. Please try again. " + error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handlePaymentSuccess = () => {
        onClose();
        toast({
            title: "Purchase Successful!",
            description: `You have successfully purchased ${selectedItem?.title}. Downloading now...`,
            status: "success",
            duration: 5000,
            isClosable: true,
        });

        // Simulate download
        if (selectedItem) {
            const link = document.createElement('a');
            link.href = selectedItem.url;
            link.download = selectedItem.title;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        setSelectedItem(null);
        setClientSecret("");
    };

    return (
        <Box minH="100vh" bg="#f7fafc" py={10} px={{ base: 4, md: 10 }}>
            <Head>
                <title>Content Library | Premium Resources</title>
            </Head>

            <Flex direction="column" maxWidth="1200px" mx="auto">
                <Box mb={8} textAlign="center">
                    <Text
                        fontSize={{ base: "3xl", md: "5xl" }}
                        fontWeight="800"
                        bgGradient="linear(to-r, blue.400, purple.500)"
                        bgClip="text"
                        mb={2}
                    >
                        Premium Content Library
                    </Text>
                    <Text fontSize="lg" color="gray.600">
                        High-quality study materials to boost your grades.
                    </Text>
                </Box>

                {loading ? (
                    <Flex justify="center" align="center" minH="300px">
                        <Spinner size="xl" color="purple.500" />
                    </Flex>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                        {contentItems.map((item) => (
                            <Flex
                                key={item.id}
                                direction="column"
                                bg="white"
                                borderRadius="2xl"
                                overflow="hidden"
                                boxShadow="lg"
                                transition="all 0.3s"
                                _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
                                border="1px solid"
                                borderColor="gray.100"
                            >
                                <Box position="relative" height="200px" bg="gray.100">
                                    <Image
                                        src={item.thumbnail}
                                        alt={item.title}
                                        objectFit="cover"
                                        width="100%"
                                        height="100%"
                                    />
                                    <Badge
                                        position="absolute"
                                        top={4}
                                        right={4}
                                        colorScheme="yellow"
                                        fontSize="0.9em"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        boxShadow="md"
                                    >
                                        PREMIUM
                                    </Badge>
                                </Box>

                                <Flex direction="column" p={6} flex={1}>
                                    <Text fontSize="xl" fontWeight="700" mb={2} color="gray.800" noOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500" mb={4} flex={1} noOfLines={3}>
                                        {item.description}
                                    </Text>

                                    <Flex align="center" justify="space-between" mt="auto" pt={4} borderTop="1px solid" borderColor="gray.100">
                                        <Text fontSize="2xl" fontWeight="800" color="purple.600">
                                            $5.00
                                        </Text>
                                        <Button
                                            leftIcon={<FaLock />}
                                            colorScheme="purple"
                                            size="md"
                                            onClick={() => handleBuyClick(item)}
                                            boxShadow="md"
                                        >
                                            Unlock Now
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Flex>
                        ))}
                    </SimpleGrid>
                )}
            </Flex>

            {/* Simulated Purchase Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
                <ModalContent borderRadius="xl" boxShadow="2xl">
                    <ModalHeader borderBottom="1px solid" borderColor="gray.100" pb={4}>
                        <Flex align="center" gap={3}>
                            <Icon as={FaCreditCard} color="purple.500" />
                            <Text fontSize="lg">Complete Purchase</Text>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton />

                    <ModalBody py={6}>
                        {selectedItem && clientSecret && (
                            <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                                <Flex direction="column" gap={4} mb={6}>
                                    <Flex align="start" gap={4} p={3} bg="gray.50" borderRadius="lg">
                                        <Image
                                            src={selectedItem.thumbnail}
                                            boxSize="60px"
                                            objectFit="cover"
                                            borderRadius="md"
                                        />
                                        <Box>
                                            <Text fontWeight="bold" fontSize="md">{selectedItem.title}</Text>
                                            <Text color="purple.600" fontWeight="800">$5.00 USD</Text>
                                        </Box>
                                    </Flex>
                                </Flex>
                                <CheckoutForm onSuccess={handlePaymentSuccess} />
                            </Elements>
                        )}
                        {!clientSecret && (
                            <Flex justify="center" align="center" py={10}>
                                <Spinner color="purple.500" />
                            </Flex>
                        )}
                    </ModalBody>
                    {/* Footer removed as CheckoutForm handles submission */}
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ContentLibraryPage;
