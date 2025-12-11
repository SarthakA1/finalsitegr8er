import React from 'react';
import { Box, Flex, Text, Heading, VStack } from '@chakra-ui/react';
import Head from 'next/head';

const TermsPage: React.FC = () => {
    return (
        <Box minH="100vh" py={10} px={{ base: 4, md: 10 }} bg="gray.50">
            <Head>
                <title>Terms and Conditions | Gr8er</title>
            </Head>

            <Flex direction="column" maxWidth="800px" mx="auto" bg="white" p={8} borderRadius="lg" boxShadow="sm">
                <Heading as="h1" size="xl" mb={6} textAlign="center">
                    Terms and Conditions
                </Heading>

                <VStack align="start" spacing={6}>
                    <Box>
                        <Heading as="h2" size="md" mb={2}>1. Introduction</Heading>
                        <Text>Welcome to Gr8er. These Terms and Conditions govern your use of our website and services.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>2. Intellectual Property</Heading>
                        <Text>All content, materials, and intellectual property on this site are owned by Gr8er. You may not reproduce, distribute, or create derivative works without our express written permission.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>3. User Accounts</Heading>
                        <Text>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>4. Limitation of Liability</Heading>
                        <Text>Gr8er shall not be liable for any indirect, incidental, or consequential damages arising out of your use of our services.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>5. Changes to Terms</Heading>
                        <Text>We reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of the new terms.</Text>
                    </Box>
                </VStack>
            </Flex>
        </Box>
    );
};

export default TermsPage;
