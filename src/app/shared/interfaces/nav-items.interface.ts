import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

export interface navItems {
    title: string,
    icon?: IconDefinition,
    path?: string,
    externalLink?: string,
    permission?: Permissions[],
    children?: childNavItems[]
}

export interface childNavItems {
    title: string,
    icon?: IconDefinition,
    path?: string,
    externalLink?: string,
    permission?: Permissions[],
    children?: childNavItems[]
}