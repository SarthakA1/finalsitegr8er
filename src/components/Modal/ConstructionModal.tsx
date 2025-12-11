
import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Text, Image, Box, Flex } from '@chakra-ui/react';

type ConstructionModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ConstructionModal: React.FC<ConstructionModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay
                backdropFilter="blur(8px)"
                bg="blackAlpha.300"
            />
            <ModalContent
                bg="#fcfbf8" // Paper-like off-white
                borderRadius="xl"
                boxShadow="2xl"
                border="2px dashed"
                borderColor="gray.400"
                p={4}
                position="relative"
                overflow="hidden"
            >
                {/* Sketchy Tape effect */}
                <Box position="absolute" top="-15px" left="50%" transform="translateX(-50%) rotate(-2deg)" width="120px" height="35px" bg="yellow.200" opacity={0.8} zIndex={1} boxShadow="sm" />

                <ModalHeader textAlign="center" fontFamily="'Architects Daughter', cursive, sans-serif" fontSize="2xl" color="gray.700" mt={2}>
                    Work in Progress!
                </ModalHeader>
                <ModalBody>
                    <Flex direction="column" align="center" justify="center" textAlign="center">
                        <Box position="relative" mb={6}>
                            {/* Placeholder for a sketchy construction image - using text/shapes for now if no image available */}
                            <Box
                                w="200px"
                                h="150px"
                                border="2px solid"
                                borderColor="gray.800"
                                borderRadius="md"
                                position="relative"
                                bg="white"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Text fontFamily="monospace" fontSize="xs" color="gray.400">Sketch Area</Text>
                                {/* Crude CSS Sketch lines */}
                                <Box position="absolute" bottom="10px" left="10px" w="180px" h="2px" bg="gray.800" transform="rotate(-1deg)" />
                                <Box position="absolute" top="20px" right="20px" w="40px" h="40px" border="2px solid" borderColor="orange.400" borderRadius="full" />
                                <Box position="absolute" bottom="30px" left="40px" w="20px" h="60px" bg="gray.200" border="1px solid black" />
                                <Box position="absolute" bottom="30px" left="70px" w="20px" h="80px" bg="gray.300" border="1px solid black" />
                            </Box>
                            {/* Handwritten annotation */}
                            <Text
                                position="absolute"
                                right="-40px"
                                bottom="-10px"
                                transform="rotate(-10deg)"
                                color="red.500"
                                fontFamily="'Permanent Marker', cursive, sans-serif"
                                fontWeight="bold"
                                fontSize="sm"
                            >
                                Still building!
                            </Text>
                        </Box>

                        <Text fontSize="lg" fontWeight="600" mb={2}>
                            The IB DP Section is under heavy construction.
                        </Text>
                        <Text color="gray.600" fontSize="sm">
                            We are sketching out the blueprint for the Diploma Programme. Expect some dust and loose screws while we finalize the structure.
                        </Text>
                    </Flex>
                </ModalBody>

                <ModalFooter justifyContent="center">
                    <Button
                        onClick={onClose}
                        colorScheme="yellow"
                        variant="solid"
                        borderRadius="full"
                        px={8}
                        shadow="md"
                        _hover={{ transform: 'scale(1.05)', shadow: 'lg' }}
                        fontFamily="'Architects Daughter', cursive, sans-serif"
                    >
                        Got it!
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ConstructionModal;
