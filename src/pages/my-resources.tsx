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
        <Box minH="100vh" bg="#f7fafc" py={10} px={{ base: 4, md: 10 }}>
            <Head>
                <title>My Resources | Gr8er IB</title>
            </Head>

            <Flex direction="column" maxWidth="1200px" mx="auto">
                <Box mb={8} textAlign="center">
                    <Text
                        fontSize={{ base: "3xl", md: "5xl" }}
                        fontWeight="800"
                        bgGradient="linear(to-r, green.400, teal.500)"
                        bgClip="text"
                        mb={2}
                    >
                        My Learning Resources
                    </Text>
                    <Text fontSize="lg" color="gray.600">
                        Access all your unlocked study materials here.
                    </Text>
                </Box>

                {loading ? (
                    <Flex justify="center" align="center" minH="300px">
                        <Spinner size="xl" color="teal.500" />
                    </Flex>
                ) : myResources.length === 0 ? (
                    <Flex direction="column" justify="center" align="center" minH="300px" bg="white" p={10} borderRadius="xl" boxShadow="md">
                        <Text fontSize="xl" color="gray.500" mb={4}>You haven't purchased any resources yet.</Text>
                        <Button colorScheme="purple" onClick={() => router.push('/content-library')}>
                            Browse Library
                        </Button>
                    </Flex>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                        {myResources.map((item) => (
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
                                        colorScheme="green"
                                        fontSize="0.9em"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        boxShadow="md"
                                    >
                                        OWNED
                                    </Badge>
                                    {/* Metadata Tags */}
                                    <Flex position="absolute" bottom={2} left={2} gap={2}>
                                        {item.score && (
                                            <Badge colorScheme="purple" borderRadius="md" px={2}>Score: {item.score}</Badge>
                                        )}
                                        {item.session && (
                                            <Badge colorScheme="blue" borderRadius="md" px={2}>{item.session}</Badge>
                                        )}
                                    </Flex>
                                </Box>

                                <Flex direction="column" p={6} flex={1}>
                                    <Text fontSize="xl" fontWeight="700" mb={2} color="gray.800" noOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500" mb={4} flex={1} noOfLines={3}>
                                        {item.description}
                                    </Text>

                                    <Button
                                        mt="auto"
                                        leftIcon={<FaEye />}
                                        colorScheme="green"
                                        size="md"
                                        width="full"
                                        onClick={() => openViewer(item)}
                                        boxShadow="md"
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
export default MyResourcesPage;
