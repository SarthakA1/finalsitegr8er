import React from 'react';
import { Flex, Image } from '@chakra-ui/react';
import Searchinput from './Searchinput';
import RightContent from './RightContent/RightContent';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';
import Directory from './Directory/Directory';
import useDirectory from '@/hooks/useDirectory';
import { defaultMenuItem } from '@/atoms/directoryMenuAtom';


const navbar:React.FC = () => {
    const [user, loading, error] = useAuthState(auth);
    const {onSelectMenuItem}  = useDirectory()

    return (
    <Flex bg='white' height='50px' padding='6px 10px' direction="row">
        <Flex align="center" cursor="pointer" onClick={() => onSelectMenuItem(defaultMenuItem)} >
        <Image src="/images/gr8er.png" ml={.3} height="45px" display={{ base: 'unset', md: 'none' }}/>
            <Image src="/images/gr8er logo.png" height="44px" mb="1px" display={{ base: 'none', md: 'unset' }}/>
        </Flex>
        
        {user && <Directory/ >}
        <Searchinput/>
       

        
        <Flex >
         <RightContent user={user} />
         </Flex>
         
    </Flex>
    )
};
export default navbar;