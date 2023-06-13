import { SearchIcon } from '@chakra-ui/icons';
import { Flex, Input, InputGroup, InputRightElement, Image, Link } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import React from 'react';

type SearchinputProps = {
   user?: User | null;
};

const Searchinput:React.FC<SearchinputProps> = ({ user }) => {
    
    return (
        <Flex flexGrow={1} maxWidth={user ? "auto" : "auto"} mr={3}  ml={1} direction="row" justifyContent="right">
            {/* <InputGroup> */}
                {/* <Input placeholder='Search GR8ER' 
                fontSize='10pt' 
                _placeholder={{color:"gray.500"}}
                _hover={{
                    bg:"white",
                    border:"1px solid",
                    borderColor: "blue.500",
                }}
                _focus={{
                    outline:"none",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                    height= "36px"
                    bg= "gray.100"
                    borderRadius="50px"
                    />
                    <InputRightElement
                 pointerEvents='none'
                 children={<SearchIcon color='gray.300' mb="5px"/>}
                /> */}
            {/* </InputGroup> */}

            
                
            <Image src="/images/finalcontent.png" height="41px" mb="2px" mr="2px"   />
            <Flex alignItems="center" cursor="pointer" justifyContent="right">
            
            <Link href="https://www.youtube.com/@GR8ERIB/channels" rel="noopener noreferrer" target="_blank">
        <a>
        <Image src="/images/youtubeblack.png" height="29px" mb="1px"   />
        
        </a>
      </Link>

      <Link href="https://www.instagram.com/gr8er_" rel="noopener noreferrer" target="_blank" ml={1}>
        <a>
        <Image src="/images/instagramblack.png" height="29px" mb="1px"   />
        
        </a>
      </Link>
           
            
        </Flex>
            
        </Flex>
    )
}
export default Searchinput;