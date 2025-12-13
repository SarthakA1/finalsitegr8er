
import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Text, Image, Box, Flex } from '@chakra-ui/react';

type ConstructionModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ConstructionModal: React.FC<ConstructionModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay
                backdropFilter="blur(8px)"
                bg="blackAlpha.300"
            />
            <ModalContent
                bg="white"
                borderRadius="2xl"
                boxShadow="2xl"
                border="1px solid"
                borderColor="gray.100"
                p={6}
                position="relative"
                overflow="hidden"
            >
                <ModalHeader textAlign="center" fontWeight="800" fontSize="2xl" color="brand.600" mt={2}>
                    Coming Soon 🚀
                </ModalHeader>
                <ModalBody>
                    <Flex direction="column" align="center" justify="center" textAlign="center">
                        <Box position="relative" mb={6}>
                            {/* Improved Construction Graphic Placeholder */}
                            <Image src="/images/gr8er_logo.png" h="60px" mb={4} opacity={0.5} filter="grayscale(100%)" />
                        </Box>

                        <Text fontSize="lg" fontWeight="600" mb={2} color="gray.700">
                            IB DP is under construction.
                        </Text>
                        <Text color="gray.500" fontSize="md">
                            We are currently building the Diploma Programme section to match the quality you expect. Stay tuned!
                        </Text>
                    </Flex>
                </ModalBody>

                <ModalFooter justifyContent="center">
                    <Button
                        onClick={onClose}
                        variant="solid" // Solid variant from our theme
                        px={8}
                    >
                        Got it
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ConstructionModal;
