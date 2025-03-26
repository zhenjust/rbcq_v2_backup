export function isAuthorized(privileges: string[], authority: string): boolean {
    return privileges.includes(authority);
}

export function isAuthorizedAny(privileges: string[], authorities: string[]): boolean {
    return authorities.some((auth) => isAuthorized(privileges, auth));
}