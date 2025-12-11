import { Menu, MenuButton, MenuList, Icon, Flex, List, ListItem, Link, Box, Divider } from '@chakra-ui/react';
import { IoNotifications, IoDocumentText, IoImageOutline } from 'react-icons/io5';
import React, { useEffect, useState } from 'react';
import { Text } from "@chakra-ui/react";
import { useResetRecoilState } from 'recoil';
import { subjectState } from '@/atoms/subjectsAtom';
import TabItem from '../../Posts/TabItem';
import { Post } from '@/atoms/postsAtom';
import { Notification as NotificationType } from '@/atoms/notificationsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import usePosts from '@/hooks/usePosts';
import { auth, firestore } from '@/firebase/clientApp';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilValue } from 'recoil';
import { curriculumState } from '@/atoms/curriculumAtom';

type NotificationsProps = {
    post?: Post[];
    notifications?: NotificationType[];
};

const formTabs: TabItem[] = [
    {
        title: 'Notifications',
        icon: IoDocumentText
    },
    {
        title: 'My Posts',
        icon: IoImageOutline
    },
]

export type TabItem = {
    title: string;
    icon: typeof Icon.arguments
}

const Notification: React.FC<NotificationsProps> = () => {
    const resetSubjectState = useResetRecoilState(subjectState)
    const [selectedTab, setSelectedTab] = useState(formTabs[0].title)
    const [users] = useAuthState(auth);
    const [postStateValue, setPostStateValue] = useState<Post[]>([]);
    //const { postStateValue, setPostStateValue, onVote, onDeletePost, onSelectPost } = usePosts(subjectData!);
    //const [notificationsValue, setNotificationsValue] = useState([]);
    const [notificationsValue, setNotificationsValue] = useState<NotificationType[]>([]);
    const curriculum = useRecoilValue(curriculumState);

    const getPosts = async () => {
        try {
            //get posts for the subject
            const postsQuery = query(
                collection(firestore, 'posts'),
                where('creatorId', '==', users?.uid!),
                orderBy('createdAt', 'desc')
            )
            const postDocs = await getDocs(postsQuery);

            //store in post state
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];

            // Filter by curriculum
            const filteredPosts = posts.filter(post => {
                if (curriculum.curriculumId === 'ib-dp') return post.curriculumId === 'ib-dp';
                return post.curriculumId === 'ib-myp' || !post.curriculumId;
            });

            setPostStateValue(filteredPosts);
            // setPostStateValue(prev  => ({
            //     ...prev,
            //     posts: posts as Post[],
            // }))
        } catch (error: any) {
            console.log('getPosts error', error.message)
        }
    };

    const getNotifications = async () => {
        try {
            //get posts for the subject
            const notificationsQuery = query(
                collection(firestore, 'notifications'),
                where('notifyTo', '==', users?.displayName! || users?.email!.split('@')[0]),
                orderBy('createdAt', 'desc')
            )
            const notificationDocs = await getDocs(notificationsQuery);

            //store in post state
            const notifications = notificationDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            //setNotificationsValue(notifications as Notification[]);
            setNotificationsValue(notifications as NotificationType[]);
            // setNotificationsValue(prev  => ({
            //     ...prev,
            //     notifications: notifications as Notification[],
            // }))
        } catch (error: any) {
            console.log('getPosts error', error.message)
        }
    };

    useEffect(() => {
        getPosts();
        getNotifications();
    }, [users, curriculum.curriculumId])
    return (
        <Menu>
            <MenuButton
                cursor="pointer"
                padding="8px"
                borderRadius="full"
                _hover={{ bg: "gray.100" }}
                transition="all 0.2s"
                position="relative"
            >
                <Flex align="center">
                    <Icon as={IoNotifications} fontSize={22} color="gray.600" />
                    {notificationsValue.length > 0 && (
                        <Box
                            position="absolute"
                            top="6px"
                            right="6px"
                            boxSize="8px"
                            bg="red.500"
                            borderRadius="full"
                            border="2px solid white"
                        />
                    )}
                </Flex>
            </MenuButton>
            <MenuList p={0} borderRadius="lg" shadow="lg" border="1px solid" borderColor="gray.200" overflow="hidden" maxWidth="350px" width="350px">
                <Flex p={3} bg="gray.50" borderBottom="1px solid" borderColor="gray.200" align="center" justify="space-between">
                    <Text fontSize="sm" fontWeight="700" color="gray.700">Notifications</Text>
                    {/* <Text fontSize="xs" color="brand.500" cursor="pointer" fontWeight="600">Mark all as read</Text> */}
                </Flex>

                <Flex direction="column" maxHeight="400px" overflowY="auto">
                    <Flex borderBottom="1px solid" borderColor="gray.100">
                        {formTabs.map((item) => (
                            <Flex
                                key={item.title}
                                flex={1}
                                align="center"
                                justify="center"
                                p={3}
                                cursor="pointer"
                                bg={selectedTab === item.title ? "white" : "gray.50"}
                                borderBottom={selectedTab === item.title ? "2px solid" : "none"}
                                borderColor="brand.500"
                                color={selectedTab === item.title ? "brand.600" : "gray.500"}
                                fontWeight={selectedTab === item.title ? "600" : "500"}
                                onClick={() => setSelectedTab(item.title)}
                                transition="all 0.2s"
                            >
                                <Icon as={item.icon} mr={2} />
                                <Text fontSize="xs">{item.title}</Text>
                            </Flex>
                        ))}
                    </Flex>

                    {selectedTab === "Notifications" && (
                        <List spacing={0}>
                            {notificationsValue.length > 0 ? (
                                notificationsValue.slice(0, 25).map((item: any, index: any) => (
                                    <ListItem key={index} _hover={{ bg: "brand.50" }} transition="all 0.2s">
                                        <Flex p={3} align="start" gap={3}>
                                            <Box mt={1}>
                                                <Box boxSize="8px" bg="brand.500" borderRadius="full" />
                                            </Box>
                                            <Flex direction="column" gap={1}>
                                                <Text fontSize="sm" color="gray.700" lineHeight="1.4" dangerouslySetInnerHTML={{ __html: item.notification }} />
                                                <Text fontSize="xs" color="gray.400">
                                                    {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                        <Divider />
                                    </ListItem>
                                ))
                            ) : (
                                <Flex p={8} justify="center" align="center" direction="column">
                                    <Icon as={IoNotifications} fontSize={40} color="gray.300" mb={2} />
                                    <Text fontSize="sm" color="gray.500">No notifications yet</Text>
                                </Flex>
                            )}
                        </List>
                    )}

                    {selectedTab === "My Posts" && (
                        <List spacing={0}>
                            {postStateValue.length > 0 ? (
                                postStateValue.slice(0, 25).map((item: any, index: any) => (
                                    <ListItem key={index} _hover={{ bg: "brand.50" }} transition="all 0.2s">
                                        <Link href={`/subject/${item.subjectId}/answers/${item.id}`} _hover={{ textDecoration: 'none' }}>
                                            <Flex p={3} align="center" justify="space-between">
                                                <Text fontSize="sm" color="gray.700" noOfLines={1} fontWeight="500">
                                                    {item.title}
                                                </Text>
                                                <Icon as={IoDocumentText} color="gray.400" />
                                            </Flex>
                                        </Link>
                                        <Divider />
                                    </ListItem>
                                ))
                            ) : (
                                <Flex p={8} justify="center" align="center" direction="column">
                                    <Icon as={IoDocumentText} fontSize={40} color="gray.300" mb={2} />
                                    <Text fontSize="sm" color="gray.500">You haven't posted yet</Text>
                                </Flex>
                            )}
                        </List>
                    )}
                </Flex>
            </MenuList>
        </Menu>
    )
}
export default Notification;

