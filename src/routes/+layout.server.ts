export async function load(event) {
	const fontPreset = event.cookies.get('theme-font-preset') ?? null;

	return {
		accessToken: event.locals.auth.accessToken,
		user: event.locals.auth.user,
		fontPreset
	};
}
