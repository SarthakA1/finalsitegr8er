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
    Checkbox,
    Progress,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Spinner
} from '@chakra-ui/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, storage, firestore } from '@/firebase/clientApp';
import { ref, getDownloadURL, uploadBytesResumable, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { FiUploadCloud, FiFile, FiCheckCircle, FiLock } from 'react-icons/fi';
import { ContentItem } from '@/hooks/useContentLibrary';

const AdminUploadPage = () => {
    const [user, authLoading] = useAuthState(auth);
    const [pageLoading, setPageLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Data State
    const [resources, setResources] = useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [tableLoading, setTableLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [grantLoading, setGrantLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('5.00');
    const [isFree, setIsFree] = useState(false);
    const [score, setScore] = useState("7");
    const [session, setSession] = useState('May 2025');
    const [subject, setSubject] = useState('Math AA HL');
    const [program, setProgram] = useState('DP');
    const [resourceType, setResourceType] = useState('IA');
    const [tokType, setTokType] = useState('Essay');
    const [writerName, setWriterName] = useState(''); // New Writer Name

    // Manual Unlock State
    const [manualUid, setManualUid] = useState('');
    const [manualRid, setManualRid] = useState('');

    const RESOURCE_TYPES_DP = ["IA", "EE", "TOK"];
    const RESOURCE_TYPES_MYP = ["Personal Project", "Portfolio - Design", "Portfolio - Drama", "Portfolio - Music", "Portfolio - Visual Arts"];

    // File State
    const [contentFile, setContentFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

    const toast = useToast();
    const contentRef = useRef<HTMLInputElement>(null);
    const thumbnailRef = useRef<HTMLInputElement>(null);

    // Allowed Admin Emails & UIDs
    const ADMIN_EMAILS = [
        'sarthak.ahuja231@gmail.com',
        'admin@gr8er.ib'
    ];
    const ADMIN_UIDS = [
        '28JzN8ZAqSZCoCCCK9iNjiDiNUP2'
    ];

    useEffect(() => {
        if (!authLoading) {
            const isEmailAllowed = user && user.email && (ADMIN_EMAILS.includes(user.email) || user.email.includes('admin'));
            const isUidAllowed = user && ADMIN_UIDS.includes(user.uid);

            if (isEmailAllowed || isUidAllowed) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
            setPageLoading(false);
        }
    }, [user, authLoading]);

    // Fetch Resources
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchResources = async () => {
            setTableLoading(true);
            try {
                const q = query(collection(firestore, 'content_library'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setResources(items);
            } catch (error) {
                console.error("Error fetching resources", error);
            }
            setTableLoading(false);
        };

        fetchResources();
    }, [isAuthenticated, refreshTrigger]);

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

    const handleFreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsFree(checked);
        if (checked) {
            setPrice('0.00');
        } else {
            setPrice('5.00'); // Reset to default if unchecked
        }
    };

    const handleManualGrant = async () => {
        const uid = manualUid.trim();
        const rid = manualRid.trim();

        if (!uid || !rid) {
            toast({ title: "Error", description: "Enter User ID and Resource ID", status: "error" });
            return;
        }

        setGrantLoading(true);
        try {
            // 1. Check Resource
            const docRef = doc(firestore, 'content_library', rid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error(`Resource ${rid} not found in content_library`);
            }

            const data = docSnap.data();

            // 2. Grant Access
            await setDoc(doc(firestore, `users/${uid}/purchases/${rid}`), {
                itemId: rid,
                title: data.title || "Manual Unlock",
                url: data.url || "",
                purchaseDate: serverTimestamp(),
                paymentId: 'manual_admin_grant'
            });

            toast({
                title: "Success",
                description: `Access granted for ${data.title} to user ${uid}`,
                status: "success",
                duration: 5000,
                isClosable: true
            });

            // Clear inputs
            setManualUid('');
            setManualRid('');

        } catch (error: any) {
            console.error("Grant Error", error);
            toast({
                title: "Grant Failed",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true
            });
        }
        setGrantLoading(false);
    };

    const handleUpload = async () => {
        if (!title || !description || !contentFile || !thumbnailFile || !writerName) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill all fields (including Writer Name) and select both files.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        setUploadProgress(10); // Start fake progress

        try {
            // 1. Upload Content (Simple uploadBytes to avoid hanging)
            const contentStorageRef = ref(storage, `content_files/${Date.now()}_${contentFile.name}`);
            setUploadProgress(30);
            await uploadBytes(contentStorageRef, contentFile);
            setUploadProgress(60);
            const contentUrl = await getDownloadURL(contentStorageRef);

            // 2. Upload Thumbnail
            const thumbnailStorageRef = ref(storage, `content_thumbnails/${Date.now()}_${thumbnailFile.name}`);
            setUploadProgress(80);
            await uploadBytes(thumbnailStorageRef, thumbnailFile);
            const thumbnailUrl = await getDownloadURL(thumbnailStorageRef);

            setUploadProgress(90);

            // 3. Save to Firestore
            await addDoc(collection(firestore, 'content_library'), {
                title,
                description,
                writerName, // New field
                purchaseCount: 0, // Init counter
                price: parseFloat(price),
                score: score,
                session,
                subject: (resourceType === 'TOK' ? tokType : subject),
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

            // Reset Form and Refresh List
            setTitle('');
            setDescription('');
            setWriterName('');
            setContentFile(null);
            setThumbnailFile(null);
            setThumbnailPreview('');
            setUploadProgress(0);
            setRefreshTrigger(prev => prev + 1);

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

    if (!isAuthenticated) {
        return (
            <Container maxW="container.sm" py={20}>
                <VStack spacing={6} bg="white" p={10} borderRadius="xl" boxShadow="lg">
                    <Icon as={FiLock} boxSize={10} color="gray.400" />
                    <Heading size="md">Admin Access Required</Heading>
                    <Text textAlign="center" color="gray.600">
                        You do not have permission to view this page.
                        <br />
                        Signed in as: <Text as="span" fontWeight="bold">{user?.email || 'Unknown'}</Text>
                    </Text>
                    {authLoading && <Spinner />}
                    {!authLoading && (
                        <Button colorScheme="purple" onClick={() => window.location.reload()}>Refresh</Button>
                    )}
                </VStack>
            </Container>
        );
    }

    return (
        <Container maxW="container.lg" py={10}>
            <VStack spacing={10} align="stretch">

                {/* UPLOAD FORM */}
                <VStack spacing={8} align="stretch" bg="white" p={8} borderRadius="xl" boxShadow="lg" border="1px solid" borderColor="gray.100">
                    <Heading size="lg" textAlign="center">Upload Content to Library</Heading>

                    <FormControl isRequired>
                        <FormLabel>Title</FormLabel>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. IB Math AA HL Study Guide" />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Writer Name (Internal Only)</FormLabel>
                        <Input value={writerName} onChange={(e) => setWriterName(e.target.value)} placeholder="e.g. John Doe - This is not shown to students" />
                    </FormControl>

                    <FormControl isRequired>
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
                            <Select value={resourceType} onChange={(e) => {
                                const newType = e.target.value;
                                setResourceType(newType);
                                if (newType === 'TOK' || newType === 'EE') {
                                    setScore('A');
                                } else {
                                    setScore('7');
                                }
                            }}>
                                {(program === 'DP' ? RESOURCE_TYPES_DP : RESOURCE_TYPES_MYP).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Select>
                        </FormControl>
                    </Flex>

                    <Flex gap={4}>
                        <FormControl>
                            <FormLabel>Price (USD)</FormLabel>
                            <Flex align="center" gap={3}>
                                <NumberInput
                                    value={price}
                                    onChange={(valueString) => setPrice(valueString)}
                                    precision={2}
                                    step={0.01}
                                    min={0}
                                    isDisabled={isFree}
                                    w="150px"
                                >
                                    <NumberInputField />
                                </NumberInput>
                                <Checkbox
                                    isChecked={isFree}
                                    onChange={handleFreeChange}
                                    colorScheme="purple"
                                    fontWeight="bold"
                                >
                                    Free?
                                </Checkbox>
                            </Flex>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Score</FormLabel>
                            {(resourceType === 'EE' || resourceType === 'TOK') ? (
                                <Select value={score} onChange={(e) => setScore(e.target.value)}>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                </Select>
                            ) : (
                                <Select value={score} onChange={(e) => setScore(e.target.value)}>
                                    <option value="7">7</option>
                                    <option value="6">6</option>
                                    <option value="5">5</option>
                                    <option value="4">4</option>
                                    <option value="3">3</option>
                                    <option value="2">2</option>
                                    <option value="1">1</option>
                                </Select>
                            )}
                        </FormControl>
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
                        {resourceType === 'TOK' && (
                            <FormControl>
                                <FormLabel>TOK Type</FormLabel>
                                <Select value={tokType} onChange={(e) => setTokType(e.target.value)}>
                                    <option value="Essay">Essay</option>
                                    <option value="Exhibition">Exhibition</option>
                                </Select>
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

                {/* RESOURCE TABLE */}
                <Box bg="white" borderRadius="xl" boxShadow="lg" border="1px solid" borderColor="gray.100" p={6} overflowX="auto">
                    <Heading size="md" mb={6}>Resource Dashboard</Heading>
                    {tableLoading ? (
                        <Flex justify="center" p={10}><Spinner /></Flex>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Title</Th>
                                    <Th>Writer</Th>
                                    <Th>Uploaded</Th>
                                    <Th isNumeric>Purchases</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {resources.map(res => (
                                    <Tr key={res.id}>
                                        <Td fontWeight="600">{res.title}</Td>
                                        <Td>{res.writerName || <Text as="span" color="gray.400">N/A</Text>}</Td>
                                        <Td fontSize="sm" color="gray.500">
                                            {res.createdAt?.seconds ? new Date(res.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                                        </Td>
                                        <Td isNumeric>
                                            <Badge colorScheme="green" fontSize="sm" px={2}>
                                                {res.purchaseCount || 0}
                                            </Badge>
                                        </Td>
                                    </Tr>
                                ))}
                                {resources.length === 0 && (
                                    <Tr>
                                        <Td colSpan={4} textAlign="center" py={6} color="gray.500">No resources found.</Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    )}
                </Box>

                {/* Manual Unlock Section */}
                <VStack spacing={6} align="stretch" bg="white" p={8} borderRadius="xl" boxShadow="lg" border="1px solid" borderColor="gray.100">
                    <Heading size="md">Manual Access Grant</Heading>
                    <Text fontSize="sm" color="gray.500">Unlock a resource for a user manually. IDs must be exact.</Text>
                    <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                        <FormControl>
                            <FormLabel>User ID (UID)</FormLabel>
                            <Input
                                value={manualUid}
                                onChange={(e) => setManualUid(e.target.value)}
                                placeholder="e.g. 28JzN8..."
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Resource ID (Doc ID)</FormLabel>
                            <Input
                                value={manualRid}
                                onChange={(e) => setManualRid(e.target.value)}
                                placeholder="e.g. T7fL5g..."
                            />
                        </FormControl>
                    </Flex>
                    <Button
                        colorScheme="green"
                        onClick={handleManualGrant}
                        isLoading={grantLoading}
                        loadingText="Granting..."
                    >
                        Grant Access
                    </Button>
                </VStack>

                {/* SUBMISSIONS TABLE */}
                <Box bg="white" borderRadius="xl" boxShadow="lg" border="1px solid" borderColor="gray.100" p={6} overflowX="auto">
                    <Heading size="md" mb={6}>User Submissions (Earn Passive Income)</Heading>
                    <SubmissionTable />
                </Box>
            </VStack>
        </Container>
    );
};

const SubmissionTable = () => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const q = query(collection(firestore, 'submissions'), orderBy('submittedAt', 'desc'));
                const snapshot = await getDocs(q);
                setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching submissions", error);
            }
            setLoading(false);
        };
        fetchSubmissions();
    }, []);

    if (loading) return <Flex justify="center" p={4}><Spinner /></Flex>;

    return (
        <Table variant="simple" size="sm">
            <Thead>
                <Tr>
                    <Th>Name & Email</Th>
                    <Th>Details</Th>
                    <Th>Files</Th>
                    <Th>Date</Th>
                </Tr>
            </Thead>
            <Tbody>
                {submissions.map((sub) => (
                    <Tr key={sub.id}>
                        <Td>
                            <Text fontWeight="bold">{sub.fullName}</Text>
                            <Text fontSize="xs" color="gray.500">{sub.email}</Text>
                        </Td>
                        <Td>
                            <VStack align="start" spacing={0}>
                                <Badge colorScheme={sub.curriculum === 'IB DP' ? 'blue' : 'orange'}>{sub.curriculum}</Badge>
                                <Text fontSize="xs">{sub.session}</Text>
                                <Text fontSize="xs" fontWeight="bold">{sub.courseworkType} {sub.subject && `- ${sub.subject}`}</Text>
                            </VStack>
                        </Td>
                        <Td>
                            <VStack align="start" spacing={1}>
                                <Button as="a" href={sub.courseworkUrl} target="_blank" size="xs" colorScheme="purple" variant="outline" leftIcon={<Icon as={FiFile} />}>
                                    Coursework
                                </Button>
                                <Button as="a" href={sub.proofUrl} target="_blank" size="xs" colorScheme="teal" variant="outline" leftIcon={<Icon as={FiCheckCircle} />}>
                                    Proof
                                </Button>
                            </VStack>
                        </Td>
                        <Td fontSize="xs">
                            {sub.submittedAt?.seconds ? new Date(sub.submittedAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                        </Td>
                    </Tr>
                ))}
                {submissions.length === 0 && (
                    <Tr>
                        <Td colSpan={4} textAlign="center" py={4} color="gray.500">No submissions yet.</Td>
                    </Tr>
                )}
            </Tbody>
        </Table>
    );
};

export default AdminUploadPage;
