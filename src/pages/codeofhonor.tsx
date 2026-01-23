import React from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
    Stack,
    Icon,
    Container,
    SimpleGrid,
    useColorModeValue,
} from "@chakra-ui/react";
import { FaHandshake, FaUserShield, FaLightbulb } from "react-icons/fa";

const CodeOfHonor: React.FC = () => {
    const bg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(26, 32, 44, 0.8)");
    const borderColor = useColorModeValue("whiteAlpha.300", "whiteAlpha.100");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const headingColor = useColorModeValue("gray.800", "white");

    const bgGradient = useColorModeValue(
        "linear(to-br, gray.50, brand.50, gray.100)",
        "linear(to-br, gray.900, brand.900, gray.800)"
    );

    return (
        <Box
            minH="100vh"
            py={20}
            px={4}
            bgGradient={bgGradient as any}
        >
            <Container maxW="4xl">
                <Box
                    p={{ base: 8, md: 12 }}
                    bg={bg}
                    backdropFilter="blur(16px)"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    shadow="2xl"
                >
                    <Stack spacing={10}>
                        <Stack spacing={4} textAlign="center">
                            <Heading
                                as="h1"
                                size="2xl"
                                bgGradient="linear(to-r, brand.500, brand.600)"
                                bgClip="text"
                                fontWeight="800"
                                letterSpacing="tight"
                            >
                                Code of Honor
                            </Heading>
                            <Text fontSize="xl" color={textColor} maxW="2xl" mx="auto">
                                At GR8ER, we believe in fostering a community of integrity, respect, and collaboration.
                            </Text>
                        </Stack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                            <SectionCard
                                icon={FaHandshake}
                                title="Respect & Collaboration"
                                content="Treat every member with kindness and respect. We are here to help each other grow, learn, and succeed together."
                            />
                            <SectionCard
                                icon={FaUserShield}
                                title="Academic Integrity"
                                content="Uphold the highest standards of honesty. Share knowledge to empower others, but never to facilitate cheating or plagiarism."
                            />
                            <SectionCard
                                icon={FaLightbulb}
                                title="Constructive Contribution"
                                content="Share resources and answers that add value. Ensure your contributions are accurate, helpful, and relevant to the community."
                            />
                        </SimpleGrid>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
};

const SectionCard = ({ icon, title, content }: { icon: any, title: string, content: string }) => {
    const cardBg = useColorModeValue("white", "gray.700");
    const shadow = useColorModeValue("md", "dark-lg");
    const hoverShadow = useColorModeValue("xl", "0 0 20px rgba(0,0,0,0.4)");

    return (
        <Flex
            direction="column"
            align="center"
            bg={cardBg}
            p={6}
            borderRadius="xl"
            shadow={shadow}
            transition="all 0.3s"
            _hover={{ transform: "translateY(-5px)", shadow: hoverShadow }}
            textAlign="center"
            position="relative"
        >
            <Flex
                align="center"
                justify="center"
                w="60px"
                h="60px"
                bgGradient="linear(to-br, brand.500, brand.600)"
                borderRadius="2xl"
                color="white"
                shadow="lg"
                mb={5}
            >
                <Icon as={icon} fontSize="28px" />
            </Flex>
            <Heading size="md" mb={3} fontWeight="700">
                {title}
            </Heading>
            <Text color={useColorModeValue("gray.600", "gray.300")} fontSize="sm">
                {content}
            </Text>
        </Flex>
    );
};

export default CodeOfHonor;