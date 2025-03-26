import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { externalRoutes } from '@shared/constants';
import { navItems } from '@shared/interfaces';
import { faBell, faHome, faRegistered, faChevronDown, faChevronRight, faAddressCard, faBuilding, faCopy, faUserLarge, faCircleUser, faCalendar, faFileArchive, faAddressBook, faBuildingUn, faTachometer, faTachometerAlt, faBinoculars, faContactCard, faHandHoldingHand, faTachometerAverage, faListCheck, faLink, faRoadCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Input() isCollapsed: boolean = true;
  @Input() isHovered: boolean = false;
  @Output() toggle: EventEmitter<void> = new EventEmitter<void>();
  
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  navItems!: navItems[];
  openDropdowns: Record<string, boolean | Record<string, boolean>> = {};

  constructor(private r: Router) {}

  ngOnInit(): void {
    this.getMenuItems();
  }

  private getMenuItems(): void {
    this.navItems = [
      {
        title: 'Notifications',
        externalLink: externalRoutes.NOTIFICATION,
        icon: faBell,
        permission: []
      },
      {
        title: 'Home',
        externalLink: externalRoutes.HOME,
        icon: faHome,
        permission: []
      },
      //Registration External Routes
      {
        title: 'Registration',
        icon: faAddressCard,
        permission: [],
        children: [
          {
            title: 'Registration Transaction',
            permission: [],
            children: [
              //PEMC ROUTES
              {
                title: 'Manage Registration Transaction',
                externalLink: externalRoutes.REGISTRATION_PEMC.REGISRATION_TRANSACTIONS.MANAGE_REGISTRATION_TRANSACTION,
                permission: []
              },
              {
                title: 'Manage Sign-up Applications',
                externalLink: externalRoutes.REGISTRATION_PEMC.REGISRATION_TRANSACTIONS.MANAGE_SIGNUP_APPLICATION,
                permission: []
              },
              {
                title: 'Manage Business Organization',
                externalLink: externalRoutes.REGISTRATION_PEMC.REGISRATION_TRANSACTIONS.MANAGE_BUSINESS_ORGANIZATION,
                permission: []
              },
              {
                title: 'Create New Trading Participant',
                externalLink: externalRoutes.REGISTRATION_PEMC.REGISRATION_TRANSACTIONS.CREATE_NEW_TRADING_PARTICIPANTS,
                permission: []
              }
            ]
          },
          {
            title: 'Post Registration Transactions',
            permission: [],
            children: [
              {
                title: 'Manage Post Registration Transactions',
                externalLink: externalRoutes.REGISTRATION_PEMC.POST_REGISTRATION_TRANSACTIONS.MANAGE_POST_REGISTRATION_TRANSACTIONS,
                permission: []
              },
              {
                title: 'Advisory Publication',
                externalLink: externalRoutes.REGISTRATION_PEMC.POST_REGISTRATION_TRANSACTIONS.ADVISORY_PUBLICATION,
                permission: []
              }
            ]
          },
          {
            title: 'Document Management',
            permission: [],
            children: [
              {
                title: 'Manage Document Managent',
                externalLink: externalRoutes.REGISTRATION_PEMC.DOCUMENT_MANAGEMENT.MANAGE_REGISTRATION_DOCUMENTS,
                permission: []
              },
              {
                title: 'View Expiring Registration Documents',
                externalLink: externalRoutes.REGISTRATION_PEMC.DOCUMENT_MANAGEMENT.VIEW_EXPIRING_REGISTRATION_DOCUMENTS,
                permission: []
              },
              {
                title: 'View Expired Registration Documents',
                externalLink: externalRoutes.REGISTRATION_PEMC.DOCUMENT_MANAGEMENT.VIEW_EXPIRED_REGISTRATION_DOCUMENTS,
                permission: []
              }
            ]
          },
          {
            title: 'Reports',
            permission: [],
            children: [
              {
                title: 'WESM Registration Updates',
                externalLink: externalRoutes.REGISTRATION_PEMC.REPORTS.WESM_REGISTRATION_UPDATES,
                permission: []
              },
              {
                title: 'Retail Compliance Reports',
                externalLink: externalRoutes.REGISTRATION_PEMC.REPORTS.RETAIL_COMPLIANCE_REPORTS,
                permission: []
              }
            ]
          },
          {
            title: 'View Suspended Participants',
            externalLink: externalRoutes.REGISTRATION_PEMC.VIEW_SUSPENDED_PARTICIPANTS,
            permission: []
          },
          {
            title: 'Upload IPRs',
            externalLink: externalRoutes.REGISTRATION_PEMC.UPLOAD_IPRS,
            permission: []
          },
          // TP Routes
          {
            title: 'Manage Registration',
            externalLink: externalRoutes.REGISTRATION_TP.MANAGE_REGISTRATION,
            permission: []
          },
          {
            title: 'View GEOP End-Users',
            externalLink: externalRoutes.REGISTRATION_TP.VIEW_GEOP_END_USERS,
            permission: []
          },
          {
            title: 'Manage Facilities',
            permission: [],
            children: [
              {
                title: 'Available Facilities',
                externalLink: externalRoutes.REGISTRATION_TP.MANAGE_FACILITIES.AVAILABLE_FACILITIES,
                permission: []
              },
              {
                title: 'Facilities For Transfer',
                externalLink: externalRoutes.REGISTRATION_TP.MANAGE_FACILITIES.FACILITIES_FOR_TRANSFER,
                permission: []
              }
            ]
          },
          {
            title: 'View Expiring / Expired Documents',
            externalLink: externalRoutes.REGISTRATION_TP.VIEW_EXPIRING_EXPIRED_DOCUMENTS,
            permission:[]
          },
          // MSP Routes
          {
            title: 'Manage Registration',
            externalLink: externalRoutes.REGISTRATION_MSP.MANAGE_REGISTRATION,
            permission: []
          },
          {
            title: 'View Expiring / Expired Documents',
            externalLink: externalRoutes.REGISTRATION_MSP.VIEW_EXPIRING_EXPIRED_DOCUMENTS,
            permission: []
          }
        ]
      },
      //Manage Facility Application External Routes
      {
        title: 'Manage Facility Applications',
        icon: faBuilding,
        permission: [],
        children: [
          {
            title: 'View Facility Applications',
            externalLink: externalRoutes.MANAGE_FACILITY_APPLICATIONS,
            permission: []
          }
        ]
      },
      //MIRF External Routes
      {
        title: 'Manage MIRF',
        icon: faCopy,
        permission: [],
        children: [
          {
            title: 'Upload MIRF',
            externalLink: externalRoutes.MANAGE_MIRF.UPLOAD_MIRF,
            permission: []
          },
          {
            title: 'View MIRF Summary',
            externalLink: externalRoutes.MANAGE_MIRF.VIEW_MIRF_SUMMARY,
            permission: []
          },
          {
            title: 'MIRF Updates',
            externalLink: externalRoutes.MANAGE_MIRF.MIRF_UPDATES,
            permission: []
          }
        ]
      },
      //Admin External Routes
      {
        title: 'Admin',
        icon: faUserLarge,
        permission: [],
        children: [
          {
            title: 'MO User Management',
            permission: [],
            children: [
              {
                title: 'Manage Market Operator Users',
                externalLink: externalRoutes.ADMIN.MO_USER_MANAGEMENT.MANAGE_MARKET_OPERATOR_USERS,
                permission: []
              },
              {
                title: 'Manage User Roles',
                externalLink: externalRoutes.ADMIN.MO_USER_MANAGEMENT.MANAGE_USER_ROLES,
                permission: []
              },
              {
                title: 'View Privileges',
                externalLink: externalRoutes.ADMIN.MO_USER_MANAGEMENT.VIEW_PRIVILEGES,
                permission:[]
              }
            ]
          },
          {
            title: 'View Audit Logs',
            externalLink: externalRoutes.ADMIN.VIEW_AUDIT_LOGS,
            permission: []
          },
          {
            title: 'View XDF Audit Logs',
            externalLink: externalRoutes.ADMIN.VIEW_XDF_AUDIT_LOGS,
            permission: []
          },
          {
            title: 'System Configuration',
            externalLink: externalRoutes.ADMIN.SYSTEM_CONFIGURATION,
            permission: []
          },
          {
            title: 'Manage Scheduled Jobs',
            externalLink: externalRoutes.ADMIN.MANAGE_SCHEDULED_JOBS,
            permission: []
          },
          {
            title: 'Data Interface Management',
            permission: [],
            children: [
              {
                title: 'Manage Trading Operations Data Interface',
                externalLink: externalRoutes.ADMIN.DATA_INTERFACE_MANAGEMENT.MANAGE_TRADING_OPERATIONS_DATA_INTERFACES,
                permission: []
              },
              {
                title: 'Import Trading Operations Data',
                externalLink: externalRoutes.ADMIN.DATA_INTERFACE_MANAGEMENT.IMPORT_TRADING_OPERATIONS_DATA,
                permission: []
              }
            ]
          },
          {
            title: 'Manage Market Products',
            externalLink: externalRoutes.ADMIN.MANAGE_MARKET_PRODUCTS,
            permission: []
          },
          {
            title: 'Manage Sub Market Products',
            externalLink: externalRoutes.ADMIN.MANAGE_SUB_MARKET_PRODUCTS,
            permission: []
          },
          {
            title: 'Manage Field Settings',
            externalLink: externalRoutes.ADMIN.MANAGE_FIELD_SETTINGS,
            permission: []
          }
        ]
      },
      //User Account Route
      {
        title: 'User Accounts',
        icon: faCircleUser,
        permission: [],
        externalLink: externalRoutes.USER_ACCOUNTS_FOR_TP
      },
      //Calendar route
      {
        title: 'Calendar',
        icon: faCalendar,
        permission: [],
        externalLink: externalRoutes.CALENDAR
      },
      {
        title: 'View Metering and Settlement Data',
        icon: faFileArchive,
        permission: [],
        externalLink: externalRoutes.FILE_SUMMARY_FOR_TP
      },
      //MTN link route
      {
        title: 'View MTNs',
        icon: faCopy,
        permission: [],
        externalLink: externalRoutes.MTN_LINK_FOR_MSP
      },
      //Prudential requirements for tp routes
      {
        title: 'Prudential Requirements',
        icon: faAddressBook,
        permission: [],
        children: [
          //TP ROUTES
          {
            title: 'View Margin Call Reports',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_TP.VIEW_MARGIN_CALL_REPORTS,
            permission: []
          },
          {
            title: 'Financial Information',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_TP.FINANCIAL_INFORMATION,
            permission: []
          },
          {
            title: 'View Drawdown Reports',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_TP.VIEW_DRAWDOWN_REPORTS,
            permission: []
          },
          //PEMC ROUTES
          {
            title: 'Security Deposit',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.SECURITY_DEPOSIT,
            permission: []
          },
          {
            title: 'Manage PR Exemptions',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_PR_EXEMPTIONS,
            permission: []
          },
          {
            title: 'Manage Holiday',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_HOLIDAY,
            permission: []
          },
          {
            title: 'Manage Contact List (For Financial Transactions)',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_CONTACT_LIST_FOR_FINANCIAL_TRANSACTIONS,
            permission: []
          },
          {
            title: 'Manage Outstanding Balance',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_OUTSTANDING_BALANCE,
            permission: []
          },
          {
            title: 'Maximum Exposure',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MAXIMUM_EXPOSURE,
            permission: []
          },
          {
            title: 'Manage Margin Calls',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_MARGIN_CALLS,
            permission: []
          },
          {
            title: 'Monitoring Reports',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MONITORING_REPORTS,
            permission: []
          },
          {
            title: 'Extract Historical WESM Bill Information',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.EXTRACT_HISTORICAL_WESM_BILL_INFORMATION,
            permission: []
          },
          {
            title: 'Manage Drawdown Summary',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_DRAWDOWN_SUMMARY,
            permission: []
          }
        ]
      },
      //Facility Managent Routes
      {
        title: 'Facility Management',
        icon: faBuildingUn,
        permission: [],
        children: [
          {
            title: 'Manage Market Trading Nodes',
            externalLink: externalRoutes.FACILITY_MANAGEMENT_PEMC_USER.MANAGE_MARKET_TRADING_NODES,
            permission: []
          },
          {
            title: 'Manage Facilities',
            externalLink: externalRoutes.FACILITY_MANAGEMENT_PEMC_USER.MANAGE_FACILITIES,
            permission: []
          },
          {
            title: 'Facilities For Activatiton',
            externalLink: externalRoutes.FACILITY_MANAGEMENT_PEMC_USER.FACILITIES_FOR_ACTIVATION,
            permission: []
          },
          {
            title: 'Facilities For Transfer',
            externalLink: externalRoutes.FACILITY_MANAGEMENT_PEMC_USER.FACILITIES_FOR_TRANSFER,
            permission: []
          },
          {
            title: 'MIRF',
            permission: [],
            children: [
              {
                title: 'View Facility Application',
                externalLink: externalRoutes.FACILITY_MANAGEMENT_PEMC_USER.MIRF.VIEW_FACILITY_APPLICATIONS,
                permission: []
              }
            ]
          }
        ]
      },
      //MQ Menu Route
      {
        title: 'View Submitted Meter Data',
        icon: faTachometer,
        externalLink: externalRoutes.MQ_MENU_FOR_MSP.VIEW_SUBMITTED_METER_DATA,
        permission: []
      },
      //MTE Menu Route
      {
        title: 'Manage Meter Trouble Reports',
        icon: faTachometerAlt,
        externalLink: externalRoutes.MTR_MENU_FOR_MSP.MANAGE_METER_TROUBLE_REPORTS
      },
      //BCQ Menu Routes
      {
        title: 'Manage BCQs',
        icon: faBinoculars,
        permission: [],
        children: [
          {
            title: 'Submit BCQs (as Seller)',
            externalLink: externalRoutes.BCQ_MENU_FOR_TP.SUBMIT_BCQ_AS_SELLER,
            permission: []
          },
          {
            title: 'Confirm (as Buyer) / View BCQs',
            externalLink: externalRoutes.BCQ_MENU_FOR_TP.CONFIRM_AS_BUYER_VIEW_BCQ,
            permission: []
          },
          {
            title: 'BCQ Download Template',
            externalLink: externalRoutes.BCQ_MENU_FOR_TP.BCQ_DOWNLOAD_TEMPLATE,
            permission: []
          }
        ]
      },
      //Contract Management Routes
      {
        title: 'Counterparties and Contract Management',
        icon: faContactCard,
        permission: [],
        children: [
          //PEMC ROUTES
          {
            title: 'Manage TP Counterparties',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_PEMC_USERS.MANAGE_TP_COUNTERPARTIES,
            permission: []
          },
          {
            title: 'Manage Supply Contracts',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_PEMC_USERS.MANAGE_SUPPLY_CONTRACTS,
            permission: []
          },
          {
            title: 'Manage Customer Switch Request',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_PEMC_USERS.MANAGE_CUSTOMER_SWITCH_REQUESTS,
            permission: []
          },
          {
            title: 'Manage SOLR Events',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_PEMC_USERS.MANAGE_SOLR_EVENTS,
            permission: []
          },
          //TP ROUTES
          {
            title: 'Manage Contestable Management',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_TP.MANAGE_CONTESTABLE_CUSTOMER,
            permission: []
          },
          {
            title: 'Manage Indirect Member Counterparties',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_TP.MANAGE_INDIRECT_MEMBER_COUNTERPARTIES,
            permission: []
          },
          {
            title: 'Manage Supply Contracts',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_TP.MANAGE_SUPPLY_CONTRACTS,
            permission: []
          },
          {
            title: 'Manage Customer Switch Request',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_TP.MANAGE_CUSTOMER_SWITCH_REQUEST,
            permission: []
          },
          {
            title: 'SOLR Event Request',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_TP.SOLR_EVENT_REQUEST,
            permission: []
          }
        ]
      },
      //Settlement routes
      {
        title: 'Settlement',
        icon: faHandHoldingHand,
        permission: [],
        children: [
          //PEMC ROUTES
          {
            title: 'Manage BCQs',
            permission: [],
            children: [
              {
                title: 'Override BCQ',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MANAGE_BCQ.OVERRIDE_BCQ,
                permission: []
              },
              {
                title: 'View BCQs',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MANAGE_BCQ.VIEW_BCQ,
                permission: []
              },
              {
                title: 'Special Events',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MANAGE_BCQ.SPECIAL_EVENTS,
                permission: []
              },
              {
                title: 'Manage Prohibited List',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MANAGE_BCQ.MANAGE_PROHIBITED_LIST,
                permission: []
              }
            ]
          },
          {
            title: 'Maintenance',
            permission: [],
            children: [
              {
                title: 'Manage Billing ID Masterlist',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_BILLING_ID_MASTERLIST,
                permission: []
              },
              {
                title: 'Manage Billing Period',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_BILLING_PERIOD,
                permission: []
              },
              {
                title: 'Manage Reserve Calculation Configuration',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_RESERVE_CALCULATION_CONFIGURATION,
                permission: []
              },
              {
                title: 'Manage Charge IDs',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_CHARGE_IDS,
                permission: []
              },
              {
                title: 'Manage Market Fee Calculation',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_MARKET_FEE_CALCULATION,
                permission: []
              },
              {
                title: 'Manage MRUs',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_MRU,
                permission: []
              },
              {
                title: 'Manage Output File Location',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_OUTPUT_FILE_LOCATION,
                permission: []
              },
              {
                title: 'Manage Password Prefix For Output Files',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_PASSWORD_PREFIX_FOR_OUTPUT_FILES,
                permission: []
              },
              {
                title: 'General Calculation Configuration',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.GENERAL_CALCULATION_CONFIGURATION,
                permission: []
              },
              {
                title: 'Manage Single Buyer',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_SINGLE_BUYER,
                permission: []
              }
            ]
          },
          {
            title: 'Calculate Settlement Amounts',
            permission: [],
            children: [
              {
                title: 'Calculate Energey Trading Amounts',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.CALCULATE_ENERGY_TRADING_AMOUNTS,
                permission: []
              },
              {
                title: 'Calculate Reserve Trading Amounts',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.CALCULATE_RESERVE_TRADING_AMOUNTS,
                permission: []
              },
              {
                title: 'Calculate Energy Market Fee',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.CALCULATE_ENERGY_MARKET_FEE,
                permission: []
              },
              {
                title: 'Calculate Reserve Market Fee',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.CALCULATE_RESERVE_MARKET_FEE,
                permission: []
              },
              {
                title: 'Manage Additional Compensation Claims',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.MANAGE_ADDITIONAL_COMPENSATION_CLAIMS,
                permission: []
              },
              {
                title: 'Update Additional Compensation Invoice',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.UPDATE_ADDITIONAL_COMPENSATION_INVOICE,
                permission: []
              }
            ]
          },
          {
            title: 'View Settlement Workspace',
            externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.VIEW_SETTLEMENT_WORKSPACE,
            permission: []
          },
          {
            title: 'Worklist',
            externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.WORKLIST,
            permission: []
          },
          {
            title: 'Upload Billing Statement',
            externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.UPLOAD_BILLING_STATEMENT,
            permission: []
          }
        ]
      },
      //METERING ROUTES
      {
        title: 'Metering',
        icon: faTachometerAverage,
        permission: [],
        children: [
          {
            title: 'Calculations',
            externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATIONS,
            permission: []
          },
          {
            title: 'Meter Streaming Statistics',
            externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.METER_STREAMING_STATISTICS,
            permission: []
          },
          {
            title: 'Calculation Maintenance and Configuration',
            permission: [],
            children: [
              {
                title: 'Import Metering Configuration',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.IMPORT_METERING_CONFIGURATION,
                permission: []
              },
              {
                title: 'Import Settlement Metering Point Configuration',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.IMPORT_SETTLEMENT_METERING_POINT_CONFIGURATION,
                permission: []
              },
              {
                title: 'Settlement SEIN Masterlist',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.SETTLEMENT_SEIN_MASTERLIST,
                permission: []
              },
              {
                title: 'Historical Factors Maintenance',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.HISTORICAL_FACTOR_MAINTENANCE,
                permission: []
              },
              {
                title: 'Virtual SEIN Mapping',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.VIRTUAL_SEIN_MAPPING,
                permission: []
              },
              {
                title: 'MTN Model Configuration',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.MTN_MODEL_CONFIGURATION,
                permission: []
              },
              {
                title: 'MTN Group and Schedule',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.MTN_GROUP_AND_SCHEDULE,
                permission: []
              },
              {
                title: 'RCOA Channel Configuration',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.RCOA_CHANNEL_CONFIGURATION,
                permission: []
              },
              {
                title: 'File Location',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.FILE_LOCATION,
                permission: []
              },
              {
                title: 'Manage Virtual Metering Point',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.MANAGE_VIRTUAL_METERING_POINT,
                permission: []
              },
              {
                title: 'Meter Registry Maintenance',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.METER_REGISTRY_MAINTENANCE,
                permission: []
              }
            ]
          },
          {
            title: 'Manage MTR',
            externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.MANAGE_MTR,
            permission: []
          },
          {
            title: 'Worklist',
            externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.WORKLIST,
            permission: []
          },
          {
            title: 'Data Analysis and Validation',
            permission: [],
            children: [
              {
                title: 'View Submitted Meter Data',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.DATA_ANALYSIS_AND_VALIDATION.VIEW_SUBMITTED_METER_DATA,
                permission: []
              },
              {
                title: 'RTU Comparison',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.DATA_ANALYSIS_AND_VALIDATION.RTU_COMPARISON,
                permission: []
              }
            ]
          }
        ]
      },
      //Activity log route
      {
        title: 'Activity Logs',
        icon: faListCheck,
        permission: [],
        externalLink: externalRoutes.ACTIVITY_LOGS
      },
      //Job Queue route
      {
        title: 'Job Queue',
        icon: faRoadCircleCheck,
        permission: [],
        externalLink: externalRoutes.JOB_QUEUE
      }
    ];
  }
  
  toggleCollapse(): void {
    this.toggle.emit();
  }

  shouldShowText(): boolean {
    return !this.isCollapsed || this.isHovered;
  }

  navigateTo(item: navItems): void {
    if (item.externalLink) {
      window.location.href = item.externalLink;
    } else if (item.path) {
      this.r.navigate([item.path]);
    }
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
    return true;
  }
}
