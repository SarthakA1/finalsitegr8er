import React, { useState } from 'react';
import { Box, Container, Heading, Text, VStack, Input, Select, Button, FormControl, FormLabel, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Divider, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';

const IbScoreCalculator = () => {
    const [subjects, setSubjects] = useState(Array(6).fill(0));
    const [eeGrade, setEeGrade] = useState('A');
    const [tokGrade, setTokGrade] = useState('A');

    const handleSubjectChange = (index: number, value: string) => {
        const newSubjects = [...subjects];
        let score = parseInt(value);
        if (isNaN(score) || score < 1) score = 1;
        if (score > 7) score = 7;
        newSubjects[index] = score;
        setSubjects(newSubjects);
    };

    const getCorePoints = (ee: string, tok: string) => {
        const matrix: { [key: string]: number } = {
            "AA": 3, "AB": 3, "AC": 2, "AD": 2, "AE": 0,
            "BA": 3, "BB": 2, "BC": 2, "BD": 1, "BE": 0,
            "CA": 2, "CB": 2, "CC": 1, "CD": 0, "CE": 0,
            "DA": 2, "DB": 1, "DC": 0, "DD": 0, "DE": 0,
            "EA": 0, "EB": 0, "EC": 0, "ED": 0, "EE": 0
        };
        const key = ee + tok;
        return matrix[key] || 0;
    };

    const corePoints = getCorePoints(eeGrade, tokGrade);
    const subjectTotal = subjects.reduce((a, b) => a + b, 0);
    const totalScore = subjectTotal + corePoints;

    return (
        <Box bg="gray.50" minH="100vh" py={12}>
            <NextSeo
                title="IB Score Calculator 2025 | Calculate Your Total Points"
                description="Use our free IB Score Calculator to predict your final Diploma results. Includes TOK/EE matrix logic for accurate core point calculation."
                canonical="https://www.gr8er.live/tools/ib-score-calculator"
                openGraph={{
                    url: 'https://www.gr8er.live/tools/ib-score-calculator',
                    title: 'IB Score Calculator 2025',
                    description: 'Predict your final IB Diploma result instantly.',
                }}
            />

            <Container maxW="container.md">
                <Breadcrumb fontSize="sm" color="gray.500" mb={8}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/tools">Tools</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href="#">Calculator</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <VStack spacing={8} align="stretch" bg="white" p={8} borderRadius="xl" boxShadow="lg">
                    <Box textAlign="center">
                        <Heading as="h1" size="xl" mb={2} color="blue.600">IB Score Calculator</Heading>
                        <Text color="gray.500">Enter your predicted grades to see your total.</Text>
                    </Box>

                    <Divider />

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        {subjects.map((score, index) => (
                            <FormControl key={index}>
                                <FormLabel>Subject {index + 1} Grade (1-7)</FormLabel>
                                <Input
                                    type="number"
                                    min={1}
                                    max={7}
                                    defaultValue={7} // Default to 7 for optimistic checking
                                    onChange={(e) => handleSubjectChange(index, e.target.value)}
                                />
                            </FormControl>
                        ))}
                    </SimpleGrid>

                    <Divider />

                    <Heading size="md" color="gray.700">Core Points (TOK & EE)</Heading>
                    <SimpleGrid columns={2} spacing={6}>
                        <FormControl>
                            <FormLabel>Extended Essay (EE)</FormLabel>
                            <Select value={eeGrade} onChange={(e) => setEeGrade(e.target.value)}>
                                {['A', 'B', 'C', 'D', 'E'].map(g => <option key={g} value={g}>{g}</option>)}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Theory of Knowledge (TOK)</FormLabel>
                            <Select value={tokGrade} onChange={(e) => setTokGrade(e.target.value)}>
                                {['A', 'B', 'C', 'D', 'E'].map(g => <option key={g} value={g}>{g}</option>)}
                            </Select>
                        </FormControl>
                    </SimpleGrid>

                    <Box
                        bg={totalScore >= 24 ? "green.50" : "red.50"}
                        p={6}
                        borderRadius="lg"
                        textAlign="center"
                        border="2px solid"
                        borderColor={totalScore >= 24 ? "green.200" : "red.200"}
                    >
                        <Stat>
                            <StatLabel fontSize="lg" color="gray.600">Total Score</StatLabel>
                            <StatNumber fontSize="5xl" color={totalScore >= 24 ? "green.600" : "red.600"}>
                                {totalScore} / 45
                            </StatNumber>
                            <StatHelpText fontSize="md">
                                {totalScore >= 24 ? "🎉 Diploma Awarded!" : "⚠️ Diploma Not Awarded (Needs 24+)"}
                            </StatHelpText>
                        </Stat>
                        {corePoints === 0 && (eeGrade === 'E' || tokGrade === 'E') && (
                            <Text color="red.500" fontWeight="bold" mt={2}>
                                Note: An 'E' in either EE or TOK results in 0 core points and acts as a failing condition.
                            </Text>
                        )}
                    </Box>

                </VStack>

                <Box mt={10}>
                    <Heading size="md" mb={4}>How is this calculated?</Heading>
                    <Text color="gray.600">
                        The International Baccalaureate (IB) Diploma score is calculated by adding the scores of your 6 subjects (each out of 7, total 42) to the points awarded for the Core (TOK & Extended Essay, max 3). The maximum possible score is 45.
                    </Text>
                </Box>

            </Container>
        </Box>
    );
};

export default IbScoreCalculator;
