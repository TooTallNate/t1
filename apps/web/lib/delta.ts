export const getDelta = (delta: number) => {
	if (delta === 0) {
		return "±0";
	}
	if (delta > 0) {
		return `+${delta}`;
	}
	return `${delta}`;
};
