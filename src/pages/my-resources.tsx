import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Text,
    SimpleGrid,
    Image,
    Button,
    Badge,
    Spinner,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure
} from '@chakra-ui/react';
import { FaEye } from 'react-icons/fa';
import useContentLibrary, { ContentItem } from '@/hooks/useContentLibrary';
import Head from 'next/head';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/firebase/clientApp';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';

const MyResourcesPage: React.FC = () => {
    const { contentItems, loading: contentLoading } = useContentLibrary();
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const [loadingPurchases, setLoadingPurchases] = useState(true);

    const [user, userLoading] = useAuthState(auth);
    const router = useRouter();

    // Viewer State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [viewUrl, setViewUrl] = useState('');
    const [viewType, setViewType] = useState<'image' | 'pdf'>('pdf');
    const [viewTitle, setViewTitle] = useState('');

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/');
        }
    }, [user, userLoading, router]);

    // Fetch User Purchases
    useEffect(() => {
        const fetchPurchases = async () => {
            if (!user) {
                setPurchasedIds(new Set());
                setLoadingPurchases(false);
                return;
            }
            try {
                const querySnapshot = await getDocs(collection(firestore, `users/${user.uid}/purchases`));
                const ids = new Set<string>();
                querySnapshot.forEach((doc) => {
                    ids.add(doc.id);
                });
                setPurchasedIds(ids);
            } catch (error) {
                console.error("Error fetching purchases", error);
            } finally {
                setLoadingPurchases(false);
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

    const loading = contentLoading || loadingPurchases || userLoading;

    // Filter content items to only show purchased ones
    const myResources = contentItems.filter(item => purchasedIds.has(item.id));

    return (
        <Box minH="100vh" bgGradient="linear(to-br, gray.900, purple.900, blue.900)" py={10} px={{ base: 4, md: 10 }}>
            <Head>
                <title>My Resources | Gr8er IB</title>
            </Head>

            <Flex direction="column" maxWidth="1200px" mx="auto">
                <Box mb={12} textAlign="center">
                    <Text
                        fontSize={{ base: "3xl", md: "5xl" }}
                        fontWeight="900"
                        bgGradient="linear(to-r, green.400, teal.400)"
                        bgClip="text"
                        mb={3}
                        letterSpacing="tight"
                    >
                        My Learning Resources
                    </Text>
                    <Text fontSize="lg" color="gray.300">
                        Access all your unlocked study materials here.
                    </Text>
                </Box>

                {loading ? (
                    <Flex justify="center" align="center" minH="300px">
                        <Spinner size="xl" color="teal.500" />
                    </Flex>
                ) : myResources.length === 0 ? (
                    <Flex
                        direction="column"
                        justify="center"
                        align="center"
                        minH="300px"
                        bg="whiteAlpha.100"
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor="whiteAlpha.100"
                        p={10}
                        borderRadius="xl"
                    >
                        <Text fontSize="xl" color="gray.300" mb={4}>You haven't purchased any resources yet.</Text>
                        <Button colorScheme="purple" onClick={() => router.push('/content-library')}>
                            Browse Library
                        </Button>
                    </Flex>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                        {myResources.map((item) => (
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
                                    borderColor: "teal.400"
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
                                        colorScheme="green"
                                        variant="solid"
                                        fontSize="0.8em"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        boxShadow="lg"
                                        textTransform="uppercase"
                                        letterSpacing="wider"
                                    >
                                        OWNED
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

                                    <Button
                                        mt="auto"
                                        leftIcon={<FaEye />}
                                        colorScheme="teal"
                                        variant="outline"
                                        size="lg"
                                        width="full"
                                        onClick={() => openViewer(item)}
                                        _hover={{ bg: "teal.500", color: "white" }}
                                    >
                                        View Content
                                    </Button>
                                </Flex>
                            </Flex>
                        ))}
                    </SimpleGrid>
                )}
            </Flex>

            {/* Content Viewer Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.800" />
                <ModalContent bg="gray.900">
                    <ModalHeader color="white" borderBottom="1px solid" borderColor="whiteAlpha.200">{viewTitle}</ModalHeader>
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
export default MyResourcesPage;
