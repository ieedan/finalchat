export async function load(event) {
    return {
        accessToken: event.locals.auth.accessToken,
        user: event.locals.auth.user
    }
}
