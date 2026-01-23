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
    // Watermark setup
    const watermarkText = userEmail || "";
    // 3 columns of 6 rows
    const watermarks = Array(6).fill(watermarkText);

    const isPdf = url.split('?')[0].toLowerCase().endsWith('.pdf');

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
            <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
            <ModalContent bg="transparent" boxShadow="none">
                {/* Anti-Print Style */}
                <style>
                    {`
                        @media print {
                            body { display: none !important; }
                        }
                    `}
                </style>

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
                    onContextMenu={(e) => e.preventDefault()} // Disable Right Click
                    userSelect="none" // Disable Text Selection
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
                        {/* Wrapper for relative positioning */}
                        <Box w="100%" h="100%" position="relative" onContextMenu={(e) => e.preventDefault()}>

                            {/* Watermark Overlay */}
                            <Flex
                                position="absolute"
                                top={0}
                                left={0}
                                w="100%"
                                h="100%"
                                zIndex={20}
                                pointerEvents="none"
                                justify="space-between"
                                align="stretch"
                                p={4}
                                overflow="hidden"
                                opacity={0.2}
                            >
                                {[1, 2, 3].map((col) => (
                                    <Flex key={col} direction="column" justify="space-around" h="100%">
                                        {watermarks.map((text, index) => (
                                            <Text
                                                key={`wm-${col}-${index}`}
                                                color="gray.900"
                                                fontSize="2xl"
                                                fontWeight="bold"
                                                transform="rotate(-45deg)"
                                                whiteSpace="nowrap"
                                            >
                                                {text}
                                            </Text>
                                        ))}
                                    </Flex>
                                ))}
                            </Flex>


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
                                bg="white"
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
