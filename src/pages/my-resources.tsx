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
import DocumentViewerModal from '@/components/Modal/DocumentViewerModal';

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
        <Box minH="100vh" bg="gray.50" py={10} px={{ base: 4, md: 10 }}>
            <Head>
                <title>My Resources | Gr8er IB</title>
            </Head>

            <Flex direction="column" maxWidth="1200px" mx="auto">
                <Box mb={10} textAlign="center">
                    <Text
                        fontSize={{ base: "3xl", md: "4xl" }}
                        fontWeight="800"
                        color="gray.800"
                        mb={3}
                        letterSpacing="tight"
                    >
                        My Learning Resources
                    </Text>
                    <Text fontSize="lg" color="gray.500">
                        Access all your unlocked study materials here.
                    </Text>
                </Box>

                {loading ? (
                    <Flex justify="center" align="center" minH="300px">
                        <Spinner size="xl" color="gray.400" />
                    </Flex>
                ) : myResources.length === 0 ? (
                    <Flex
                        direction="column"
                        justify="center"
                        align="center"
                        minH="300px"
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        p={10}
                        borderRadius="xl"
                        boxShadow="sm"
                    >
                        <Text fontSize="xl" color="gray.500" mb={4}>You haven't purchased any resources yet.</Text>
                        <Button colorScheme="blackAlpha" bg="black" color="white" _hover={{ bg: "gray.800" }} onClick={() => router.push('/content-library')}>
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
                                                    width: '200%',
                                                    height: '200%',
                                                    marginTop: '-60px', // Hide toolbar
                                                    marginLeft: '-50%', // Center horizontally
                                                    border: 'none',
                                                    overflow: 'hidden',
                                                    transform: 'scale(0.8)', // Zoom out
                                                    transformOrigin: 'top center',
                                                    pointerEvents: 'none'
                                                }}
                                                title="Preview"
                                                scrolling="no"
                                            />
                                            {/* Transparent Overlay */}
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
                                    {/* Metadata Tags */}
                                    <Flex position="absolute" bottom={3} left={3} gap={2}>
                                        {item.score && (
                                            <Badge bg="white" color="purple.600" borderRadius="md" px={2} py={0.5} boxShadow="sm" fontSize="xs">
                                                Score: {item.score}
                                            </Badge>
                                        )}
                                        {item.session && (
                                            <Badge bg="white" color="gray.600" borderRadius="md" px={2} py={0.5} boxShadow="sm" fontSize="xs">
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

                                    <Button
                                        mt="auto"
                                        leftIcon={<FaEye />}
                                        size="md"
                                        width="full"
                                        variant="outline"
                                        colorScheme="gray"
                                        onClick={() => openViewer(item)}
                                    >
                                        View Content
                                    </Button>
                                </Flex>
                            </Flex>
                        ))}
                    </SimpleGrid>
                )}
            </Flex>

            {/* Image Viewer Modal */}
            <Modal isOpen={isOpen && viewType === 'image'} onClose={onClose} size="full">
                <ModalOverlay bg="rgba(0,0,0,0.9)" />
                <ModalContent bg="transparent" boxShadow="none">
                    <ModalCloseButton color="white" position="fixed" top={4} right={4} zIndex={1000} />
                    <ModalBody p={0} display="flex" justifyContent="center" alignItems="center" height="100vh" onClick={onClose}>
                        <Image src={viewUrl} maxH="100%" maxWidth="100%" objectFit="contain" onClick={(e) => e.stopPropagation()} />
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Secure Document Viewer Modal */}
            <DocumentViewerModal
                isOpen={isOpen && viewType !== 'image'}
                onClose={onClose}
                url={viewUrl}
                title={viewTitle}
            />
        </Box>
    );
};
export default MyResourcesPage;
