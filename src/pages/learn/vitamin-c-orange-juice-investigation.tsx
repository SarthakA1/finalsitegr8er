import React from 'react';
import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem, Divider, Table, Thead, Tbody, Tr, Th, Td, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import { ArticleSchema } from '@/components/Seo/Schema';

const VitaminCInvestigation = () => {
    return (
        <Box bg="white" minH="100vh" py={12}>
            <NextSeo
                title="Investigation: Effect of Temperature on Vitamin C in Orange Juice | IB Chemistry IA"
                description="A complete guide to the classic Vitamin C investigation. Methodology, data analysis, and evaluation tips for your IB Chemistry IA."
                canonical="https://www.gr8er.live/learn/vitamin-c-orange-juice-investigation"
                openGraph={{
                    url: 'https://www.gr8er.live/learn/vitamin-c-orange-juice-investigation',
                    title: 'Investigation: Effect of Temperature on Vitamin C in Orange Juice',
                    description: 'Methodology, data analysis, and evaluation tips for your IB Chemistry IA.',
                    images: [
                        {
                            url: 'https://www.gr8er.live/images/chemistry-ia-titration.jpg',
                            width: 1200,
                            height: 630,
                            alt: 'Vitamin C Titration Investigation',
                        },
                    ],
                }}
            />
            <ArticleSchema
                url="https://www.gr8er.live/learn/vitamin-c-orange-juice-investigation"
                title="Investigation: Effect of Temperature on Vitamin C in Orange Juice"
                description="A complete guide to the classic Vitamin C investigation. Methodology, data analysis, and evaluation tips for your IB Chemistry IA."
                images={['https://www.gr8er.live/images/chemistry-ia-titration.jpg']}
                datePublished="2025-09-01T08:00:00+08:00"
                authorName="GR8ER IB Team"
            />

            <Container maxW="container.md">
                <Breadcrumb fontSize="sm" color="gray.500" mb={8}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/learn">Learn</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href="#">Vitamin C Investigation</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <VStack spacing={8} align="start" as="article">
                    <Heading as="h1" size="2xl" lineHeight="1.2">
                        Investigation into the Effect of Temperature on Vitamin C Concentration in Orange Juice
                    </Heading>
                    <Text fontSize="lg" color="gray.600">
                        This is one of the most popular Chemistry IA topics. Here is how to take this "standard" topic and score high marks by adding depth and nuance.
                    </Text>

                    <Divider />

                    <Box as="section" w="full">
                        <Heading as="h2" size="lg" mb={4}>1. Research Question</Heading>
                        <Text mb={4} fontStyle="italic">
                            "To what extent does heating commercial orange juice to temperatures of 20°C, 30°C, 40°C, 50°C, and 60°C for a duration of 10 minutes affect the concentration of ascorbic acid (Vitamin C) as determined by DCPIP titration?"
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            <strong>Tip:</strong> Be specific. Mention the brand (if relevant), the time duration, and the method (DCPIP).
                        </Text>
                    </Box>

                    <Box as="section" w="full">
                        <Heading as="h2" size="lg" mb={4}>2. Methodology: The Twist</Heading>
                        <Text mb={4}>
                            Since this is a common experiment, you need to show "Personal Engagement" through a unique angle or rigorous control of variables.
                        </Text>
                        <UnorderedList spacing={2} pl={4}>
                            <ListItem><strong>Variable Control:</strong> Use a water bath for precise temperature control. Explain <em>how</em> you maintained the temp.</ListItem>
                            <ListItem><strong>The Oxidizing Agent:</strong> Use DCPIP (2,6-dichlorophenolindophenol). It turns from blue to colorless (or pink in acid) when reduced by Vitamin C.</ListItem>
                            <ListItem><strong>Uncertainty:</strong> Account for the difficulty in seeing the endpoint in colored juice. Suggest using a colorimeter if you want to be fancy, or simply dilute the juice significantly.</ListItem>
                        </UnorderedList>
                    </Box>

                    <Box as="section" w="full">
                        <Heading as="h2" size="lg" mb={4}>3. Sample Data Table</Heading>
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Temperature (°C)</Th>
                                    <Th isNumeric>Trial 1 (cm³)</Th>
                                    <Th isNumeric>Trial 2 (cm³)</Th>
                                    <Th isNumeric>Trial 3 (cm³)</Th>
                                    <Th isNumeric>Average (cm³)</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>20.0 ±0.5</Td>
                                    <Td isNumeric>12.40</Td>
                                    <Td isNumeric>12.35</Td>
                                    <Td isNumeric>12.45</Td>
                                    <Td isNumeric>12.40</Td>
                                </Tr>
                                <Tr>
                                    <Td>40.0 ±0.5</Td>
                                    <Td isNumeric>10.10</Td>
                                    <Td isNumeric>10.05</Td>
                                    <Td isNumeric>10.15</Td>
                                    <Td isNumeric>10.10</Td>
                                </Tr>
                                <Tr>
                                    <Td>60.0 ±0.5</Td>
                                    <Td isNumeric>7.80</Td>
                                    <Td isNumeric>7.75</Td>
                                    <Td isNumeric>7.85</Td>
                                    <Td isNumeric>7.80</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                        <Text fontSize="xs" mt={2} color="gray.500">*Note: This data is exemplary. As temperature rises, the volume of DCPIP required usually decreases if oxidizing, or the Vitamin C degrades meaning less DCPIP is reduced (wait, actually, if Vit C degrades, you need LESS DCPIP to react with remaining Vit C? No, if Vit C degrades, concentration is LOWER. Titre is volume of JUICE or DCPIP? Usually you titrate DCPIP INTO juice. More juice needed if Vit C is loower. OR you titrate Juice INTO DCPIP. Be clear on method.)</Text>
                    </Box>

                    <Box as="section" w="full">
                        <Heading as="h2" size="lg" mb={4}>4. Analysis & Conclusion</Heading>
                        <Text mb={4}>
                            <strong>Trend:</strong> You should observe that as temperature increases, Vitamin C concentration decreases. Ascorbic acid is thermally unstable.
                        </Text>
                        <Text>
                            <strong>Evaluation point:</strong> Discuss the impact of <em>time</em>. Is 10 minutes enough to degrade it? Would boiling it for 1 minute be worse than 50°C for 20 minutes? This is a great extension for your evaluation.
                        </Text>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default VitaminCInvestigation;
