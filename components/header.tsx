import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import {
	Flex,
	Spacer,
	useColorMode,
	IconButton,
	Heading,
} from '@chakra-ui/react';

export default function Header() {
	const { colorMode, toggleColorMode } = useColorMode();
	return (
		<Flex py={2} px={6}>
			<Heading>Nate's BGLs</Heading>
			<Spacer />
			<IconButton
				aria-label="Toggle Theme"
				onClick={toggleColorMode}
				title={`Toggle ${
					colorMode === 'light' ? 'Dark' : 'Light'
				} Mode`}
				icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
			/>
		</Flex>
	);
}
