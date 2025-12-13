import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Box, Flex, Text } from '@chakra-ui/react';

type DocumentViewerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
};

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, url, title }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
            <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
            <ModalContent bg="transparent" boxShadow="none">
                <ModalCloseButton
                    position="fixed"
                    top="20px"
                    right="20px"
                    zIndex={999}
                    bg="whiteAlpha.200"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: "whiteAlpha.400" }}
                />
                <ModalBody p={0} h="100vh" w="100vw" overflow="hidden" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    {/* Header/Title Overlay */}
                    {title && (
                        <Flex
                            position="fixed"
                            top="20px"
                            left="50%"
                            transform="translateX(-50%)"
                            bg="blackAlpha.600"
                            px={6}
                            py={2}
                            borderRadius="full"
                            zIndex={998}
                        >
                            <Text color="white" fontWeight="600">{title}</Text>
                        </Flex>
                    )}

                    {/* Document Container - Cropped to hide toolbar */}
                    <Box
                        w={{ base: "100%", md: "80%" }}
                        h={{ base: "100%", md: "90%" }}
                        bg="white"
                        borderRadius={{ base: 0, md: "xl" }}
                        overflow="hidden"
                        position="relative"
                    >
                        <iframe
                            src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                            }}
                            title="Document Preview"
                        />

                        {/* 
                           Overlays to mask the Google Docs Toolbar.
                           Google Docs Viewer places a toolbar at the top ~50px and a pop-out button at the top-right.
                        */}

                        {/* Top Toolbar Mask */}
                        <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            height="55px"
                            bg="white"
                            zIndex={10}
                        />
                        {/* Right Side Mask (Pop-out button) */}
                        <Box
                            position="absolute"
                            top="0"
                            right="0"
                            width="60px"
                            height="60px"
                            bg="white"
                            zIndex={11}
                        />

                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default DocumentViewerModal;
