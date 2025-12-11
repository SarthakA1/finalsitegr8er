import React from 'react';
import { Flex, Text, Button, Icon, Box, Image } from '@chakra-ui/react';
import { FaGem } from 'react-icons/fa';
import { useRouter } from 'next/router';

const ContentLibraryBanner: React.FC = () => {
    const router = useRouter();

    return (
        <Flex
            direction="column"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="xl"
            mb={4}
            p={6}
            cursor="pointer"
            onClick={() => window.open('/content-library', '_blank')}
            transition="all 0.3s"
            _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}
            position="relative"
            overflow="hidden"
        >
            {/* Background Pattern */}
            <Box
                position="absolute"
                top="-50%"
                right="-10%"
                width="300px"
                height="300px"
                bg="white"
                opacity="0.1"
                borderRadius="full"
                filter="blur(50px)"
            />
            <Box
                position="absolute"
                bottom="-20%"
                left="-10%"
                width="200px"
                height="200px"
                bg="pink.400"
                opacity="0.2"
                borderRadius="full"
                filter="blur(40px)"
            />

            <Flex align="center" justify="space-between" zIndex={1}>
                <Flex align="center" gap={4}>
                    <Flex
                        align="center"
                        justify="center"
                        bg="whiteAlpha.300"
                        borderRadius="lg"
                        p={3}
                        backdropFilter="blur(10px)"
                    >
                        <Icon as={FaGem} fontSize="24px" color="yellow.300" />
                    </Flex>
                    <Flex direction="column">
                        <Text fontSize="xl" fontWeight="800" color="white" letterSpacing="wide">
                            Content Library
                        </Text>
                        <Text fontSize="sm" color="whiteAlpha.900" fontWeight="500">
                            Premium study guides, cheat sheets, and more.
                        </Text>
                    </Flex>
                </Flex>

                <Button
                    variant="solid"
                    bg="white"
                    color="purple.600"
                    size="sm"
                    fontWeight="bold"
                    _hover={{ bg: "gray.100" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open('/content-library', '_blank');
                    }}
                >
                    Browse Library
                </Button>
            </Flex>
        </Flex>
    );
};

export default ContentLibraryBanner;
