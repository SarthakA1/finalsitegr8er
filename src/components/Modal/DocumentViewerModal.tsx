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


                    {/* Document Container - Cropped to hide toolbar */}
                    <Box
                        w={{ base: "100%", md: "80%" }}
                        h={{ base: "100%", md: "90%" }}
                        bg="gray.100"
                        borderRadius={{ base: 0, md: "xl" }}
                        overflow="hidden"
                        position="relative"
                        boxShadow="2xl"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                    >
                        {/* Header Bar inside container */}
                        <Flex
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            height="50px"
                            bg="white"
                            borderBottom="1px solid"
                            borderColor="gray.200"
                            zIndex={20}
                            align="center"
                            px={4}
                            justify="center"
                        >
                            <Text fontWeight="600" fontSize="sm" color="gray.700" isTruncated maxW="90%">
                                {title || 'Document Viewer'}
                            </Text>
                        </Flex>

                        <Box w="100%" h="100%" pt="50px" overflow="hidden">
                            <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                                style={{
                                    width: '100%',
                                    height: 'calc(100% + 60px)', // Increase height
                                    marginTop: '-48px', // Shift up to hide Google Docs header (adjusted to show top of doc)
                                    border: 'none',
                                }}
                                title="Document Preview"
                            />
                        </Box>

                    </Box>


                </ModalBody>
            </ModalContent>
        </Modal >
    );
};

export default DocumentViewerModal;
