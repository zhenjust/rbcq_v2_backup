export interface CurrentUser {
    principal: {
        username: string,
        superUserName: string,
        privileges: string[],
        email: string,
        dn?: string,
        roles: string[],
        department?: string;
    }
    user?: {
        name: string;
    }
}
