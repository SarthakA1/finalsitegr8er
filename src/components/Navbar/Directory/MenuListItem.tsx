import useDirectory from '@/hooks/useDirectory';
import { Flex, MenuItem, Image, Icon } from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons';

type MenuListItemProps = {
    displayText: string;
    link: string;
    icon: IconType;
    iconColor?: string;
    imageURL?: string;
    bgGradient?: string;
    color?: string;
};

const MenuListItem: React.FC<MenuListItemProps> = ({ displayText, link, icon, iconColor, imageURL, bgGradient, color }) => {
    const { onSelectMenuItem } = useDirectory();

    return (
        <MenuItem width="100%" fontSize="10pt"
            _hover={{ bg: "gray.100" }} onClick={() => onSelectMenuItem({ displayText, link, icon, iconColor, imageURL, bgGradient, color })}>
            <Flex align="center">
                {bgGradient ? (
                    <Flex
                        align="center"
                        justify="center"
                        boxSize="18px"
                        borderRadius="4px" // Slightly rounded for mini icon
                        bgGradient={bgGradient}
                        color={color || "white"}
                        mr={2}
                        shadow="sm"
                    >
                        <Icon as={icon} fontSize="12px" />
                    </Flex>
                ) : imageURL ? (
                    <Image src={imageURL} borderRadius='full' boxSize="18px" mr={2} />
                ) : (
                    <Icon as={icon} fontSize={20} mr={2} color={iconColor} />
                )}
                {displayText}
            </Flex>
        </MenuItem>
    )
}
export default MenuListItem;