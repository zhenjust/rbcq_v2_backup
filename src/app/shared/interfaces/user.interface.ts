export interface CurrentUser {
    principal: {
        username: string,
        superUsername: string,
        privileges: string[],
        email: string,
        roles: string[]
    }
}
