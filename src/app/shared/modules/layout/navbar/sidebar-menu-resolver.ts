import { externalRoutes } from '@shared/constants';
import { navItems } from '@shared/interfaces';

export type SidebarPlatform = 'angular2' | 'react' | 'angular1';

interface SidebarTarget {
  kind: 'internal' | 'external';
  to?: string;
  href?: string;
}

interface SidebarConditions {
  always?: boolean;
}

interface SidebarConfigItem {
  id: string;
  title: string;
  iconKey?: string;
  permission?: string[];
  conditions?: SidebarConditions;
  targets?: Record<string, SidebarTarget>;
}

interface SidebarConfig {
  items: SidebarConfigItem[];
}

const PHASE_THREE_FALLBACK = '/crss';
const SIDEBAR_ORDER: string[] = [
  'notifications',
  'home',
  'view-metering-and-settlement-data',
  'calendar',
  'manage-bcqs',
  'view-submitted-meter-data',
  'manage-meter-trouble-reports',
  'manage-facility-applications',
  'manage-mirf',
  'view-mtns',
  'registration',
  'facility-management',
  'counterparties-and-contract-management',
  'manage-user-accounts',
  'prudential-requirements',
  'settlement',
  'metering',
  'activity-logs',
  'job-queue',
  'admin',
  'labels-mq-uploader'
];
const SIDEBAR_ORDER_INDEX = new Map<string, number>(
  SIDEBAR_ORDER.map((id, index) => [id, index])
);

function getSortIndex(id: string): number {
  const knownIndex = SIDEBAR_ORDER_INDEX.get(id);
  return knownIndex !== undefined ? knownIndex : Number.MAX_SAFE_INTEGER;
}

export function detectSidebarPlatform(): SidebarPlatform {
  if (typeof window === 'undefined') {
    return 'angular2';
  }

  const href = window.location.href || '';
  if (href.indexOf('/bsmd') >= 0) {
    return 'angular2';
  }
  if (href.indexOf('/crss') >= 0) {
    return 'react';
  }
  return 'angular2';
}

function fillHrefTemplate(hrefTemplate: string): string {
  const phaseThree = (window as any).__PHASE_THREE_URL__ || PHASE_THREE_FALLBACK;

  return hrefTemplate
    .replace('{phaseThree}', phaseThree)
    .replace('{external.NOTIFICATION}', externalRoutes.NOTIFICATION)
    .replace('{external.HOME}', externalRoutes.HOME);
}

export function resolveConfigItems(config: SidebarConfig, iconMap: Record<string, any>): navItems[] {
  const platform = detectSidebarPlatform();

  return [...(config.items || [])]
    .sort((a, b) => getSortIndex(a.id) - getSortIndex(b.id))
    .filter((item) => !item.conditions || item.conditions.always)
    .map((item) => {
      const target = item.targets?.[platform] || item.targets?.['angular2'];
      const built: navItems = {
        title: item.title,
        show: true,
        icon: item.iconKey ? iconMap[item.iconKey] : undefined,
        permission: item.permission || []
      };

      if (target?.kind === 'internal' && target.to) {
        built.path = target.to;
      }

      if (target?.kind === 'external' && target.href) {
        built.externalLink = fillHrefTemplate(target.href);
      }

      return built;
    });
}
