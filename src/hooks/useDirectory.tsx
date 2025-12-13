import { defaultMenuItem, DirectoryMenuItem, DirectoryMenuState } from '@/atoms/directoryMenuAtom';
import { subjectState } from '@/atoms/subjectsAtom';
import { MenuItem } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { RiGroup2Fill } from 'react-icons/ri';
import { useRecoilState, useRecoilValue } from 'recoil';


const useDirectory = () => {
    const [directoryState, setDirectoryState] = useRecoilState(DirectoryMenuState)
    const router = useRouter()
    const subjectStateValue = useRecoilValue(subjectState)

    const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
        setDirectoryState(prev => ({
            ...prev,
            selectedMenuItem: menuItem
        }))
        router.push(menuItem.link);
        if (directoryState.isOpen) {
            toggleMenuOpen()
        }

    }

    const toggleMenuOpen = () => {
        setDirectoryState(prev => ({
            ...prev,
            isOpen: !directoryState.isOpen
        }))
    }

    useEffect(() => {
        const { currentSubject } = subjectStateValue;

        // Only show subject in directory if we are NOT on the landing page or a curriculum home page
        if (currentSubject && router.pathname !== '/' && router.pathname !== '/[curriculumId]') {
            setDirectoryState(prev => ({
                ...prev,
                selectedMenuItem: {
                    displayText: `${currentSubject.id}`,
                    link: `/submit/${currentSubject.id}`,
                    imageURL: currentSubject.imageURL,
                    icon: RiGroup2Fill,
                    iconColor: 'black'
                }
            }));
        } else {
            setDirectoryState(prev => ({
                ...prev,
                selectedMenuItem: defaultMenuItem
            }));
        }

    }, [subjectStateValue.currentSubject, router.pathname])


    return { directoryState, toggleMenuOpen, onSelectMenuItem }
}
export default useDirectory;