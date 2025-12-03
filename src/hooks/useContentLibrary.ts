import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '../firebase/clientApp';

export type ContentItem = {
    id: string;
    title: string;
    url: string;
    type: string;
    createdAt: any;
};

const useContentLibrary = () => {
    const [contentItems, setContentItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getContentItems = async () => {
        setLoading(true);
        try {
            const contentQuery = query(
                collection(firestore, 'content_library'),
                orderBy('createdAt', 'desc')
            );
            const contentDocs = await getDocs(contentQuery);
            const items = contentDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setContentItems(items as ContentItem[]);
        } catch (error: any) {
            console.error('getContentItems error', error);
            setError(error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        getContentItems();
    }, []);

    return { contentItems, loading, error, refreshContent: getContentItems };
};

export default useContentLibrary;
