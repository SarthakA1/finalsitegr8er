import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Box, Flex, Text, Spinner, Button, Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import PDFPaginatedViewer from '../ContentLibrary/PDFPaginatedViewer';


type DocumentViewerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
    userEmail?: string;
};


const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, url, title, userEmail }) => {
    const isPdf = url.split('?')[0].toLowerCase().endsWith('.pdf');

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
            <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
            <ModalContent bg="transparent" boxShadow="none">

                <ModalCloseButton
                    position="fixed"
                    top="20px"
                    right="20px"
                    zIndex={9999}
                    bg="whiteAlpha.200"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: "whiteAlpha.400" }}
                />

                <ModalBody
                    p={0}
                    h="100vh"
                    w="100vw"
                    overflow="hidden"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >

                    {/* Document Container */}
                    <Box
                        w={{ base: "100%", md: "90%" }}
                        h={{ base: "100%", md: "95%" }}
                        bg="gray.100"
                        borderRadius={{ base: 0, md: "xl" }}
                        overflow="hidden"
                        position="relative"
                        boxShadow="2xl"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                    >
                        <Box w="100%" h="100%" position="relative">

                            {/* Header Bar */}
                            <Flex
                                position="absolute"
                                top="0"
                                left="0"
                                right="0"
                                height="50px"
                                bg="white"
                                borderBottom="1px solid"
                                borderColor="gray.200"
                                zIndex={30}
                                align="center"
                                px={4}
                                justify="center"
                            >
                                <Text fontWeight="600" fontSize="sm" color="gray.700" isTruncated maxW="90%">
                                    {title || 'Document Viewer'}
                                </Text>
                            </Flex>

                            {/* Main Viewer Area */}
                            <Box
                                position="absolute"
                                top="50px"
                                bottom="0"
                                left="0"
                                right="0"
                                overflow="hidden"
                                bg="gray.800"
                            >
                                {isPdf ? (
                                    <PDFPaginatedViewer url={url} />
                                ) : (
                                    <Flex justify="center" align="center" h="100%" overflow="auto">
                                        <img
                                            src={url}
                                            alt={title}
                                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                        />
                                    </Flex>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal >
    );
};

export default DocumentViewerModal;
