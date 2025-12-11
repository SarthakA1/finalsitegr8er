import React from 'react';
import { Box, Flex, Text, Heading, VStack } from '@chakra-ui/react';
import Head from 'next/head';

const CancellationRefundsPage: React.FC = () => {
    return (
        <Box minH="100vh" py={10} px={{ base: 4, md: 10 }} bg="gray.50">
            <Head>
                <title>Cancellation & Refunds | Gr8er</title>
            </Head>

            <Flex direction="column" maxWidth="800px" mx="auto" bg="white" p={8} borderRadius="lg" boxShadow="sm">
                <Heading as="h1" size="xl" mb={6} textAlign="center">
                    Cancellation & Refund Policy
                </Heading>

                <VStack align="start" spacing={6}>
                    <Box>
                        <Heading as="h2" size="md" mb={2}>1. Cancellation Policy</Heading>
                        <Text>You may cancel your subscription or order at any time. Cancellations will verify the immediate cessation of future billing cycles.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>2. Refund Eligibility</Heading>
                        <Text>We offer refunds on digital products only if the file is corrupted or distinctly different from the description provided. Refund requests must be made within 7 days of purchase.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>3. Processing Time</Heading>
                        <Text>Approved refunds will be processed within 5-7 business days and credited back to the original method of payment.</Text>
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={2}>4. Contact Us</Heading>
                        <Text>If you have any questions regarding our cancellation or refund policy, please contact our support team.</Text>
                    </Box>
                </VStack>
            </Flex>
        </Box>
    );
};

export default CancellationRefundsPage;
