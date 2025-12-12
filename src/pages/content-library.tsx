import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Flex,
    Text,
    SimpleGrid,
    Image,
    Button,
    Badge,
    useToast,
    Spinner,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure
} from '@chakra-ui/react';
import { FaLock, FaEye } from 'react-icons/fa';
import useContentLibrary, { ContentItem } from '@/hooks/useContentLibrary';
import Head from 'next/head';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/firebase/clientApp';
import { setDoc, doc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { useSetRecoilState } from 'recoil';
import { AuthModalState } from '@/atoms/authModalAtom';

// Razorpay Type Definition
declare global {
    interface Window {
        Razorpay: any;
    }
}

const ContentLibraryPage: React.FC = () => {
    const { contentItems, loading } = useContentLibrary();
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
    const selectedItemRef = useRef<ContentItem | null>(null); // Ref to hold current item for callbacks
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const toast = useToast();

    const [user] = useAuthState(auth);
    const setAuthModalState = useSetRecoilState(AuthModalState);

    // Viewer State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [viewUrl, setViewUrl] = useState('');
    const [viewType, setViewType] = useState<'image' | 'pdf'>('pdf');
    const [viewTitle, setViewTitle] = useState('');

    // Load Razorpay SDK
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Fetch User Purchases
    useEffect(() => {
        const fetchPurchases = async () => {
            if (!user) {
                setPurchasedIds(new Set());
                return;
            }
            try {
                const querySnapshot = await getDocs(collection(firestore, `users/${user.uid}/purchases`));
                const ids = new Set<string>();
                querySnapshot.forEach((doc) => {
                    ids.add(doc.id); // Assuming doc ID is item ID as per handlePaymentSuccess
                });
                setPurchasedIds(ids);
            } catch (error) {
                console.error("Error fetching purchases", error);
            }
        };
        fetchPurchases();
    }, [user]);

    const openViewer = (item: ContentItem) => {
        setViewTitle(item.title);
        setViewUrl(item.url);
        setViewType(item.type === 'image' ? 'image' : 'pdf');
        onOpen();
    };

    const handlePaymentSuccess = async (response: any) => {
        console.log("Razorpay Success:", response);

        const item = selectedItemRef.current; // Access via ref
        if (!user || !item) {
            console.error("Missing user or item in callback", { user, item });
            return;
        }

        try {
            // Save purchase to Firestore
            await setDoc(doc(firestore, `users/${user.uid}/purchases`, item.id), {
                itemId: item.id,
                title: item.title,
                url: item.url,
                purchaseDate: serverTimestamp(),
                paymentId: response.razorpay_payment_id
            });

            toast({
                title: "Purchase Successful!",
                description: "You can now view this content.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Update local state immediately
            setPurchasedIds(prev => new Set(prev).add(item.id));

            // Open Viewer
            openViewer(item);

        } catch (error) {
            console.error("Error saving purchase", error);
            toast({
                title: "Purchase Recorded",
                description: "Payment successful but failed to save record. Contact support.",
                status: "warning",
                duration: 5000,
            });
            openViewer(item);
        }

        setSelectedItem(null);
        selectedItemRef.current = null;
    };

    const handleBuyClick = async (item: ContentItem) => {
        if (!user) {
            setAuthModalState({ open: true, view: 'login' });
            return;
        }

        // If already purchased, just open
        if (purchasedIds.has(item.id)) {
            openViewer(item);
            return;
        }

        setSelectedItem(item);
        selectedItemRef.current = item; // Update ref
        setIsPaymentLoading(true);

        try {
            if (!window.Razorpay) {
                throw new Error("Razorpay SDK not loaded. Please check your internet.");
            }

            console.log("Creating Razorpay Order for:", item.title);

            // 1. Create Order on Server
            const res = await fetch("/api/create-razorpay-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [{ id: item.id }] }),
            });

            const data = await res.json();
            console.log("Order Created:", data);

            if (!res.ok) {
                throw new Error(data.message || "Failed to create order");
            }

            // 2. Open Razorpay Checktout
            const options = {
                key: data.key_id, // Key ID from server
                amount: data.amount,
                currency: data.currency,
                name: "Gr8er IB",
                description: `Purchase ${item.title}`,
                image: "/images/gr8er logo.png",
                order_id: data.id,
                handler: function (response: any) {
                    handlePaymentSuccess(response);
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: ""
                },
                retry: {
                    enabled: true
                },
                theme: {
                    color: "#805ad5"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                console.error("Payment Failed", response.error);
                toast({
                    title: "Payment Failed",
                    description: response.error.description || "Transaction declined",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });

            rzp1.open();

        } catch (error: any) {
            console.error("Payment Error:", error);
            toast({
                title: "Payment Error",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsPaymentLoading(false);
        }
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
                        {contentItems.map((item) => {
                            const isPurchased = purchasedIds.has(item.id);
                            return (
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
                                            colorScheme={isPurchased ? "green" : "yellow"}
                                            fontSize="0.9em"
                                            borderRadius="full"
                                            px={3}
                                            py={1}
                                            boxShadow="md"
                                        >
                                            {isPurchased ? "OWNED" : "PREMIUM"}
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
                                            <Text fontSize="2xl" fontWeight="800" color={isPurchased ? "green.600" : "purple.600"}>
                                                {isPurchased ? "Unlocked" : `$${item.price.toFixed(2)}`}
                                            </Text>
                                            <Button
                                                leftIcon={isPurchased ? <FaEye /> : <FaLock />}
                                                colorScheme={isPurchased ? "green" : "purple"}
                                                size="md"
                                                onClick={() => isPurchased ? openViewer(item) : handleBuyClick(item)}
                                                isLoading={isPaymentLoading && selectedItem?.id === item.id}
                                                boxShadow="md"
                                            >
                                                {isPurchased ? "View Content" : "Unlock Now"}
                                            </Button>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            );
                        })}
                    </SimpleGrid>
                )}
            </Flex>

            {/* Content Viewer Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <ModalOverlay />
                <ModalContent bg="gray.900">
                    <ModalHeader color="white">{viewTitle}</ModalHeader>
                    <ModalCloseButton color="white" />
                    <ModalBody p={0} height="calc(100vh - 60px)">
                        {viewType === 'image' ? (
                            <Flex justify="center" align="center" height="100%" bg="gray.900">
                                <Image src={viewUrl} maxH="100%" objectFit="contain" />
                            </Flex>
                        ) : (
                            <iframe
                                src={`${viewUrl}#toolbar=0`}
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                                title={viewTitle}
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};
export default ContentLibraryPage;
