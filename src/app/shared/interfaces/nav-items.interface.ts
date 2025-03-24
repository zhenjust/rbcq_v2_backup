export interface navItems {
    title: string,
    icon?: string,
    path: string,
    permission?: Permissions,
    children?: navItems[]
}