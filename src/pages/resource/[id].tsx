import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/clientApp';
import {
    Box,
    Container,
    Heading,
    Text,
    Image,
    Button,
    Badge,
    Flex,
    VStack,
    HStack,
    Spinner,
    useToast,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Icon
} from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import { ProductSchema, CourseSchema } from '@/components/Seo/Schema';
import { ContentItem } from '@/hooks/useContentLibrary';
import { FiShoppingCart, FiCheck, FiFileText } from 'react-icons/fi';
// Reuse payment logic if possible, or duplicate simplified version for speed
// Given "useContentLibrary" is hook, we might need to duplicate "buy" logic or extract it.
// For now, I'll duplicate the Razorpay logic to keep this page self-contained and robust.

declare global {
    interface Window {
        Razorpay: any;
    }
}

const ResourcePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [item, setItem] = useState<ContentItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const toast = useToast();

    useEffect(() => {
        if (!id) return;

        const fetchItem = async () => {
            setLoading(true);
            try {
                const docRef = doc(firestore, 'content_library', id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Manual cast because createdAt might be Timestamp
                    const data = docSnap.data();
                    setItem({
                        id: docSnap.id,
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
                    } as ContentItem);
                } else {
                    setError('Resource not found');
                }
            } catch (err: any) {
                console.error("Error fetching doc:", err);
                setError('Failed to load resource');
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id]);

    // SEO Logic
    const seoTitle = item ? `How to structure ${item.subject} ${item.resourceType || 'Coursework'} - Grade ${item.score || '7'} | GR8ER` : 'Loading Resource | GR8ER';
    const seoDesc = item ? `Download this high-scoring ${item.subject} ${item.resourceType}. ${item.description.substring(0, 150)}...` : '';

    if (loading) return (
        <Flex justify="center" align="center" minH="100vh">
            <Spinner size="xl" />
        </Flex>
    );

    if (error || !item) return (
        <Container maxW="container.md" py={20} textAlign="center">
            <Heading size="lg" color="red.500">Resource Not Found</Heading>
            <Text mt={4}>The resource you are looking for does not exist or has been removed.</Text>
            <Button mt={6} onClick={() => router.push('/content-library')}>Back to Library</Button>
        </Container>
    );

    return (
        <Box bg="gray.50" minH="100vh" py={10}>
            <NextSeo
                title={seoTitle}
                description={seoDesc}
                openGraph={{
                    title: seoTitle,
                    description: seoDesc,
                    images: item.thumbnail ? [{ url: item.thumbnail, width: 800, height: 600, alt: item.title }] : [],
                }}
            />
            <ProductSchema
                name={item.title}
                description={item.description}
                image={item.thumbnail ? [item.thumbnail] : []}
                price={item.price}
                currency="USD"
            />
            {/* Also treat as a "Course" material for extra coverage */}
            <CourseSchema
                courseName={`${item.subject} ${item.resourceType}`}
                description={item.description}
                provider={{ name: "GR8ER IB", url: "https://www.gr8er.live" }}
            />

            <Container maxW="container.lg">
                <Breadcrumb fontSize="sm" color="gray.500" mb={8}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/content-library">Library</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href="#">{item.title}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    bg="white"
                    borderRadius="2xl"
                    boxShadow="xl"
                    overflow="hidden"
                >
                    {/* Visual Side */}
                    <Box w={{ base: '100%', md: '50%' }} bg="gray.100" position="relative" minH="400px">
                        {item.thumbnail ? (
                            <Image src={item.thumbnail} objectFit="cover" w="100%" h="100%" alt={item.title} />
                        ) : (
                            <Flex justify="center" align="center" w="100%" h="100%" bg="blue.50">
                                <Icon as={FiFileText} boxSize={20} color="blue.300" />
                            </Flex>
                        )}
                        {item.score && (
                            <Badge
                                position="absolute"
                                top={4}
                                right={4}
                                colorScheme="purple"
                                fontSize="xl"
                                px={4}
                                py={2}
                                borderRadius="lg"
                                boxShadow="md"
                            >
                                Grade {item.score}
                            </Badge>
                        )}
                    </Box>

                    {/* Details Side */}
                    <VStack w={{ base: '100%', md: '50%' }} p={{ base: 6, md: 10 }} align="start" spacing={6} justify="center">
                        <Box>
                            <HStack mb={2}>
                                {item.program && <Badge colorScheme="blue">{item.program}</Badge>}
                                {item.subject && <Badge colorScheme="teal">{item.subject}</Badge>}
                                {item.resourceType && <Badge colorScheme="gray">{item.resourceType}</Badge>}
                            </HStack>
                            <Heading as="h1" size="xl" lineHeight="short" mb={4}>
                                {item.title}
                            </Heading>
                            <Text fontSize="lg" color="gray.600">
                                {item.description}
                            </Text>
                        </Box>

                        <VStack align="start" spacing={2} w="full">
                            <HStack>
                                <Icon as={FiCheck} color="green.500" />
                                <Text fontSize="sm">Verified High-Scoring Example</Text>
                            </HStack>
                            <HStack>
                                <Icon as={FiCheck} color="green.500" />
                                <Text fontSize="sm">Instant Access PDF/View</Text>
                            </HStack>
                        </VStack>

                        <Box w="full" pt={4}>
                            <HStack justify="space-between" align="center" mb={4}>
                                <Text fontSize="3xl" fontWeight="bold">
                                    {item.price === 0 ? "FREE" : `$${item.price.toFixed(2)}`}
                                </Text>
                            </HStack>
                            <Button
                                size="lg"
                                w="full"
                                colorScheme={item.price === 0 ? "green" : "blue"}
                                leftIcon={item.price === 0 ? undefined : <Icon as={FiShoppingCart} />}
                                onClick={() => {
                                    // For now, redirect to library to handle the complex state/modal purchase flow
                                    // Ideally, we'd replicate the buy logic here, but redirecting is safer to ensure auth/modal context works.
                                    // We can pass query param to auto-open?
                                    toast({
                                        title: "Redirecting...",
                                        description: "Please complete your purchase in the library view.",
                                        status: "info",
                                        duration: 2000,
                                    });
                                    router.push(`/content-library?buy=${item.id}`);
                                }}
                            >
                                {item.price === 0 ? "Read Now" : "Buy Now"}
                            </Button>
                        </Box>

                    </VStack>
                </Flex>

            </Container>
        </Box>
    );
};

export default ResourcePage;
