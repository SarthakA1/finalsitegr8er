import React from 'react';
import { Flex, Text, Button, Icon, Box, Image } from '@chakra-ui/react';
import { FaGem } from 'react-icons/fa';
import { useRouter } from 'next/router';

const ContentLibraryBanner: React.FC = () => {
    const router = useRouter();

    return (
        <Flex
            direction={{ base: "column", md: "row" }}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="xl"
            mb={4}
            p={{ base: 5, md: 8 }}
            cursor="pointer"
            onClick={() => window.open('/content-library', '_blank')}
            transition="all 0.3s"
            _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
                borderColor: 'purple.200'
            }}
            position="relative"
            overflow="hidden"
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
            gap={{ base: 6, md: 0 }}
            boxShadow="sm"
        >
            <Flex align="center" gap={6} zIndex={1} direction="row">
                {/* File Stack Graphic */}
                <Box position="relative" w="50px" h="50px" mr={2}>
                    <Box
                        position="absolute"
                        top="-8px"
                        left="8px"
                        bg="purple.100"
                        w="40px"
                        h="50px"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="purple.200"
                        transform="rotate(10deg)"
                    />
                    <Box
                        position="absolute"
                        top="-4px"
                        left="4px"
                        bg="purple.200"
                        w="40px"
                        h="50px"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="purple.300"
                        transform="rotate(5deg)"
                    />
                    <Flex
                        position="absolute"
                        top="0"
                        left="0"
                        bg="purple.500"
                        w="40px"
                        h="50px"
                        borderRadius="md"
                        align="center"
                        justify="center"
                        shadow="md"
                    >
                        <Icon as={FaGem} color="white" fontSize="18px" />
                    </Flex>
                </Box>

                <Flex direction="column">
                    <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="800" color="gray.800" letterSpacing="tight" lineHeight="1.2">
                        Content Library
                    </Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" maxW="lg" lineHeight="short">
                        Premium IAs, EEs, Personal Projects, and Portfolios to ace your exams.
                    </Text>
                </Flex>
            </Flex>

            <Button
                variant="outline"
                colorScheme="purple"
                size="md"
                fontWeight="bold"
                onClick={(e) => {
                    e.stopPropagation();
                    window.open('/content-library', '_blank');
                }}
                zIndex={1}
                width={{ base: "100%", md: "auto" }}
                rightIcon={<Icon as={FaGem} />}
            >
                Browse All
            </Button>
        </Flex>
    );
};

export default ContentLibraryBanner;
