import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Box, Flex, Text } from '@chakra-ui/react';


type DocumentViewerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
    userEmail?: string;
};


const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, url, title, userEmail }) => {
    const cleanUrl = url.split('?')[0].toLowerCase();
    const isPdf = cleanUrl.endsWith('.pdf');
    const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp'].some(ext => cleanUrl.endsWith(ext));
    const isDownloadable = !isPdf && !isImage;

    // For PDFs, open directly in a new tab - most reliable across all browsers/devices
    React.useEffect(() => {
        if (isOpen && isPdf && url) {
            window.open(url, '_blank', 'noopener,noreferrer');
            onClose();
        }
    }, [isOpen, isPdf, url, onClose]);

    // For non-PDF, non-image files (Word, Excel, etc.), trigger a download
    React.useEffect(() => {
        if (isOpen && isDownloadable && url) {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.download = title || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            onClose();
        }
    }, [isOpen, isDownloadable, url, onClose, title]);

    // Only render modal for image files
    if (isPdf || isDownloadable) return null;

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

                            {/* Image Viewer */}
                            <Box
                                position="absolute"
                                top="50px"
                                bottom="0"
                                left="0"
                                right="0"
                                overflow="hidden"
                                bg="gray.800"
                            >
                                <Flex justify="center" align="center" h="100%" overflow="auto">
                                    <img
                                        src={url}
                                        alt={title}
                                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                    />
                                </Flex>
                            </Box>
                        </Box>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default DocumentViewerModal;
