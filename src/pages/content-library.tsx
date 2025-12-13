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
    useDisclosure,
    Select,
    Icon
} from '@chakra-ui/react';
import { FaLock, FaEye } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';
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

    // Filters
    const [filterSession, setFilterSession] = useState("");
    const [filterScore, setFilterScore] = useState("");

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
        <Box minH="100vh" bgGradient="linear(to-br, gray.900, purple.900, blue.900)" py={10} px={{ base: 4, md: 10 }}>
            <Head>
                <title>Library | Gr8er IB</title>
            </Head>

            <Flex direction="column" maxWidth="1200px" mx="auto">
                {/* Header */}
                <Box mb={10} textAlign="center">
                    <Text
                        fontSize={{ base: "3xl", md: "5xl" }}
                        fontWeight="900"
                        bgGradient="linear(to-r, cyan.400, purple.400, pink.400)"
                        bgClip="text"
                        mb={3}
                        letterSpacing="tight"
                    >
                        Premium Content Library
                    </Text>
                    <Text fontSize="lg" color="gray.300" maxW="600px" mx="auto">
                        Unlock top-tier IB resources to skyrocket your grades.
                    </Text>
                </Box>

                {/* Filters */}
                <Box mb={12}>
                    <Flex gap={4} justify="center" wrap="wrap">
                        <Select
                            placeholder="All Sessions"
                            w="auto"
                            bg="whiteAlpha.100"
                            borderColor="whiteAlpha.300"
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                            _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px purple.400" }}
                            onChange={(e) => setFilterSession(e.target.value)}
                            sx={{ option: { color: "black" } }} // Fix dropdown text color
                        >
                            <option value="May 2025">May 2025</option>
                            <option value="Nov 2024">Nov 2024</option>
                            <option value="May 2024">May 2024</option>
                            <option value="Nov 2023">Nov 2023</option>
                        </Select>
                        <Select
                            placeholder="All Scores"
                            w="auto"
                            bg="whiteAlpha.100"
                            borderColor="whiteAlpha.300"
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                            _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px purple.400" }}
                            onChange={(e) => setFilterScore(e.target.value)}
                            sx={{ option: { color: "black" } }}
                        >
                            <option value="7">Score 7</option>
                            <option value="6">Score 6</option>
                            <option value="5">Score 5</option>
                        </Select>
                    </Flex>
                </Box>

                {loading ? (
                    <Flex justify="center" align="center" minH="300px">
                        <Spinner size="xl" color="cyan.400" speed="0.8s" thickness="4px" />
                    </Flex>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                        {contentItems
                            .filter(item => {
                                if (filterSession && item.session !== filterSession) return false;
                                if (filterScore && item.score?.toString() !== filterScore) return false;
                                return true;
                            })
                            .map((item) => {
                                const isPurchased = purchasedIds.has(item.id);
                                return (
                                    <Flex
                                        key={item.id}
                                        direction="column"
                                        bg="whiteAlpha.50"
                                        backdropFilter="blur(16px)"
                                        borderRadius="2xl"
                                        overflow="hidden"
                                        border="1px solid"
                                        borderColor="whiteAlpha.100"
                                        boxShadow="lg"
                                        transition="all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)"
                                        _hover={{
                                            transform: 'translateY(-8px)',
                                            boxShadow: '2xl',
                                            bg: "whiteAlpha.100",
                                            borderColor: "purple.400"
                                        }}
                                    >
                                        <Box position="relative" height="220px">
                                            <Image
                                                src={item.thumbnail}
                                                alt={item.title}
                                                objectFit="cover"
                                                width="100%"
                                                height="100%"
                                                transition="transform 0.4s"
                                                _hover={{ transform: 'scale(1.05)' }}
                                            />
                                            <Box position="absolute" inset="0" bgGradient="linear(to-t, blackAlpha.800, transparent)" pointerEvents="none" />

                                            <Badge
                                                position="absolute"
                                                top={4}
                                                right={4}
                                                colorScheme={isPurchased ? "green" : "purple"}
                                                variant="solid"
                                                fontSize="0.8em"
                                                borderRadius="full"
                                                px={3}
                                                py={1}
                                                boxShadow="lg"
                                                textTransform="uppercase"
                                                letterSpacing="wider"
                                            >
                                                {isPurchased ? "OWNED" : "PREMIUM"}
                                            </Badge>

                                            {/* Metadata Tags */}
                                            <Flex position="absolute" bottom={4} left={4} gap={2}>
                                                {item.score && (
                                                    <Badge bg="purple.600" color="white" borderRadius="md" px={2} py={0.5} boxShadow="md">Score: {item.score}</Badge>
                                                )}
                                                {item.session && (
                                                    <Badge bg="cyan.600" color="white" borderRadius="md" px={2} py={0.5} boxShadow="md">{item.session}</Badge>
                                                )}
                                            </Flex>
                                        </Box>

                                        <Flex direction="column" p={6} flex={1} justify="space-between">
                                            <Box>
                                                <Text fontSize="xl" fontWeight="700" mb={3} color="white" lineHeight="short">
                                                    {item.title}
                                                </Text>
                                                <Text fontSize="sm" color="gray.300" mb={6} noOfLines={3}>
                                                    {item.description}
                                                </Text>
                                            </Box>

                                            {isPurchased ? (
                                                <Button
                                                    leftIcon={<FaEye />}
                                                    colorScheme="green"
                                                    variant="outline"
                                                    size="lg"
                                                    width="full"
                                                    onClick={() => openViewer(item)}
                                                    _hover={{ bg: "green.500", color: "white" }}
                                                >
                                                    View Content
                                                </Button>
                                            ) : (
                                                <Button
                                                    leftIcon={<Icon as={FiShoppingCart} />}
                                                    bgGradient="linear(to-r, purple.500, pink.500)"
                                                    _hover={{ bgGradient: "linear(to-r, purple.400, pink.400)", shadow: "lg" }}
                                                    color="white"
                                                    size="lg"
                                                    width="full"
                                                    isLoading={isPaymentLoading && selectedItem?.id === item.id}
                                                    onClick={() => handleBuyClick(item)}
                                                    border="none"
                                                >
                                                    Unlock for ${item.price.toFixed(2)}
                                                </Button>
                                            )}
                                        </Flex>
                                    </Flex>
                                );
                            })}
                    </SimpleGrid>
                )}
            </Flex>

            {/* Content Viewer Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.800" />
                <ModalContent bg="gray.900">
                    <ModalHeader color="white" borderBottom="1px solid" borderColor="whiteAlpha.200">
                        {viewTitle}
                    </ModalHeader>
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
