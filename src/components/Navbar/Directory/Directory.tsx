import useDirectory from '@/hooks/useDirectory';
import { Flex, Icon, Menu, MenuButton, MenuList, Text, Image} from '@chakra-ui/react';
import React from 'react';
import { BsChevronDown } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import { TiHome } from  "react-icons/ti";
import Subjects from './Subjects';




const UserMenu:React.FC = () => {
    const { directoryState, toggleMenuOpen} = useDirectory()
    return (
        <Menu isOpen={directoryState.isOpen}>
             <MenuButton 
             cursor="pointer" 
             padding="0px 6px" 
             ml={1}
             mr={{base: 'none', md: 1 }}
             borderRadius={4} 
             justifyContent="center"
             _hover={{
                outline: "1px solid", 
                outlineColor: "gray.200" }}
                onClick={toggleMenuOpen}
                
                >
                    <Flex align="center" justify='space-between' width={{base: 'none', md: "290px" }}>
                        <Flex align="center">
                            {directoryState.selectedMenuItem.imageURL ? (
                                <Image src={directoryState.selectedMenuItem.imageURL} borderRadius="full" boxSize="24px" mr={2} />
                            ) : (
                            <Icon fontSize={24} as={directoryState.selectedMenuItem.icon} mr={1} ml={{base: 1, md: 'none' }} mb={0} />
                            )}
                    
                    <Text color="black" mr={3} mt={0} display={{ base: 'none', md: 'unset' }}> 
                            {directoryState.selectedMenuItem.displayText}
                         </Text>
                         </Flex>
                         <Icon fontSize={11} as={BsChevronDown} mt={0.5} color="brand.100"/>
                         
                    </Flex>
                         </MenuButton>
                         
  <MenuList>
    <Subjects />
    
  </MenuList>
</Menu>
    )
}
export default UserMenu;