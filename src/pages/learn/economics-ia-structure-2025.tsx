import React from 'react';
import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem, Divider, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import { ArticleSchema } from '@/components/Seo/Schema';

const EconomicsIAStructure = () => {
    return (
        <Box bg="white" minH="100vh" py={12}>
            <NextSeo
                title="How to Structure an Economics IA in 2025 | Step-by-Step Guide"
                description="Master the IB Economics IA structure for 2025. Learn exactly what to include in your introduction, analysis, evaluation, and conclusion to score a 7."
                canonical="https://www.gr8er.live/learn/economics-ia-structure-2025"
                openGraph={{
                    url: 'https://www.gr8er.live/learn/economics-ia-structure-2025',
                    title: 'How to Structure an Economics IA in 2025 | Step-by-Step Guide',
                    description: 'Master the IB Economics IA structure for 2025. Learn exactly what to include in your introduction, analysis, evaluation, and conclusion to score a 7.',
                    images: [
                        {
                            url: 'https://www.gr8er.live/images/economics-ia-guide.jpg',
                            width: 1200,
                            height: 630,
                            alt: 'IB Economics IA Structure Guide',
                        },
                    ],
                }}
            />
            <ArticleSchema
                url="https://www.gr8er.live/learn/economics-ia-structure-2025"
                title="How to Structure an Economics IA in 2025 | Step-by-Step Guide"
                description="Master the IB Economics IA structure for 2025. Learn exactly what to include in your introduction, analysis, evaluation, and conclusion to score a 7."
                images={['https://www.gr8er.live/images/economics-ia-guide.jpg']}
                datePublished="2025-10-15T08:00:00+08:00"
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
                        <BreadcrumbLink href="#">Economics IA Structure</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <VStack spacing={8} align="start" as="article">
                    <Heading as="h1" size="2xl" lineHeight="1.2">
                        How to Structure an Economics IA in 2025
                    </Heading>
                    <Text fontSize="lg" color="gray.600">
                        The definitive guide to formatting your Internal Assessment for the new IB Economics syllabus.
                    </Text>

                    <Divider />

                    <Box as="section">
                        <Heading as="h2" size="lg" mb={4}>1. The Introduction (100-150 words)</Heading>
                        <Text mb={4}>
                            Start strong. Your introduction sets the stage for your entire commentary. In 2025, examiners look for concise definitions and clear context.
                        </Text>
                        <UnorderedList spacing={2} pl={4}>
                            <ListItem><strong>Define Key Terms:</strong> Define 2-3 key economic concepts relevant to your article (e.g., negative externality of consumption, demerit good).</ListItem>
                            <ListItem><strong>Summarize the Article:</strong> Briefly explain the news story. What happened? Who is involved? (e.g., "The UK government has imposed a sugar tax...")</ListItem>
                            <ListItem><strong>State the Key Concept:</strong> Explicitly link the article to one of the 9 key concepts (Scarcity, Choice, Efficiency, Equity, Economic Well-being, Sustainability, Change, Interdependence, Intervention).</ListItem>
                        </UnorderedList>
                    </Box>

                    <Box as="section">
                        <Heading as="h2" size="lg" mb={4}>2. The Diagram (Visual Analysis)</Heading>
                        <Text mb={4}>
                            A high-scoring IA must have a perfectly labeled diagram. It is the anchor of your analysis.
                        </Text>
                        <UnorderedList spacing={2} pl={4}>
                            <ListItem><strong>Title:</strong> Full, descriptive title (e.g., "Figure 1: Market Failure in the Sugar Market").</ListItem>
                            <ListItem><strong>Axes:</strong> Label Price (P) and Quantity (Q) with specific units if possible.</ListItem>
                            <ListItem><strong>Curves:</strong> Label all curves (D, S, MPB, MSB, MPC, MSC).</ListItem>
                            <ListItem><strong>Equilibriums:</strong> Clearly mark the free market equilibrium (Pm, Qm) and the socially optimal equilibrium (Popt, Qopt).</ListItem>
                            <ListItem><strong>Shading:</strong> Shade the Welfare Loss or Gain precisely.</ListItem>
                        </UnorderedList>
                    </Box>

                    <Box as="section">
                        <Heading as="h2" size="lg" mb={4}>3. Analysis & Application (300-350 words)</Heading>
                        <Text mb={4}>
                            This is the core of your essay. Explain <em>why</em> the diagram looks the way it does using economic theory.
                        </Text>
                        <Text>
                            Explain the shift. Why did the supply curve shift left? Use quotes from the article to support your explanation (e.g., "As the article states, the tax 'increases production costs'...").
                            Analyze the impact on stakeholders: Consumers (price changes), Producers (revenue changes), and Society (welfare impact).
                        </Text>
                    </Box>

                    <Box as="section">
                        <Heading as="h2" size="lg" mb={4}>4. Evaluation (250-300 words)</Heading>
                        <Text mb={4}>
                            Evaluation is where the 7s are won. Don't just summarize; critique the theory or policy using <strong>CLASPP</strong>.
                        </Text>
                        <UnorderedList spacing={2} pl={4}>
                            <ListItem><strong>Conclusion (Long-term vs Short-term):</strong> Will the policy work immediately or take time?</ListItem>
                            <ListItem><strong>Limitations:</strong> What assumptions might fail? (e.g., Is demand inelastic? If so, the tax won't reduce consumption much).</ListItem>
                            <ListItem><strong>Alternatives:</strong> Would a different policy (e.g., education campaign) be better?</ListItem>
                            <ListItem><strong>Stakeholders:</strong> Who wins and who loses? Is it equitable?</ListItem>
                            <ListItem><strong>Priorities:</strong> Which economic goal is most important here?</ListItem>
                            <ListItem><strong>Pros/Cons:</strong> Weigh the benefits against the costs.</ListItem>
                        </UnorderedList>
                    </Box>

                    <Box as="section">
                        <Heading as="h2" size="lg" mb={4}>5. Conclusion (50-75 words)</Heading>
                        <Text>
                            Summarize your main finding. Is the policy effective? State your final judgment clearly, linking back to your key concept.
                        </Text>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default EconomicsIAStructure;
