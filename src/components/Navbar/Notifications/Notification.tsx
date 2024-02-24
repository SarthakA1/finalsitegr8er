import { Menu, MenuButton, MenuList, Icon, Flex, List, ListItem, Link } from '@chakra-ui/react';
import { IoNotifications, IoDocumentText, IoImageOutline } from 'react-icons/io5';
import React, { useEffect, useState } from 'react';
import { Text } from "@chakra-ui/react";
import { useResetRecoilState } from 'recoil';
import { subjectState } from '@/atoms/subjectsAtom';
import TabItem from '../../Posts/TabItem';
import { Post } from '@/atoms/postsAtom';
import { Notification } from '@/atoms/notificationsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import usePosts from '@/hooks/usePosts';
import { auth, firestore } from '@/firebase/clientApp';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

type NotificationsProps = {
    post?: Post[];
    notifications?: Notification[];
};

const formTabs: TabItem[] = [
    {
        title: 'User Notifications',
        icon: IoDocumentText
    },
    {
        title: 'User Posts',
        icon: IoImageOutline
    },
]

export type TabItem = {
    title: string;
    icon: typeof Icon.arguments
}

const Notification:React.FC<NotificationsProps> = () => {
    const resetSubjectState = useResetRecoilState(subjectState)
    const [selectedTab, setSelectedTab] = useState(formTabs[0].title)
    const [users] = useAuthState(auth);
    const [postStateValue, setPostStateValue] = useState<Post[]>([]);
    //const { postStateValue, setPostStateValue, onVote, onDeletePost, onSelectPost } = usePosts(subjectData!);
    //const [notificationsValue, setNotificationsValue] = useState([]);
    const [notificationsValue, setNotificationsValue] = useState<Notification[]>([]);
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
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPostStateValue(posts as Post[]);
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
            setNotificationsValue(notifications as Notification[]);
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
    }, [])
    return (
        <Menu>
            <MenuButton cursor="pointer" padding="0px 6px" borderRadius={4} _hover={{ outline: "1px solid", outlineColor: "gray.200" }}>
                <Flex align="center">
                <Icon as={IoNotifications} style={{fontSize:"20px"}}/>  
                </Flex>
            </MenuButton>
            <MenuList className='notification_popup_section'>
                <Flex direction="column" bg="white" borderRadius={4} mt={2} width="100%" className='notification_popup_subsection'>
                    <Flex>
                        {formTabs.map((item, index) => (
                            <TabItem
                                key={item.title}
                                item={item}
                                selected={item.title === selectedTab}
                                setSelectedTab={setSelectedTab}
                            />
                        ))}
                    </Flex>
                    <Flex p={4} >
                        {selectedTab === "User Notifications" && (
//                        <List spacing={3} className='notifications_item_lists'>
//                                 {notificationsValue.slice(0, 10).map((item: any, index:any) =>
//                                     <ListItem className='notification_item' key={index}>
// {/*                                         <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/subject/${item.subjectId}/answers/${item.id}`}> */}
// {/*                                             {item.notification} */}
//  <Text>
//                 {item.notification.length > 70 ? `${item.notification.substring(0, 70)}...` : item.notification}
//             </Text>
// {/*                                             <Text dangerouslySetInnerHTML={{ __html: item.notification.length > 53 ? item.notification.substring(0, 53).concat('...') : item.notification }} /> */}
// {/*                                         </Link> */}
//                                     </ListItem>
//                                 )}
//                             </List>

            <List spacing={3} className='notifications_item_lists'>
    {notificationsValue.slice(0, 10).map((item: any, index: any) =>
        <ListItem className='notification_item' key={index}>
            <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/subject/${item.subjectId}/answers/${item.id}`}>
                <Text>
                    {item.notification.length > 70 ? `${item.notification.substring(0, 70 - 3 - item.subjectId.toString().length - item.id.toString().length)}...` : item.notification}
                </Text>
            </Link>
        </ListItem>
    )}
</List>

            
                        )}
                        {selectedTab === "User Posts" && (
                            <List spacing={3} className='notification_user_posts'>
                                {postStateValue.slice(0, 10).map((item: any, index:any) => {
                                    return(<ListItem className='notification_user_posts_item' key={index}>
                                        <Link href={`/subject/${item.subjectId}/answers/${item.id}`}>
                                            {item.title.length > 53 ? item.title.substring(0, 53).concat('...') : item.title}
                                        </Link>
                                    </ListItem>)
                                })}
                            </List>
                        )}
                    </Flex>
                </Flex>
            </MenuList>             
        </Menu>
    )
}
export default Notification;
