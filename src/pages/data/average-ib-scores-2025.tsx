import React from 'react';
import { Box, Container, Heading, Text, VStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Stat, StatLabel, StatNumber, SimpleGrid, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import { ArticleSchema } from '@/components/Seo/Schema';

const AverageIbScores = () => {
    return (
        <Box bg="white" minH="100vh" py={12}>
            <NextSeo
                title="Average IB Scores by Subject 2024/25 | Global Statistics & Trends"
                description="View the latest average IB Diploma scores by subject group. Analysis of the May 2024 session and predictions for 2025. See which subjects have the highest 7 rates."
                canonical="https://www.gr8er.live/data/average-ib-scores-2025"
                openGraph={{
                    url: 'https://www.gr8er.live/data/average-ib-scores-2025',
                    title: 'Average IB Scores by Subject 2024/25',
                    description: 'Exclusive analysis of global IB performance data.',
                    images: [
                        {
                            url: 'https://www.gr8er.live/images/ib-stats-graph.jpg',
                            width: 1200,
                            height: 630,
                            alt: 'IB Score Statistics 2025',
                        },
                    ],
                }}
            />
            <ArticleSchema
                url="https://www.gr8er.live/data/average-ib-scores-2025"
                title="Average IB Scores by Subject 2024/25 | Global Statistics & Trends"
                description="View the latest average IB Diploma scores by subject group."
                images={['https://www.gr8er.live/images/ib-stats-graph.jpg']}
                datePublished="2025-07-10T12:00:00+08:00"
                authorName="GR8ER IB Data Team"
            />

            <Container maxW="container.lg">
                <Breadcrumb fontSize="sm" color="gray.500" mb={8}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/data">Data</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href="#">IB Statistics 2024/25</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <VStack spacing={10} align="start" as="article">
                    <Box>
                        <Badge colorScheme="purple" mb={2} fontSize="sm" px={2} py={1}>Data Analysis</Badge>
                        <Heading as="h1" size="2xl" lineHeight="1.2" mb={4}>
                            Average IB Scores by Subject: 2024/25 Session Analysis
                        </Heading>
                        <Text fontSize="xl" color="gray.600">
                            Which subjects are the hardest? Which have the highest percentage of 7s? We crunched the numbers from the latest statistical bulletin.
                        </Text>
                    </Box>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
                        <Stat p={6} border="1px solid" borderColor="gray.200" borderRadius="lg">
                            <StatLabel color="gray.500">Global Average</StatLabel>
                            <StatNumber fontSize="4xl">30.24</StatNumber>
                            <Text fontSize="sm" color="red.500">▼ 1.74 from previous year</Text>
                        </Stat>
                        <Stat p={6} border="1px solid" borderColor="gray.200" borderRadius="lg">
                            <StatLabel color="gray.500">Pass Rate</StatLabel>
                            <StatNumber fontSize="4xl">79.35%</StatNumber>
                            <Text fontSize="sm" color="gray.500">Stable</Text>
                        </Stat>
                        <Stat p={6} border="1px solid" borderColor="gray.200" borderRadius="lg">
                            <StatLabel color="gray.500">Mean Grade</StatLabel>
                            <StatNumber fontSize="4xl">4.84</StatNumber>
                            <Text fontSize="sm" color="gray.500">Per Subject</Text>
                        </Stat>
                    </SimpleGrid>

                    <Box w="full">
                        <Heading as="h2" size="lg" mb={6}>Group 1: Studies in Language and Literature</Heading>
                        <Table variant="simple" size="md">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th>Subject</Th>
                                    <Th isNumeric>Average Grade</Th>
                                    <Th isNumeric>% scoring 7</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td fontWeight="bold">English A Literature HL</Td>
                                    <Td isNumeric>4.95</Td>
                                    <Td isNumeric>4.2%</Td>
                                </Tr>
                                <Tr>
                                    <Td fontWeight="bold">English A Lang & Lit HL</Td>
                                    <Td isNumeric>5.08</Td>
                                    <Td isNumeric>6.8%</Td>
                                </Tr>
                                <Tr>
                                    <Td fontWeight="bold">Chinese A Literature HL</Td>
                                    <Td isNumeric>6.02</Td>
                                    <Td isNumeric color="green.500">22.1%</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>

                    <Box w="full">
                        <Heading as="h2" size="lg" mb={6}>Group 4: Sciences</Heading>
                        <Text mb={4} fontSize="sm" color="gray.500">The "hardest" group by mean grade.</Text>
                        <Table variant="simple" size="md">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th>Subject</Th>
                                    <Th isNumeric>Average Grade</Th>
                                    <Th isNumeric>% scoring 7</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td fontWeight="bold">Physics HL</Td>
                                    <Td isNumeric>4.65</Td>
                                    <Td isNumeric>12.4%</Td>
                                </Tr>
                                <Tr>
                                    <Td fontWeight="bold">Chemistry HL</Td>
                                    <Td isNumeric>4.52</Td>
                                    <Td isNumeric>9.8%</Td>
                                </Tr>
                                <Tr>
                                    <Td fontWeight="bold">Biology HL</Td>
                                    <Td isNumeric>4.35</Td>
                                    <Td isNumeric color="red.500">6.1%</Td>
                                </Tr>
                                <Tr>
                                    <Td fontWeight="bold">Computer Science HL</Td>
                                    <Td isNumeric>4.78</Td>
                                    <Td isNumeric>15.2%</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>

                </VStack>
            </Container>
        </Box>
    );
};

export default AverageIbScores;
