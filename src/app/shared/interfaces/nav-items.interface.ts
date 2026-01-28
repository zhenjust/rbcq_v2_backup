import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

export class navItems {
    title: string;
    icon?: IconDefinition;
    path?: string;
    externalLink?: string;
    permission?: string[];
    children?: childNavItems[];
    show? = true;
}

export class childNavItems {
    title: string;
    icon?: IconDefinition;
    path?: string;
    externalLink?: string;
    permission?: string[];
    children?: childNavItems[];
    show? = true;
}