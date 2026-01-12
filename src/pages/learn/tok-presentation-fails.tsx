import React from 'react';
import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import { ArticleSchema, FAQSchema } from '@/components/Seo/Schema';

const TokPresentationFails = () => {
    const faqData = [
        {
            questionName: "Can I redo my TOK presentation if it goes badly?",
            acceptedAnswerText: "Officially, the IB does not allow retakes for the TOK exhibition (presentation) once it has been submitted to the IB or your teacher has finalized the grade. However, if there were significant technical issues or extenuating circumstances, you should speak to your IB Coordinator immediately."
        },
        {
            questionName: "Does a bad TOK presentation mean I will fail the Diploma?",
            acceptedAnswerText: "No. The TOK Exhibition is only worth 33% of your final TOK grade. The Essay is worth 67%. Even if you score poorly on the exhibition, a strong essay can still secure you a C or B in TOK, which is enough to pass the Diploma (provided you don't get an E in your Extended Essay)."
        },
        {
            questionName: "What is a passing grade for TOK?",
            acceptedAnswerText: "You need at least a D in TOK to be awarded the IB Diploma. If you receive an E in TOK, you will fail the entire Diploma regardless of your total points."
        }
    ];

    return (
        <Box bg="white" minH="100vh" py={12}>
            <NextSeo
                title="What to Do If Your TOK Presentation Fails | Survival Guide"
                description="Failed your TOK Exhibition or Presentation? Don't panic. Learn how to recover your TOK grade, understand the weighting, and ensure you still pass the IB Diploma."
                canonical="https://www.gr8er.live/learn/tok-presentation-fails"
                openGraph={{
                    url: 'https://www.gr8er.live/learn/tok-presentation-fails',
                    title: 'What to Do If Your TOK Presentation Fails | Survival Guide',
                    description: 'Failed your TOK Exhibition or Presentation? Don\'t panic. Learn how to recover your TOK grade.',
                    images: [
                        {
                            url: 'https://www.gr8er.live/images/tok-fail-guide.jpg',
                            width: 1200,
                            height: 630,
                            alt: 'TOK Presentation Recovery Guide',
                        },
                    ],
                }}
            />
            <ArticleSchema
                url="https://www.gr8er.live/learn/tok-presentation-fails"
                title="What to Do If Your TOK Presentation Fails | Survival Guide"
                description="Failed your TOK Exhibition or Presentation? Don't panic. Learn how to recover your TOK grade."
                images={['https://www.gr8er.live/images/tok-fail-guide.jpg']}
                datePublished="2025-11-20T10:00:00+08:00"
                authorName="GR8ER IB Team"
            />
            <FAQSchema mainEntity={faqData} />

            <Container maxW="container.md">
                <Breadcrumb fontSize="sm" color="gray.500" mb={8}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/learn">Learn</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href="#">TOK Presentation Fails</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <VStack spacing={8} align="start" as="article">
                    <Heading as="h1" size="2xl" lineHeight="1.2">
                        What to Do If Your TOK Presentation Fails
                    </Heading>
                    <Text fontSize="lg" color="gray.600">
                        Panic stations? Not yet. Here is exactly how the math works and how you can still save your Diploma.
                    </Text>

                    <Box as="section" w="full">
                        <Heading as="h2" size="lg" mb={4}>1. Understand the Weighting</Heading>
                        <Text mb={4}>
                            First, take a deep breath. The TOK Exhibition (formerly Presentation) is worth <strong>33%</strong> of your final TOK grade. The main chunk comes from the TOK Essay, which is worth <strong>67%</strong>.
                        </Text>
                        <Text fontWeight="bold">
                            This means you can fail the exhibition and still pass TOK.
                        </Text>
                    </Box>

                    <Box as="section" w="full">
                        <Heading as="h2" size="lg" mb={4}>2. The "Fail" Condition</Heading>
                        <Text mb={4}>
                            The only way to truly "fail" TOK (and thus the Diploma) is to get an <strong>E</strong> grade. An E is usually awarded for scores below 4-5 out of 30 total points (boundaries vary).
                        </Text>
                        <Text>
                            If you got even a low score (e.g., 3/10) on your exhibition, you just need a decent score on your essay to pull safely into the D or C range.
                        </Text>
                    </Box>

                    <Box as="section" w="full">
                        <Heading as="h2" size="lg" mb={4}>3. Common Questions (FAQ)</Heading>
                        <Accordion allowToggle>
                            {faqData.map((faq, index) => (
                                <AccordionItem key={index}>
                                    <h2>
                                        <AccordionButton>
                                            <Box flex="1" textAlign="left" fontWeight="bold">
                                                {faq.questionName}
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                        {faq.acceptedAnswerText}
                                    </AccordionPanel>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </Box>

                    <Box as="section" w="full">
                        <Heading as="h2" size="lg" mb={4}>4. Action Plan: ACING the Essay</Heading>
                        <Text mb={2}>
                            Since you can't redo the exhibition, pour 100% of your energy into the TOK Essay.
                        </Text>
                        <UnorderedList spacing={2} pl={4}>
                            <ListItem><strong>Choose the Title Carefully:</strong> Don't pick the "art" title if you don't do visual arts. Pick the title you can argue most effectively.</ListItem>
                            <ListItem><strong>Focus on the AOKs:</strong> Ensure you have deep, specific examples from two Areas of Knowledge.</ListItem>
                            <ListItem><strong>Get Feedback:</strong> Use your teacher interactions wisely. Ask specifically about your "Evaluation" and "Implications".</ListItem>
                        </UnorderedList>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default TokPresentationFails;
