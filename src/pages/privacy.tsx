import React from 'react';
import { Box, Flex, Text, Heading, VStack } from '@chakra-ui/react';
import Head from 'next/head';

const PrivacyPage: React.FC = () => {
    return (
        <Box minH="100vh" py={10} px={{ base: 4, md: 10 }} bg="gray.50">
            <Head>
                <title>Privacy Policy | Gr8er</title>
            </Head>

            <Flex direction="column" maxWidth="800px" mx="auto" bg="white" p={8} borderRadius="lg" boxShadow="sm">
                <Heading as="h1" size="xl" mb={6} textAlign="center">
                    Privacy Policy
                </Heading>

                <VStack align="start" spacing={6}>
                    <Box>
                        <Heading as="h2" size="md" mb={2}>1. Information Collection</Heading>
                        <Text>We collect information you provide directly to us, such as when you create an account, make a purchase, or communicate with us.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>2. Use of Information</Heading>
                        <Text>We use the information we collect to provide, maintain, and improve our services, process transactions, and send you related information.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>3. Information Sharing</Heading>
                        <Text>We do not share your personal information with third parties except as compelled by law or to provide necessary services (e.g., payment processing).</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>4. Security</Heading>
                        <Text>We implement reasonable security measures to protect your personal information.</Text>
                    </Box>
                </VStack>
            </Flex>
        </Box>
    );
};

export default PrivacyPage;
