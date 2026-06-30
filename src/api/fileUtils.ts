/**
 * Converts a File to a base64 string safely, even for large files (e.g. phone photos).
 *
 * Using `String.fromCharCode(...new Uint8Array(buffer))` spreads every byte as a
 * separate argument, which overflows the call stack for files of a few MB and throws
 * `RangeError: Maximum call stack size exceeded`. Processing the bytes in fixed-size
 * chunks avoids that.
 */
export const fileToBase64 = async (file: File): Promise<string> => {
	const buffer = await file.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	const chunkSize = 0x8000; // 32 KB per chunk
	let binary = '';
	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, i + chunkSize);
		binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
	}
	return btoa(binary);
};
