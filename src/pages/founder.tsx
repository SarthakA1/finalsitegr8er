import React from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    Stack,
    Image,
    Link,
    SimpleGrid,
    Icon,
} from "@chakra-ui/react";
import PageContent from "@/components/layout/PageContent";
import { FaLinkedin, FaExternalLinkAlt } from "react-icons/fa";

const FounderPage: React.FC = () => {
    return (
        <PageContent>
            <Stack spacing={6}>
                {/* Founder Bio Section */}
                <Box
                    p={8}
                    bg="rgba(255, 255, 255, 0.8)"
                    backdropFilter="blur(12px)"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    shadow="lg"
                >
                    <Flex direction={{ base: "column", md: "row" }} align="center" gap={8}>
                        <Box position="relative">
                            <Image
                                src="https://media.licdn.com/dms/image/v2/D5603AQG0BWdI8Fjf9A/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1720973014753?e=1737590400&v=beta&t=RFK2_v7ydw_cYSSP99lxU9Bv66IHoYT82_Slg3mjXJg"
                                alt="Sarthak Ahuja"
                                boxSize="180px"
                                borderRadius="full"
                                objectFit="cover"
                                shadow="xl"
                                border="4px solid"
                                borderColor="brand.500"
                            />
                            <Box
                                position="absolute"
                                bottom="10px"
                                right="10px"
                                bg="green.400"
                                boxSize="20px"
                                borderRadius="full"
                                border="3px solid white"
                            />
                        </Box>
                        <Stack spacing={4} flex={1} textAlign={{ base: "center", md: "left" }}>
                            <Box>
                                <Text fontSize="sm" fontWeight="700" color="brand.500" textTransform="uppercase" letterSpacing="wide">
                                    The Founder
                                </Text>
                                <Heading size="2xl" bgGradient="linear(to-r, brand.500, brand.600)" bgClip="text">
                                    Sarthak Ahuja
                                </Heading>
                            </Box>
                            <Text fontSize="lg" color="gray.600" lineHeight="1.8">
                                Hi! I'm Sarthak, the creator of GR8ER. My mission is to build a community where students can empower each other through shared knowledge and collaboration.
                            </Text>
                            <Text fontSize="md" color="gray.500">
                                Connect with me: <Link href="mailto:sarthak.ahuja231@gmail.com" color="brand.500" fontWeight="600">sarthak.ahuja231@gmail.com</Link>
                            </Text>
                        </Stack>
                    </Flex>
                </Box>

                {/* Media Coverage Section */}
                <Box
                    p={8}
                    bg="rgba(255, 255, 255, 0.8)"
                    backdropFilter="blur(12px)"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    shadow="lg"
                >
                    <Heading size="lg" mb={6} color="gray.800">Media Coverage</Heading>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <MediaCard
                            title="International Baccalaureate"
                            description="Recognition for community impact."
                            link="https://www.linkedin.com/feed/update/urn:li:activity:7250361986587222016/"
                        />
                        <MediaCard
                            title="The Times of India"
                            description="Featured in student newsmakers."
                            link="https://toistudent.timesofindia.indiatimes.com/news/newsmakers/helping-peers-with-gr8er/84967.html"
                        />
                        <MediaCard
                            title="Pathways Group"
                            description="Highlighted as a school prodigy."
                            link="https://www.pathwaysgurgaon.edu.in/prodigies/sarthakahuja"
                        />
                    </SimpleGrid>
                </Box>
            </Stack>
            <Box></Box> {/* Right side spacer */}
        </PageContent>
    );
};

const MediaCard = ({ title, description, link }: { title: string, description: string, link: string }) => (
    <Link href={link} isExternal _hover={{ textDecoration: 'none' }}>
        <Flex
            direction="column"
            p={5}
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.100"
            shadow="sm"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-4px)', shadow: 'md', borderColor: 'brand.500' }}
            height="100%"
        >
            <Flex justify="space-between" align="start" mb={2}>
                <Heading size="md" color="gray.800">{title}</Heading>
                <Icon as={FaExternalLinkAlt} color="gray.400" fontSize="sm" />
            </Flex>
            <Text fontSize="sm" color="gray.500">{description}</Text>
        </Flex>
    </Link>
);

export default FounderPage;
