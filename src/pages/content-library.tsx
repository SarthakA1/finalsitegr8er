import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { FiShoppingCart, FiUploadCloud } from 'react-icons/fi';
import useContentLibrary, { ContentItem } from '@/hooks/useContentLibrary';
import Head from 'next/head';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/firebase/clientApp';
import { setDoc, doc, serverTimestamp, collection, getDocs, updateDoc, increment } from 'firebase/firestore';
import { useSetRecoilState } from 'recoil';
import { AuthModalState } from '@/atoms/authModalAtom';
import DocumentViewerModal from '@/components/Modal/DocumentViewerModal';

import { useRouter } from 'next/router';

// Razorpay Type Definition
declare global {
    interface Window {
        Razorpay: any;
    }
}

const ContentLibraryPage: React.FC = () => {
    console.log("ContentLibraryPage rendering...");
    const router = useRouter();
    const { contentItems, loading } = useContentLibrary();
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
    const selectedItemRef = useRef<ContentItem | null>(null); // Ref to hold current item for callbacks
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());

    // Filters
    const [selectedProgram, setSelectedProgram] = useState<"DP" | "MYP">("DP");
    const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
    const [selectedScores, setSelectedScores] = useState<string[]>([]);
    const [selectedResourceTypes, setSelectedResourceTypes] = useState<string[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedTokTypes, setSelectedTokTypes] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState<string>("latest");

    // Filter Options
    const SESSIONS = ["May 2025", "Nov 2024", "May 2024", "Nov 2023"];

    // Resource Types
    const RESOURCE_TYPES_DP = ["IA", "EE", "TOK"];
    const RESOURCE_TYPES_MYP = ["Personal Project", "Portfolio - Design", "Portfolio - Drama", "Portfolio - Music", "Portfolio - Visual Arts"];

    // Dynamic Subjects from Content
    const availableSubjects = useMemo(() => {
        const subjects = new Set<string>();
        contentItems.forEach(item => {
            // Filter by program to show relevant subjects
            if (item.program === selectedProgram && item.subject) {
                // Exclude TOK specific types from general subject list
                if (item.subject !== 'Essay' && item.subject !== 'Exhibition') {
                    subjects.add(item.subject);
                }
            }
        });
        return Array.from(subjects).sort();
    }, [contentItems, selectedProgram]);

    // Reset filters when program changes
    useEffect(() => {
        setSelectedResourceTypes([]);
        setSelectedSessions([]);
        setSelectedScores([]);
        setSelectedSubjects([]);
        setSelectedTokTypes([]);
    }, [selectedProgram]);

    const toggleSession = (session: string) => {
        setSelectedSessions(prev =>
            prev.includes(session)
                ? prev.filter(s => s !== session)
                : [...prev, session]
        );
    };

    const toggleScore = (score: string) => {
        setSelectedScores(prev =>
            prev.includes(score)
                ? prev.filter(s => s !== score)
                : [...prev, score]
        );
    };

    const toggleResourceType = (type: string) => {
        setSelectedResourceTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const toggleSubject = (subj: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subj)
                ? prev.filter(s => s !== subj)
                : [...prev, subj]
        );
    };

    const toggleTokType = (type: string) => {
        setSelectedTokTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

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

            // Increment purchase count on the item itself
            const itemRef = doc(firestore, 'content_library', item.id);
            await updateDoc(itemRef, {
                purchaseCount: increment(1)
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
        <Box minH="100vh" bg="gray.50" py={10} px={{ base: 4, md: 10 }}>
            <Head>
                <title>Library | GR8ER IB</title>
            </Head>

            <Flex direction="column" maxWidth="1200px" mx="auto">
                {/* Header */}
                <Box mb={8} textAlign="center">
                    <Text
                        fontSize={{ base: "3xl", md: "4xl" }}
                        fontWeight="800"
                        color="gray.800"
                        mb={3}
                        letterSpacing="tight"
                    >
                        Content Library
                    </Text>
                    <Text fontSize="lg" color="gray.500" maxW="600px" mx="auto">
                        Premium resources to help you ace your exams.
                    </Text>
                </Box>

                {/* Earn Passive Income CTA */}
                <Box mb={10} textAlign="center">
                    <Button
                        onClick={() => router.push('/earn')}
                        bg="blue.600"
                        color="white"
                        size="lg"
                        _hover={{ bg: "blue.700", transform: "translateY(-2px)", boxShadow: "xl" }}
                        _active={{ bg: "blue.800" }}
                        boxShadow="md"
                        transition="all 0.2s"
                        px={10}
                        py={7}
                        fontSize="lg"
                        fontWeight="bold"
                        leftIcon={<Icon as={FiUploadCloud} boxSize={5} />}
                    >
                        Earn passive income by uploading high-scoring coursework
                    </Button>
                </Box>

                {/* PROGRAM SWITCHER */}
                <Flex justify="center" mb={10}>
                    <Flex bg="gray.200" p={1} borderRadius="full" gap={1}>
                        <Button
                            borderRadius="full"
                            px={8}
                            variant={selectedProgram === "DP" ? "solid" : "ghost"}
                            bg={selectedProgram === "DP" ? "white" : "transparent"}
                            color={selectedProgram === "DP" ? "black" : "gray.600"}
                            boxShadow={selectedProgram === "DP" ? "sm" : "none"}
                            _hover={{ bg: selectedProgram === "DP" ? "white" : "gray.300" }}
                            onClick={() => setSelectedProgram("DP")}
                        >
                            IB DP
                        </Button>
                        <Button
                            borderRadius="full"
                            px={8}
                            variant={selectedProgram === "MYP" ? "solid" : "ghost"}
                            bg={selectedProgram === "MYP" ? "white" : "transparent"}
                            color={selectedProgram === "MYP" ? "black" : "gray.600"}
                            boxShadow={selectedProgram === "MYP" ? "sm" : "none"}
                            _hover={{ bg: selectedProgram === "MYP" ? "white" : "gray.300" }}
                            onClick={() => setSelectedProgram("MYP")}
                        >
                            IB MYP
                        </Button>
                    </Flex>
                </Flex>

                {/* Filters */}
                <Box mb={12}>
                    <Flex direction="column" gap={6} align="center">

                        {/* Resource Type Filters (Dynamic) */}
                        <Flex gap={3} wrap="wrap" justify="center">
                            {(selectedProgram === "DP" ? RESOURCE_TYPES_DP : RESOURCE_TYPES_MYP).map(type => (
                                <Button
                                    key={type}
                                    size="sm"
                                    onClick={() => toggleResourceType(type)}
                                    variant={selectedResourceTypes.includes(type) ? "solid" : "outline"}
                                    colorScheme={selectedResourceTypes.includes(type) ? "blue" : "gray"}
                                    bg={selectedResourceTypes.includes(type) ? "blue.600" : "transparent"}
                                    color={selectedResourceTypes.includes(type) ? "white" : "gray.600"}
                                    borderColor="gray.300"
                                    _hover={{ bg: selectedResourceTypes.includes(type) ? "blue.500" : "gray.100" }}
                                    borderRadius="full"
                                    px={6}
                                >
                                    {type}
                                </Button>
                            ))}
                        </Flex>


                        {/* CONDITIONAL SUBJECT FILTER (Only for IA or EE) */}
                        {(selectedResourceTypes.includes("IA") || selectedResourceTypes.includes("EE")) && (
                            <Flex gap={3} wrap="wrap" justify="center">
                                <Text fontSize="sm" fontWeight="600" color="gray.500" alignSelf="center" mr={2}>Subject:</Text>
                                {availableSubjects.length > 0 ? (
                                    availableSubjects.map(subj => (
                                        <Button
                                            key={subj}
                                            size="xs"
                                            onClick={() => toggleSubject(subj)}
                                            variant={selectedSubjects.includes(subj) ? "solid" : "outline"}
                                            colorScheme={selectedSubjects.includes(subj) ? "teal" : "gray"}
                                            bg={selectedSubjects.includes(subj) ? "teal.600" : "transparent"}
                                            color={selectedSubjects.includes(subj) ? "white" : "gray.600"}
                                            borderColor="gray.300"
                                            _hover={{ bg: selectedSubjects.includes(subj) ? "teal.500" : "gray.100" }}
                                            borderRadius="md"
                                            px={4}
                                        >
                                            {subj}
                                        </Button>
                                    ))
                                ) : (
                                    <Text fontSize="xs" color="gray.400" alignSelf="center">No subjects found for current selection.</Text>
                                )}
                            </Flex>
                        )}

                        {/* CONDITIONAL TOK TYPE FILTER (Only if TOK is selected) */}
                        {selectedResourceTypes.includes("TOK") && (
                            <Flex gap={3} wrap="wrap" justify="center">
                                <Text fontSize="sm" fontWeight="600" color="gray.500" alignSelf="center" mr={2}>Type:</Text>
                                {["Exhibition", "Essay"].map(type => (
                                    <Button
                                        key={type}
                                        size="xs"
                                        onClick={() => toggleTokType(type)}
                                        variant={selectedTokTypes.includes(type) ? "solid" : "outline"}
                                        colorScheme={selectedTokTypes.includes(type) ? "green" : "gray"}
                                        bg={selectedTokTypes.includes(type) ? "green.600" : "transparent"}
                                        color={selectedTokTypes.includes(type) ? "white" : "gray.600"}
                                        borderColor="gray.300"
                                        _hover={{ bg: selectedTokTypes.includes(type) ? "green.500" : "gray.100" }}
                                        borderRadius="md"
                                        px={4}
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </Flex>
                        )}

                        {/* Session Filters */}
                        <Flex gap={3} wrap="wrap" justify="center">
                            {SESSIONS.map(session => (
                                <Button
                                    key={session}
                                    size="sm"
                                    onClick={() => toggleSession(session)}
                                    variant={selectedSessions.includes(session) ? "solid" : "outline"}
                                    colorScheme={selectedSessions.includes(session) ? "blackAlpha" : "gray"}
                                    bg={selectedSessions.includes(session) ? "gray.800" : "transparent"}
                                    color={selectedSessions.includes(session) ? "white" : "gray.600"}
                                    borderColor="gray.300"
                                    _hover={{ bg: selectedSessions.includes(session) ? "gray.700" : "gray.100" }}
                                    borderRadius="full"
                                    px={6}
                                >
                                    {session}
                                </Button>
                            ))}
                        </Flex>

                        {/* Score Filters (Conditional) */}
                        {((selectedResourceTypes.includes("IA") || selectedResourceTypes.includes("EE") || selectedResourceTypes.includes("TOK")) || (selectedProgram === 'MYP' && selectedResourceTypes.length > 0)) && (
                            <Flex gap={3} wrap="wrap" justify="center">
                                <Text fontSize="sm" fontWeight="600" color="gray.500" alignSelf="center" mr={2}>Score:</Text>

                                {/* Numeric Scores for IA or MYP */}
                                {(selectedResourceTypes.includes("IA") || selectedProgram === 'MYP') && ["7", "6", "5"].map(score => (
                                    <Button
                                        key={score}
                                        size="xs"
                                        onClick={() => toggleScore(score)}
                                        variant={selectedScores.includes(score) ? "solid" : "outline"}
                                        colorScheme={selectedScores.includes(score) ? "purple" : "gray"}
                                        bg={selectedScores.includes(score) ? "purple.600" : "transparent"}
                                        color={selectedScores.includes(score) ? "white" : "gray.600"}
                                        borderColor="gray.300"
                                        _hover={{ bg: selectedScores.includes(score) ? "purple.500" : "gray.100" }}
                                        borderRadius="md"
                                        px={4}
                                    >
                                        {score}
                                    </Button>
                                ))}

                                {/* Letter Grades for EE/TOK */}
                                {(selectedResourceTypes.includes("EE") || selectedResourceTypes.includes("TOK")) && ["A", "B", "C"].map(score => (
                                    <Button
                                        key={score}
                                        size="xs"
                                        onClick={() => toggleScore(score)}
                                        variant={selectedScores.includes(score) ? "solid" : "outline"}
                                        colorScheme={selectedScores.includes(score) ? "pink" : "gray"}
                                        bg={selectedScores.includes(score) ? "pink.600" : "transparent"}
                                        color={selectedScores.includes(score) ? "white" : "gray.600"}
                                        borderColor="gray.300"
                                        _hover={{ bg: selectedScores.includes(score) ? "pink.500" : "gray.100" }}
                                        borderRadius="md"
                                        px={4}
                                    >
                                        {score}
                                    </Button>
                                ))}
                            </Flex>
                        )}

                        {/* New Sort Filter */}
                        <Flex gap={2} align="center">
                            <Text fontSize="sm" fontWeight="600" color="gray.500">Sort By:</Text>
                            <Select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                size="sm"
                                w="200px"
                                borderRadius="full"
                                bg="white"
                            >
                                <option value="latest">Latest</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                            </Select>
                        </Flex>
                    </Flex>
                </Box>

                {
                    loading ? (
                        <Flex justify="center" align="center" minH="300px">
                            <Spinner size="xl" color="gray.400" speed="0.8s" thickness="4px" />
                        </Flex>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                            {contentItems
                                .filter(item => {
                                    // 1. Filter by Program
                                    const itemProgram = item.program || "DP";
                                    if (itemProgram !== selectedProgram) return false;

                                    // 2. Filter by Resource Type
                                    if (selectedResourceTypes.length > 0 && !selectedResourceTypes.includes(item.resourceType || '')) return false;

                                    // 3. Filter by Sessions
                                    if (selectedSessions.length > 0 && !selectedSessions.includes(item.session || '')) return false;

                                    // 4. Filter by Score
                                    if (selectedScores.length > 0 && !selectedScores.includes(item.score?.toString() || '')) return false;

                                    // 5. Filter by Subject (if active)
                                    if (selectedSubjects.length > 0 && !selectedSubjects.includes(item.subject || '')) return false;

                                    // 6. Filter by TOK Type (if active)
                                    if (selectedTokTypes.length > 0) {
                                        const match = selectedTokTypes.some(type =>
                                            item.title.toLowerCase().includes(type.toLowerCase()) ||
                                            item.subject?.toLowerCase() === type.toLowerCase()
                                        );
                                        if (!match) return false;
                                    }

                                    return true;
                                })
                                .sort((a, b) => {
                                    if (sortOption === "price_low") {
                                        return a.price - b.price;
                                    } else if (sortOption === "price_high") {
                                        return b.price - a.price;
                                    } else {
                                        // Default to Latest (createdAt desc) check timestamps
                                        // Assuming createdAt is Date object from hook
                                        const dateA = new Date(a.createdAt).getTime();
                                        const dateB = new Date(b.createdAt).getTime();
                                        return dateB - dateA;
                                    }
                                })
                                .map((item) => {
                                    const isPurchased = purchasedIds.has(item.id);
                                    const isFree = item.price === 0;

                                    return (
                                        <Flex
                                            key={item.id}
                                            direction="column"
                                            bg="white"
                                            borderRadius="xl"
                                            overflow="hidden"
                                            border="1px solid"
                                            borderColor="gray.100"
                                            boxShadow="sm"
                                            transition="all 0.2s ease-in-out"
                                            _hover={{
                                                transform: 'translateY(-4px)',
                                                boxShadow: 'md',
                                                borderColor: 'gray.300'
                                            }}
                                        >
                                            <Box position="relative" height="200px" bg="gray.100">
                                                {item.thumbnail ? (
                                                    <Image
                                                        src={item.thumbnail}
                                                        alt={item.title}
                                                        objectFit="cover"
                                                        width="100%"
                                                        height="100%"
                                                    />
                                                ) : item.type !== 'image' ? (
                                                    <Box w="100%" h="100%" overflow="hidden" position="relative" bg="white">
                                                        <iframe
                                                            src={`https://docs.google.com/gview?url=${encodeURIComponent(item.url)}&embedded=true`}
                                                            style={{
                                                                width: '120%',
                                                                height: '180%',
                                                                marginTop: '-70px',
                                                                marginLeft: '-10%',
                                                                border: 'none',
                                                                overflow: 'hidden',
                                                                transform: 'scale(1.1)',
                                                                transformOrigin: 'top center',
                                                                pointerEvents: 'none'
                                                            }}
                                                            title="Preview"
                                                            scrolling="no"
                                                        />
                                                        {/* Transparent Overlay to ensure absolutely no interaction */}
                                                        <Box
                                                            position="absolute"
                                                            top="0"
                                                            left="0"
                                                            w="100%"
                                                            h="100%"
                                                            bg="transparent"
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Image
                                                        src={item.url}
                                                        alt={item.title}
                                                        objectFit="cover"
                                                        width="100%"
                                                        height="100%"
                                                    />
                                                )}

                                                {isPurchased && (
                                                    <Badge
                                                        position="absolute"
                                                        top={3}
                                                        right={3}
                                                        colorScheme="green"
                                                        variant="subtle"
                                                        borderRadius="full"
                                                        px={2}
                                                    >
                                                        OWNED
                                                    </Badge>
                                                )}

                                                {/* FREE Badge */}
                                                {isFree && !isPurchased && (
                                                    <Badge
                                                        position="absolute"
                                                        top={3}
                                                        right={3}
                                                        bg="green.400"
                                                        color="white"
                                                        variant="solid"
                                                        borderRadius="full"
                                                        px={3}
                                                        boxShadow="md"
                                                        fontSize="xs"
                                                    >
                                                        FREE
                                                    </Badge>
                                                )}

                                                {/* Dynamic Resource Type Badge */}
                                                {item.resourceType && (
                                                    <Badge
                                                        position="absolute"
                                                        top={3}
                                                        left={3}
                                                        bg="blue.500"
                                                        color="white"
                                                        boxShadow="lg"
                                                        borderRadius="md"
                                                        px={2}
                                                        py={0.5}
                                                        fontSize="xs"
                                                        textTransform="none"
                                                        fontWeight="700"
                                                    >
                                                        {item.resourceType}
                                                    </Badge>
                                                )}

                                                {/* Metadata Tags */}
                                                <Flex position="absolute" bottom={3} left={3} gap={2}>
                                                    {item.score && (
                                                        <Badge bg="purple.500" color="white" borderRadius="md" px={2} py={0.5} boxShadow="lg" fontSize="xs">
                                                            Score: {item.score}
                                                        </Badge>
                                                    )}
                                                    {item.subject && item.program !== 'MYP' && (
                                                        <Badge bg="teal.500" color="white" borderRadius="md" px={2} py={0.5} boxShadow="lg" fontSize="xs">
                                                            {item.subject}
                                                        </Badge>
                                                    )}
                                                    {item.session && (
                                                        <Badge bg="gray.700" color="white" borderRadius="md" px={2} py={0.5} boxShadow="lg" fontSize="xs">
                                                            {item.session}
                                                        </Badge>
                                                    )}
                                                </Flex>
                                            </Box>

                                            <Flex direction="column" p={5} flex={1} justify="space-between">
                                                <Box>
                                                    <Text fontSize="lg" fontWeight="700" mb={2} color="gray.800" lineHeight="short">
                                                        {item.title}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.500" mb={6} noOfLines={2}>
                                                        {item.description}
                                                    </Text>
                                                </Box>

                                                {isPurchased || isFree ? (
                                                    <Button
                                                        leftIcon={<FaEye />}
                                                        size="md"
                                                        width="full"
                                                        variant="outline"
                                                        colorScheme="gray"
                                                        onClick={() => openViewer(item)}
                                                    >
                                                        {isFree ? "View (Free)" : "View"}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        leftIcon={<Icon as={FiShoppingCart} />}
                                                        bg="black"
                                                        color="white"
                                                        _hover={{ bg: "gray.800" }}
                                                        size="md"
                                                        width="full"
                                                        isLoading={isPaymentLoading && selectedItem?.id === item.id}
                                                        onClick={() => handleBuyClick(item)}
                                                    >
                                                        Buy ${item.price.toFixed(2)}
                                                    </Button>
                                                )}
                                            </Flex>
                                        </Flex>
                                    );
                                })}
                        </SimpleGrid>
                    )
                }
            </Flex >

            {/* Content Viewer Modal */}
            < DocumentViewerModal
                isOpen={isOpen}
                onClose={onClose}
                url={viewUrl}
                title={viewTitle}
                userEmail={user?.email || user?.uid || ""}
            />
        </Box >
    );
};
export default ContentLibraryPage;
