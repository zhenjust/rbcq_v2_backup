export interface CurrentUser {
    principal: {
        username: string,
        superUserName: string,
        privileges: string[],
        email: string,
        roles: string[]
    }
}
