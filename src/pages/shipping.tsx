import React from 'react';
import { Box, Flex, Text, Heading, VStack } from '@chakra-ui/react';
import Head from 'next/head';

const ShippingPage: React.FC = () => {
    return (
        <Box minH="100vh" py={10} px={{ base: 4, md: 10 }} bg="gray.50">
            <Head>
                <title>Shipping & Delivery | Gr8er</title>
            </Head>

            <Flex direction="column" maxWidth="800px" mx="auto" bg="white" p={8} borderRadius="lg" boxShadow="sm">
                <Heading as="h1" size="xl" mb={6} textAlign="center">
                    Shipping & Delivery Policy
                </Heading>

                <VStack align="start" spacing={6}>
                    <Box>
                        <Heading as="h2" size="md" mb={2}>1. Digital Delivery</Heading>
                        <Text>All products sold on Gr8er are digital content. No physical shipping is required.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>2. Delivery Time</Heading>
                        <Text>Upon successful payment, access to your digital content is immediate. You will receive a download link on the confirmation page and via email.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>3. Access Issues</Heading>
                        <Text>If you do not receive your download link or cannot access the content after purchase, please check your spam folder or contact support immediately.</Text>
                    </Box>
                </VStack>
            </Flex>
        </Box>
    );
};

export default ShippingPage;
