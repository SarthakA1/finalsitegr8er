import React from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
    Stack,
    Icon,
} from "@chakra-ui/react";
import PageContent from "@/components/layout/PageContent";
import { FaHandshake, FaUserShield, FaLightbulb } from "react-icons/fa";

const CodeOfHonor: React.FC = () => {
    return (
        <PageContent>
            <Box
                p={8}
                bg="rgba(255, 255, 255, 0.8)"
                backdropFilter="blur(12px)"
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.300"
                shadow="lg"
            >
                <Stack spacing={6}>
                    <Heading
                        as="h1"
                        size="xl"
                        textAlign="center"
                        bgGradient="linear(to-r, brand.500, brand.600)"
                        bgClip="text"
                        fontWeight="800"
                    >
                        Code of Honor
                    </Heading>

                    <Text fontSize="lg" color="gray.600" textAlign="center">
                        At GR8ER, we believe in fostering a community of integrity, respect, and collaboration.
                    </Text>

                    <Stack spacing={8} mt={4}>
                        <Section
                            icon={FaHandshake}
                            title="Respect & Collaboration"
                            content="Treat every member with kindness and respect. We are here to help each other grow, learn, and succeed together."
                        />
                        <Section
                            icon={FaUserShield}
                            title="Academic Integrity"
                            content="Uphold the highest standards of honesty. Share knowledge to empower others, but never to facilitate cheating or plagiarism."
                        />
                        <Section
                            icon={FaLightbulb}
                            title="Constructive Contribution"
                            content="Share resources and answers that add value. Ensure your contributions are accurate, helpful, and relevant to the community."
                        />
                    </Stack>

                    <Box
                        mt={8}
                        p={6}
                        bg="brand.50"
                        borderRadius="lg"
                        borderLeft="4px solid"
                        borderColor="brand.500"
                    >
                        <Text fontStyle="italic" color="gray.700">
                            "The strength of the team is each individual member. The strength of each member is the team."
                        </Text>
                    </Box>
                </Stack>
            </Box>
            <Box></Box> {/* Right side spacer for PageContent layout */}
        </PageContent>
    );
};

const Section = ({ icon, title, content }: { icon: any, title: string, content: string }) => (
    <Flex align="start" gap={4}>
        <Flex
            align="center"
            justify="center"
            minW="50px"
            h="50px"
            bgGradient="linear(to-br, brand.500, brand.600)"
            borderRadius="full"
            color="white"
            shadow="md"
        >
            <Icon as={icon} fontSize="24px" />
        </Flex>
        <Stack spacing={1}>
            <Heading size="md" color="gray.800">{title}</Heading>
            <Text color="gray.600">{content}</Text>
        </Stack>
    </Flex>
);

export default CodeOfHonor;