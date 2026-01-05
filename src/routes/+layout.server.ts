export async function load(event) {
	const fontSans = event.cookies.get('theme-sans-font') ?? null;
	const fontMono = event.cookies.get('theme-mono-font') ?? null;

	return {
		accessToken: event.locals.auth.accessToken,
		user: event.locals.auth.user,
		fontSans,
		fontMono
	};
}
