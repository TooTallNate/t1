import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { Flex, Spacer, useColorMode, IconButton } from '@chakra-ui/react';

export default function Header() {
	const { colorMode, toggleColorMode } = useColorMode();
	return (
		<Flex>
			<Spacer />
			<IconButton
				aria-label="Toggle Theme"
				onClick={toggleColorMode}
				icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
			/>
		</Flex>
	);
}
