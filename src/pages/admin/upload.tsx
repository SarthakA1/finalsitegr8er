import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Textarea,
    NumberInput,
    NumberInputField,
    Radio,
    RadioGroup,
    Stack,
    Select,
    Text,
    useToast,
    VStack,
    Image,
    Icon,
    Progress
} from '@chakra-ui/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, storage, firestore } from '@/firebase/clientApp';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FiUploadCloud, FiFile, FiCheckCircle } from 'react-icons/fi';

const AdminUploadPage = () => {
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('5.00');
    const [score, setScore] = useState<string | number>('7');
    const [session, setSession] = useState('May 2025');
    const [subject, setSubject] = useState('Math AA HL');
    const [program, setProgram] = useState('DP');
    const [resourceType, setResourceType] = useState('IA');

    const RESOURCE_TYPES_DP = ["IA", "EE", "TOK"];
    const RESOURCE_TYPES_MYP = ["Personal Project", "Portfolio - Design", "Portfolio - Drama", "Portfolio - Music", "Portfolio - Visual Arts"];

    // File State
    const [contentFile, setContentFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

    const toast = useToast();
    const contentRef = useRef<HTMLInputElement>(null);
    const thumbnailRef = useRef<HTMLInputElement>(null);

    const onSelectContent = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setContentFile(event.target.files[0]);
        }
    };

    const onSelectThumbnail = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const file = event.target.files[0];
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                if (readerEvent.target?.result) {
                    setThumbnailPreview(readerEvent.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!title || !description || !contentFile || !thumbnailFile) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill all fields and select both content and thumbnail files.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            // 1. Upload Content (Resumable for progress)
            const contentStorageRef = ref(storage, `content_files/${Date.now()}_${contentFile.name}`);
            const uploadTask = uploadBytesResumable(contentStorageRef, contentFile);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    throw error;
                }
            );

            await uploadTask;
            const contentUrl = await getDownloadURL(contentStorageRef);

            // 2. Upload Thumbnail
            const thumbnailStorageRef = ref(storage, `content_thumbnails/${Date.now()}_${thumbnailFile.name}`);
            await uploadBytesResumable(thumbnailStorageRef, thumbnailFile);
            const thumbnailUrl = await getDownloadURL(thumbnailStorageRef);

            // 3. Save to Firestore
            await addDoc(collection(firestore, 'content_library'), {
                title,
                description,
                price: parseFloat(price),
                score: score,
                session,
                subject,
                program,
                resourceType,
                thumbnail: thumbnailUrl,
                url: contentUrl,
                type: contentFile.type.includes('image') ? 'image' : 'pdf',
                createdAt: serverTimestamp(),
                creatorId: user?.uid || 'anon',
            });

            toast({
                title: 'Success!',
                description: 'Content uploaded successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Reset Form
            setTitle('');
            setDescription('');
            setContentFile(null);
            setThumbnailFile(null);
            setThumbnailPreview('');
            setUploadProgress(0);

        } catch (error: any) {
            console.error('Upload error', error);
            toast({
                title: 'Upload Failed',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        setLoading(false);
    };

    return (
        <Container maxW="container.md" py={10}>
            <VStack spacing={8} align="stretch" bg="white" p={8} borderRadius="xl" boxShadow="lg" border="1px solid" borderColor="gray.100">
                <Heading size="lg" textAlign="center">Upload Content to Library</Heading>

                <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. IB Math AA HL Study Guide" />
                </FormControl>

                <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description of the resource..." />
                </FormControl>

                <Flex gap={4}>
                    <FormControl>
                        <FormLabel>Program</FormLabel>
                        <RadioGroup onChange={setProgram} value={program}>
                            <Stack direction='row'>
                                <Radio value='DP'>IB DP</Radio>
                                <Radio value='MYP'>IB MYP</Radio>
                            </Stack>
                        </RadioGroup>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Resource Type</FormLabel>
                        <Select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
                            {(program === 'DP' ? RESOURCE_TYPES_DP : RESOURCE_TYPES_MYP).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </Select>
                    </FormControl>
                </Flex>

                <Flex gap={4}>
                    <FormControl>
                        <FormLabel>Price (USD)</FormLabel>
                        <NumberInput
                            value={price}
                            onChange={(valueString) => setPrice(valueString)}
                            precision={2}
                            step={0.01}
                            min={0}
                        >
                            <NumberInputField />
                        </NumberInput>
                    </FormControl>

                    {/* Conditional Score Input */}
                    {(['IA', 'EE', 'TOK'].includes(resourceType)) && (
                        <FormControl>
                            <FormLabel>Score</FormLabel>
                            <Select
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                            >
                                {resourceType === 'IA' ? (
                                    <>
                                        <option value="7">7</option>
                                        <option value="6">6</option>
                                        <option value="5">5</option>
                                    </>
                                ) : (
                                    <>
                                        {/* EE or TOK */}
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                        <option value="E">E</option>
                                    </>
                                )}
                            </Select>
                        </FormControl>
                    )}
                </Flex>

                <Flex gap={4}>
                    <FormControl>
                        <FormLabel>Session</FormLabel>
                        <Input value={session} onChange={(e) => setSession(e.target.value)} placeholder="e.g. May 2025" />
                    </FormControl>
                    {(resourceType === 'IA' || resourceType === 'EE') && (
                        <FormControl>
                            <FormLabel>Subject</FormLabel>
                            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Math AA HL" />
                        </FormControl>
                    )}
                </Flex>

                {/* Content File Upload */}
                <FormControl>
                    <FormLabel>Content File (PDF/Image)</FormLabel>
                    <Flex align="center" gap={4} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                        <Button leftIcon={<Icon as={FiUploadCloud} />} onClick={() => contentRef.current?.click()} size="sm">
                            Select Content File
                        </Button>
                        <Box flex={1}>
                            <Text fontSize="sm" color="gray.600" noOfLines={1} fontWeight={500}>
                                {contentFile ? contentFile.name : 'No file selected'}
                            </Text>
                        </Box>
                        <Input type="file" ref={contentRef} hidden onChange={onSelectContent} accept="application/pdf, image/*" />
                    </Flex>
                </FormControl>

                {/* Thumbnail Upload */}
                <FormControl isRequired>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <VStack align="stretch" spacing={3}>
                        <Flex align="center" gap={4} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                            <Button leftIcon={<Icon as={FiUploadCloud} />} onClick={() => thumbnailRef.current?.click()} size="sm">
                                Select Thumbnail
                            </Button>
                            <Box flex={1}>
                                <Text fontSize="sm" color="gray.600" noOfLines={1} fontWeight={500}>
                                    {thumbnailFile ? thumbnailFile.name : 'No file selected'}
                                </Text>
                            </Box>
                            <Input type="file" ref={thumbnailRef} hidden onChange={onSelectThumbnail} accept="image/*" />
                        </Flex>

                        {thumbnailPreview && (
                            <Flex justify="center" p={2} bg="gray.50" borderRadius="md" border="1px dashed" borderColor="gray.300">
                                <Image src={thumbnailPreview} alt="Thumbnail Preview" maxH="200px" objectFit="contain" />
                            </Flex>
                        )}
                    </VStack>
                </FormControl>

                {loading && (
                    <Box>
                        <Text fontSize="sm" mb={1} color="gray.600">Uploading... {Math.round(uploadProgress)}%</Text>
                        <Progress value={uploadProgress} size="sm" colorScheme="purple" borderRadius="full" />
                    </Box>
                )}

                <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={handleUpload}
                    isLoading={loading}
                    loadingText="Uploading..."
                    leftIcon={<Icon as={FiUploadCloud} />}
                    isDisabled={!contentFile || !thumbnailFile}
                >
                    Upload Content
                </Button>

            </VStack>
        </Container>
    );
};

export default AdminUploadPage;
