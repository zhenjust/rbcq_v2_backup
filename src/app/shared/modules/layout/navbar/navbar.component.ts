import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import navConfig from '@assets/navigation/navbar-menu.config.json';
import { AuthorizationService } from '@core/services/authorization.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faAddressBook, faAddressCard, faBell, faBinoculars, faBuilding, faBuildingUn, faCalendar, faChevronDown, faChevronRight, faCircleUser, faContactCard, faCopy, faFileArchive, faHandHoldingHand, faHome, faListCheck, faRoadCircleCheck, faTachometer, faTachometerAlt, faTachometerAverage, faUpload, faUserLarge } from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../../../../environments/environment';
import { externalRoutes, NEW_ROUTES } from '@shared/constants';
import { PHASE_ONE_AUTHORITIES, PHASE_TWO_AUTHORITIES } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { CurrentUser, navItems } from '@shared/interfaces';
import { AdminService } from '@shared/services/api';
import { isAuthorizedAny } from '@shared/validators';
import { ToastrService } from 'ngx-toastr';

type SidebarPlatform = 'react' | 'angular1' | 'angular2';

interface MenuTarget {
  kind: 'external' | 'internal' | 'externalRouteRef' | 'internalRouteRef';
  href?: string;
  to?: string;
  ref?: string;
}

interface MenuConditions {
  always?: boolean;
  permissionAny?: string[];
  predicate?: string;
  args?: Record<string, unknown>;
  expression?: MenuExpressionNode;
}

interface MenuExpressionNode {
  all?: MenuExpressionNode[];
  any?: MenuExpressionNode[];
  not?: MenuExpressionNode;
  predicate?: string;
  args?: Record<string, unknown>;
  permissionAny?: string[];
  always?: boolean;
}

interface MenuConfigItem {
  id: string;
  label?: string;
  labelRef?: string;
  iconKey?: string;
  targets?: Partial<Record<SidebarPlatform, MenuTarget>>;
  conditions?: MenuConditions;
  children?: MenuConfigItem[];
}

interface NavbarMenuConfig {
  version: number;
  items: MenuConfigItem[];
}

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Input() isCollapsed: boolean = true;
  @Input() isHovered: boolean = false;
  @Output() navbarToggle: EventEmitter<void> = new EventEmitter<void>();

  // Icons
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;

  navItems!: navItems[];
  openDropdowns: Record<string, boolean | Record<string, boolean>> = {};

  isLoading = signal(true);
  userData = signal<CurrentUser | null>(null);

  private r = inject(Router);
  private authorizationService = inject(AuthorizationService);
  private toast = inject(ToastrService);
  private as = inject(AdminService);
  regCategory: string;
  private navbarInfo: Record<string, unknown> | null = null;
  private readonly menuConfig = navConfig as NavbarMenuConfig;
  private readonly iconMap: Record<string, IconDefinition> = {
    faBell,
    faHome,
    faAddressCard,
    faBuilding,
    faCopy,
    faUserLarge,
    faCircleUser,
    faCalendar,
    faFileArchive,
    faAddressBook,
    faBuildingUn,
    faTachometer,
    faTachometerAlt,
    faBinoculars,
    faContactCard,
    faHandHoldingHand,
    faTachometerAverage,
    faListCheck,
    faRoadCircleCheck,
    faUpload
  };
  private readonly routeRefContext = {
    externalRoutes,
    NEW_ROUTES,
    LABELS,
    PHASE_ONE_AUTHORITIES,
    PHASE_TWO_AUTHORITIES
  };
  private readonly topLevelMenuOrder: string[] = [
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
  private readonly topLevelMenuOrderIndex = new Map<string, number>(
    this.topLevelMenuOrder.map((id, index) => [id, index])
  );

  constructor() { }

  ngOnInit(): void {
    if (!this.authorizationService.currentUser()) {
      this.authorizationService.loadUser().subscribe({
        error: (err) => this.toast.error(err.message),
        complete: () => {
          this.isLoading.set(false)
          this.userData.set(this.authorizationService.currentUser())
          this.getMenuItems();
          this.getNavbarInfo();
        }
      });
    } else {
      this.userData.set(this.authorizationService.currentUser())
      this.getMenuItems();
      this.getNavbarInfo();
      this.isLoading.set(false);
    }
  }

  private getMenuItems(): void {
    this.navItems = [...this.menuConfig.items]
      .sort((a, b) => this.getTopLevelSortIndex(a.id) - this.getTopLevelSortIndex(b.id))
      .map((item) => this.mapMenuConfigToNavItem(item, 'angular2'))
      .filter((item): item is navItems => !!item);
  }

  private getTopLevelSortIndex(id: string): number {
    const knownIndex = this.topLevelMenuOrderIndex.get(id);
    return knownIndex !== undefined ? knownIndex : Number.MAX_SAFE_INTEGER;
  }

  toggleCollapse(): void {
    this.navbarToggle.emit();
  }

  getNavbarInfo(): void {
    this.as.getNavbarInfo()
      .subscribe({
        next: (res) => {
          if (res) {
            this.navbarInfo = res as Record<string, unknown>;
            this.regCategory = res.registrationCategory;
          }
          this.getMenuItems();
        },
        error: () => {
          this.getMenuItems();
        }
      });
  }

  get shouldShowText(): boolean {
    return !this.isCollapsed || this.isHovered;
  }

  navigateTo(item: navItems): void {
    console.log(item)
    if (item.externalLink && item.externalLink.trim() !== '') {
      window.location.href = item.externalLink;
    } else if (item.path && item.path.trim() !== '') {
      this.r.navigate([item.path]);
    }
      // const cleanPath = item.path.replace(/^\/+/, '');
      // const segments = cleanPath.split('/');
      // console.log()
      // this.r.navigate(segments, { relativeTo: this.r.routerState.root });    }
  }

  toggleDropdown(item: navItems, isOpen: boolean): void {
    this.openDropdowns[item.title] = isOpen;
  }

  isDropdownOpen(item: navItems): boolean {
    return this.openDropdowns[item.title] as boolean || false;
  }

  toggleChildDropdown(parent: navItems, child: navItems, isOpen: boolean): void {
    if (!this.openDropdowns[parent.title] || typeof this.openDropdowns[parent.title] !== 'object') {
      this.openDropdowns[parent.title] = {};
    }
    (this.openDropdowns[parent.title] as Record<string, boolean>)[child.title] = isOpen;
  }

  isChildDropdownOpen(parent: navItems, child: navItems): boolean {
    return (this.openDropdowns[parent.title] as Record<string, boolean>)?.[child.title] || false;
  }

  hasPermission(item: navItems): boolean {
    const user = this.userData();
    if (!item.permission || item.permission.length === 0) {
      return true;
    }

    if (!user || !user.principal.privileges) {
      return false;
    }

    return isAuthorizedAny(user.principal.privileges, item.permission);
  }

  private mapMenuConfigToNavItem(item: MenuConfigItem, platform: SidebarPlatform): navItems | null {
    const show = this.isConfigItemVisible(item);
    if (!show) {
      return null;
    }

    const mappedItem = new navItems();
    mappedItem.title = this.resolveLabel(item);
    mappedItem.show = true;
    mappedItem.icon = this.resolveIcon(item.iconKey);

    const permissionAny = this.extractConditionPermissions(item.conditions);
    mappedItem.permission = permissionAny;

    const target = this.resolveTarget(item, platform);
    if (target?.kind === 'external' && target.href) {
      mappedItem.externalLink = target.href;
    }
    if (target?.kind === 'internal' && target.to) {
      mappedItem.path = target.to;
    }

    if (item.children?.length) {
      const children = item.children
        .map((child) => this.mapMenuConfigToNavItem(child, platform))
        .filter((child): child is navItems => !!child);
      if (!children.length) {
        return null;
      }
      mappedItem.children = children;
    }

    const hasNavigationTarget = !!mappedItem.externalLink || !!mappedItem.path;
    const hasChildren = !!mappedItem.children?.length;
    if (!hasNavigationTarget && !hasChildren) {
      return null;
    }

    return mappedItem;
  }

  private resolveLabel(item: MenuConfigItem): string {
    if (item.label) {
      return item.label;
    }

    const labelRef = item.labelRef ?? '';
    if (!labelRef) {
      return item.id;
    }

    if (labelRef.startsWith('LABELS.')) {
      const key = labelRef.replace('LABELS.', '');
      return (LABELS as Record<string, string>)[key] ?? labelRef;
    }

    return labelRef;
  }

  private resolveIcon(iconKey?: string): IconDefinition | undefined {
    if (!iconKey) {
      return undefined;
    }
    return this.iconMap[iconKey];
  }

  private resolveTarget(item: MenuConfigItem, platform: SidebarPlatform): MenuTarget | null {
    const target = item.targets?.[platform] ?? item.targets?.angular2 ?? null;
    if (!target) {
      return null;
    }

    if (target.kind === 'externalRouteRef' && target.ref) {
      return {
        kind: 'external',
        href: this.resolveRefPath('externalRoutes', target.ref)
      };
    }

    if (target.kind === 'internalRouteRef' && target.ref) {
      return {
        kind: 'internal',
        to: this.resolveRefPath('NEW_ROUTES', target.ref)
      };
    }

    if (target.kind === 'external' && target.href) {
      return {
        ...target,
        href: this.resolveRuntimeUrl(target.href)
      };
    }

    if (target.kind === 'internal' && target.to) {
      return {
        ...target,
        to: this.resolveRuntimeUrl(target.to)
      };
    }

    return target;
  }

  private resolveRuntimeUrl(value: string): string {
    const participantId = this.getNavbarField(['participantId', 'id']);
    const participantIdToken = participantId !== null && participantId !== undefined
      ? String(participantId)
      : '0';

    return value
      .replace('{PHASE_ONE_URL}', environment.__PHASE_ONE_URL__ || '')
      .replace('{PHASE_TWO_URL}', environment.__PHASE_TWO_URL__ || '')
      .replace('{PARTICIPANT_ID}', participantIdToken);
  }

  private getNavbarField(candidates: string[]): unknown {
    if (!this.navbarInfo) {
      return undefined;
    }

    for (const key of candidates) {
      if (this.navbarInfo[key] !== undefined && this.navbarInfo[key] !== null) {
        return this.navbarInfo[key];
      }
    }

    return undefined;
  }

  private resolveRefPath(rootKey: 'externalRoutes' | 'NEW_ROUTES', ref: string): string {
    const root = this.routeRefContext[rootKey] as Record<string, unknown>;
    const value = ref.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, root);

    return typeof value === 'string' ? value : '';
  }

  private isConfigItemVisible(item: MenuConfigItem): boolean {
    const conditions = item.conditions;
    if (!conditions || conditions.always) {
      return true;
    }

    if (conditions.permissionAny?.length && !this.hasAnyPermissionRefs(conditions.permissionAny)) {
      return false;
    }

    if (conditions.predicate && !this.evaluatePredicate(conditions.predicate, conditions.args)) {
      return false;
    }

    if (conditions.expression) {
      return this.evaluateExpression(conditions.expression);
    }

    return true;
  }

  private evaluateExpression(node?: MenuExpressionNode): boolean {
    if (!node) {
      return true;
    }

    if (node.all?.length) {
      return node.all.every((child) => this.evaluateExpression(child));
    }

    if (node.any?.length) {
      return node.any.some((child) => this.evaluateExpression(child));
    }

    if (node.not) {
      return !this.evaluateExpression(node.not);
    }

    if (node.permissionAny?.length) {
      return this.hasAnyPermissionRefs(node.permissionAny);
    }

    if (node.predicate) {
      return this.evaluatePredicate(node.predicate, node.args);
    }

    if (node.always) {
      return true;
    }

    return false;
  }

  private evaluatePredicate(predicate: string, args?: Record<string, unknown>): boolean {
    const value = typeof args?.['value'] === 'string' ? (args['value'] as string) : '';
    const user = this.userData();
    const userFlags = user as CurrentUser & { nonPemcUser?: boolean; internalUser?: boolean };

    switch (predicate) {
      case 'departmentNot':
        return user?.principal.department !== value;
      case 'registrationCategoryIs':
        return this.regCategory === value;
      case 'nonPemcUser':
        if (typeof userFlags?.nonPemcUser === 'boolean') {
          return userFlags.nonPemcUser;
        }
        return !!this.regCategory;
      case 'internalUser':
        if (typeof userFlags?.internalUser === 'boolean') {
          return userFlags.internalUser;
        }
        return !this.regCategory;
      case 'billingIdPresent': {
        const principal = user?.principal as Record<string, unknown> | undefined;
        const fromNavbarInfo = this.navbarInfo?.['billingId'] ?? this.navbarInfo?.['billingID'];
        const fromPrincipal = principal?.['billingId'] ?? principal?.['billingID'];
        const billingId = fromNavbarInfo ?? fromPrincipal;

        // Preserve existing behavior when billingId is not provided by backend payloads.
        if (billingId === null || billingId === undefined) {
          return true;
        }

        if (typeof billingId === 'string') {
          return billingId.trim().length > 0;
        }

        return !!billingId;
      }
      case 'participantApproved': {
        const status = this.getNavbarField(['status', 'participantStatus']);
        const regCategory = this.regCategory;
        if (typeof status !== 'string') {
          return true;
        }

        return status.toUpperCase() === 'APPROVED' && regCategory !== 'RAG';
      }
      case 'membershipDirect': {
        const membershipType = this.getNavbarField(['membershipType']);
        if (typeof membershipType !== 'string') {
          return true;
        }

        return membershipType.toUpperCase() === 'DIRECT';
      }
      case 'participantSupplier': {
        const regCategory = this.regCategory;
        if (!regCategory) {
          return true;
        }

        return ['RES', 'LRES', 'SOLR', 'RESupplier'].includes(regCategory);
      }
      case 'dccIndirect': {
        const regCategory = this.regCategory;
        const membershipType = this.getNavbarField(['membershipType']);

        if (!regCategory || typeof membershipType !== 'string') {
          return false;
        }

        return regCategory === 'DCC' && membershipType.toUpperCase() === 'INDIRECT';
      }
      case 'counterpartyListVisible': {
        const regCategory = this.regCategory;
        const membershipType = this.getNavbarField(['membershipType']);
        const pendingDirectToIndirect = this.getNavbarField(['pendingDirectToIndirect']);

        if (!regCategory || typeof membershipType !== 'string') {
          return true;
        }

        const hiddenForDirect = ['DCC', 'EC', 'PBU', 'PDU'].includes(regCategory)
          && membershipType.toUpperCase() === 'DIRECT';

        if (!hiddenForDirect) {
          return true;
        }

        return pendingDirectToIndirect === true;
      }
      default:
        return false;
    }
  }

  private hasAnyPermissionRefs(permissionRefs: string[]): boolean {
    const permissions = permissionRefs
      .map((permissionRef) => this.resolvePermissionRef(permissionRef))
      .filter((permission): permission is string => !!permission);

    if (!permissions.length) {
      return true;
    }

    return this.hasPermission({ permission: permissions } as navItems);
  }

  private resolvePermissionRef(permissionRef: string): string | null {
    // Support universal config keys like VIEW_LIST_OF_REGISTRATION
    // while keeping backward compatibility with PHASE_* dotted references.
    if (!permissionRef.includes('.')) {
      const phaseOneValue = (PHASE_ONE_AUTHORITIES as Record<string, string>)[permissionRef];
      if (phaseOneValue) {
        return phaseOneValue;
      }

      const phaseTwoValue = (PHASE_TWO_AUTHORITIES as Record<string, string>)[permissionRef];
      if (phaseTwoValue) {
        return phaseTwoValue;
      }

      return permissionRef;
    }

    const [rootKey, ...rest] = permissionRef.split('.');
    if (!rootKey || !rest.length) {
      return null;
    }

    const root = (this.routeRefContext as Record<string, unknown>)[rootKey] as Record<string, unknown>;
    if (!root) {
      return null;
    }

    const value = rest.reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, root);

    return typeof value === 'string' ? value : null;
  }

  private extractConditionPermissions(conditions?: MenuConditions): string[] {
    if (!conditions) {
      return [];
    }

    const permissions = new Set<string>();
    const addPermissions = (refs?: string[]) => {
      (refs ?? []).forEach((ref) => {
        const resolved = this.resolvePermissionRef(ref);
        if (resolved) {
          permissions.add(resolved);
        }
      });
    };

    addPermissions(conditions.permissionAny);

    const walkExpr = (node?: MenuExpressionNode): void => {
      if (!node) {
        return;
      }
      addPermissions(node.permissionAny);
      node.all?.forEach((child) => walkExpr(child));
      node.any?.forEach((child) => walkExpr(child));
      if (node.not) {
        walkExpr(node.not);
      }
    };

    walkExpr(conditions.expression);

    return Array.from(permissions);
  }

}
