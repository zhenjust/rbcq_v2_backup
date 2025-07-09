import { Component, effect, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { externalRoutes, NEW_ROUTES } from '@shared/constants';
import { CurrentUser, navItems } from '@shared/interfaces';
import { faBell, faHome, faChevronDown, faChevronRight, faAddressCard, faBuilding, faCopy, faUserLarge, faCircleUser, faCalendar, faFileArchive, faAddressBook, faBuildingUn, faTachometer, faTachometerAlt, faBinoculars, faContactCard, faHandHoldingHand, faTachometerAverage, faListCheck, faRoadCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { PHASE_ONE_AUTHORITIES, PHASE_TWO_AUTHORITIES } from '@shared/constants';
import { isAuthorizedAny } from '@shared/validators';
import { AuthorizationService } from '@core/services/authorization.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor() {
    effect(() => {
      const user = this.authorizationService.currentUser();
      this.userData.set(user);
      if (user) {
        this.getMenuItems();
      }
    });
  }

  ngOnInit(): void {
    if (!this.authorizationService.currentUser()) {
      this.authorizationService.loadUser().subscribe({
        error: (err) => this.toast.error(err.message),
        complete: () => this.isLoading.set(false)
      });
    } else {
      this.isLoading.set(false);
    }
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
        permission: [
          PHASE_ONE_AUTHORITIES.VIEW_LIST_OF_REGISTRATION,
          PHASE_ONE_AUTHORITIES.UPDATE_REGISTRATION,
          PHASE_ONE_AUTHORITIES.VIEW_REGISTRATION,
          PHASE_ONE_AUTHORITIES.ASSESS_APPLICANT,
          PHASE_ONE_AUTHORITIES.VIEW_APPLICANT,
          PHASE_ONE_AUTHORITIES.VIEW_ORGANIZATION,
          PHASE_ONE_AUTHORITIES.CREATE_ORGANIZATION,
          PHASE_ONE_AUTHORITIES.UPDATE_ORGANIZATION,
          PHASE_ONE_AUTHORITIES.VIEW_CREATED_PARTICIPANTS,
          PHASE_ONE_AUTHORITIES.POSTREG_VIEW_LIST,
          PHASE_ONE_AUTHORITIES.VIEW_SUSPENDED_PARTICIPANTS,
          PHASE_ONE_AUTHORITIES.IMPORT_IPR_DATA,
          PHASE_ONE_AUTHORITIES.MANAGE_DOCUMENTS,
          PHASE_ONE_AUTHORITIES.VIEW_EXPIRED_DOCS,
          PHASE_ONE_AUTHORITIES.VIEW_EXPIRING_DOCS,
          PHASE_ONE_AUTHORITIES.VIEW_LIST_OF_REGISTRATION,
          PHASE_ONE_AUTHORITIES.EXPORT_WESM_REG_UPDATE_REPORT,
          PHASE_ONE_AUTHORITIES.MANAGE_MARKET_PARTICIPANTS,
          PHASE_ONE_AUTHORITIES.MANAGE_SYSTEM_OPERATORS
        ],
        children: [
          {
            title: 'Registration Transaction',
            permission: [
              PHASE_ONE_AUTHORITIES.VIEW_LIST_OF_REGISTRATION,
              PHASE_ONE_AUTHORITIES.UPDATE_REGISTRATION,
              PHASE_ONE_AUTHORITIES.VIEW_REGISTRATION,
              PHASE_ONE_AUTHORITIES.ASSESS_APPLICANT,
              PHASE_ONE_AUTHORITIES.VIEW_APPLICANT,
              PHASE_ONE_AUTHORITIES.VIEW_ORGANIZATION,
              PHASE_ONE_AUTHORITIES.CREATE_ORGANIZATION,
              PHASE_ONE_AUTHORITIES.UPDATE_ORGANIZATION,
              PHASE_ONE_AUTHORITIES.VIEW_CREATED_PARTICIPANTS,
            ],
            children: [
              //PEMC ROUTES
              {
                title: 'Manage Registration Transaction',
                externalLink: externalRoutes.REGISTRATION_PEMC.REGISRATION_TRANSACTIONS.MANAGE_REGISTRATION_TRANSACTION,
                permission: [
                  PHASE_ONE_AUTHORITIES.VIEW_LIST_OF_REGISTRATION,
                  PHASE_ONE_AUTHORITIES.UPDATE_REGISTRATION,
                  PHASE_ONE_AUTHORITIES.VIEW_REGISTRATION
                ]
              },
              {
                title: 'Manage Sign-up Applications',
                externalLink: externalRoutes.REGISTRATION_PEMC.REGISRATION_TRANSACTIONS.MANAGE_SIGNUP_APPLICATION,
                permission: [
                  PHASE_ONE_AUTHORITIES.ASSESS_APPLICANT,
                  PHASE_ONE_AUTHORITIES.VIEW_APPLICANT
                ]
              },
              {
                title: 'Manage Business Organization',
                externalLink: externalRoutes.REGISTRATION_PEMC.REGISRATION_TRANSACTIONS.MANAGE_BUSINESS_ORGANIZATION,
                permission: [
                  PHASE_ONE_AUTHORITIES.VIEW_ORGANIZATION,
                  PHASE_ONE_AUTHORITIES.CREATE_ORGANIZATION,
                  PHASE_ONE_AUTHORITIES.UPDATE_ORGANIZATION
                ]
              },
              {
                title: 'Create New Trading Participant',
                externalLink: externalRoutes.REGISTRATION_PEMC.REGISRATION_TRANSACTIONS.CREATE_NEW_TRADING_PARTICIPANTS,
                permission: [PHASE_ONE_AUTHORITIES.VIEW_CREATED_PARTICIPANTS]
              }
            ]
          },
          {
            title: 'Post Registration Transactions',
            permission: [PHASE_ONE_AUTHORITIES.POSTREG_VIEW_LIST],
            children: [
              {
                title: 'Manage Post Registration Transactions',
                externalLink: externalRoutes.REGISTRATION_PEMC.POST_REGISTRATION_TRANSACTIONS.MANAGE_POST_REGISTRATION_TRANSACTIONS,
                permission: [PHASE_ONE_AUTHORITIES.POSTREG_VIEW_LIST]
              },
              {
                title: 'Advisory Publication',
                externalLink: externalRoutes.REGISTRATION_PEMC.POST_REGISTRATION_TRANSACTIONS.ADVISORY_PUBLICATION,
                permission: [PHASE_ONE_AUTHORITIES.POSTREG_VIEW_LIST]
              }
            ]
          },
          {
            title: 'Document Management',
            permission: [PHASE_ONE_AUTHORITIES.MANAGE_DOCUMENTS, PHASE_ONE_AUTHORITIES.VIEW_EXPIRING_DOCS, PHASE_ONE_AUTHORITIES.VIEW_EXPIRED_DOCS],
            children: [
              {
                title: 'Manage Document Managent',
                externalLink: externalRoutes.REGISTRATION_PEMC.DOCUMENT_MANAGEMENT.MANAGE_REGISTRATION_DOCUMENTS,
                permission: [PHASE_ONE_AUTHORITIES.MANAGE_DOCUMENTS]
              },
              {
                title: 'View Expiring Registration Documents',
                externalLink: externalRoutes.REGISTRATION_PEMC.DOCUMENT_MANAGEMENT.VIEW_EXPIRING_REGISTRATION_DOCUMENTS,
                permission: [PHASE_ONE_AUTHORITIES.VIEW_EXPIRING_DOCS]
              },
              {
                title: 'View Expired Registration Documents',
                externalLink: externalRoutes.REGISTRATION_PEMC.DOCUMENT_MANAGEMENT.VIEW_EXPIRED_REGISTRATION_DOCUMENTS,
                permission: [PHASE_ONE_AUTHORITIES.VIEW_EXPIRED_DOCS]
              }
            ]
          },
          {
            title: 'Reports',
            permission: [PHASE_ONE_AUTHORITIES.EXPORT_WESM_REG_UPDATE_REPORT],
            children: [
              {
                title: 'WESM Registration Updates',
                externalLink: externalRoutes.REGISTRATION_PEMC.REPORTS.WESM_REGISTRATION_UPDATES,
                permission: [PHASE_ONE_AUTHORITIES.EXPORT_WESM_REG_UPDATE_REPORT]
              },
              {
                title: 'Retail Compliance Reports',
                externalLink: externalRoutes.REGISTRATION_PEMC.REPORTS.RETAIL_COMPLIANCE_REPORTS,
                permission: [PHASE_ONE_AUTHORITIES.EXPORT_WESM_REG_UPDATE_REPORT]
              }
            ]
          },
          {
            title: 'View Suspended Participants',
            externalLink: externalRoutes.REGISTRATION_PEMC.VIEW_SUSPENDED_PARTICIPANTS,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_SUSPENDED_PARTICIPANTS]
          },
          {
            title: 'Upload IPRs',
            externalLink: externalRoutes.REGISTRATION_PEMC.UPLOAD_IPRS,
            permission: [PHASE_ONE_AUTHORITIES.IMPORT_IPR_DATA]
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
            permission: [PHASE_ONE_AUTHORITIES.REQUEST_TRANSFER_FACILITY],
            children: [
              {
                title: 'Available Facilities',
                externalLink: externalRoutes.REGISTRATION_TP.MANAGE_FACILITIES.AVAILABLE_FACILITIES,
                permission: [PHASE_ONE_AUTHORITIES.REQUEST_TRANSFER_FACILITY]
              },
              {
                title: 'Facilities For Transfer',
                externalLink: externalRoutes.REGISTRATION_TP.MANAGE_FACILITIES.FACILITIES_FOR_TRANSFER,
                permission: [PHASE_ONE_AUTHORITIES.REQUEST_TRANSFER_FACILITY]
              }
            ]
          },
          {
            title: 'View Expiring / Expired Documents',
            externalLink: externalRoutes.REGISTRATION_TP.VIEW_EXPIRING_EXPIRED_DOCUMENTS,
            permission:[PHASE_ONE_AUTHORITIES.VIEW_EXPIRING_EXPIRED_DOCS]
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
            permission: [PHASE_ONE_AUTHORITIES.VIEW_EXPIRING_EXPIRED_DOCS]
          }
        ]
      },
      //Manage Facility Application External Routes
      {
        title: 'Manage Facility Applications',
        icon: faBuilding,
        permission: [PHASE_ONE_AUTHORITIES.VIEW_MIRF],
        children: [
          {
            title: 'View Facility Applications',
            externalLink: externalRoutes.MANAGE_FACILITY_APPLICATIONS,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_MIRF]
          }
        ]
      },
      //MIRF External Routes
      {
        title: 'Manage MIRF',
        icon: faCopy,
        permission: [PHASE_ONE_AUTHORITIES.VIEW_MIRF, PHASE_ONE_AUTHORITIES.MIRF_UPLOAD_VIEW, PHASE_ONE_AUTHORITIES.MIRF_SUMMARY_VIEW],
        children: [
          {
            title: 'Upload MIRF',
            externalLink: externalRoutes.MANAGE_MIRF.UPLOAD_MIRF,
            permission: [PHASE_ONE_AUTHORITIES.MIRF_UPLOAD_VIEW]
          },
          {
            title: 'View MIRF Summary',
            externalLink: externalRoutes.MANAGE_MIRF.VIEW_MIRF_SUMMARY,
            permission: [PHASE_ONE_AUTHORITIES.MIRF_SUMMARY_VIEW]
          },
          {
            title: 'MIRF Updates',
            externalLink: externalRoutes.MANAGE_MIRF.MIRF_UPDATES,
            permission: [PHASE_ONE_AUTHORITIES.MIRF_UPLOAD_VIEW]
          }
        ]
      },
      //Admin External Routes
      {
        title: 'Admin',
        icon: faUserLarge,
        permission: [
          PHASE_ONE_AUTHORITIES.MANAGE_AUDIT_LOGS, 
          PHASE_ONE_AUTHORITIES.MANAGE_SYS_CONFIG,
          PHASE_ONE_AUTHORITIES.MANAGE_JOB_SCHEDULER, 
          PHASE_ONE_AUTHORITIES.MANAGE_WESM_MARKET_PRODUCTS, 
          PHASE_ONE_AUTHORITIES.MANAGE_FIELD_SETTINGS,
          PHASE_ONE_AUTHORITIES.MANAGE_SEC
        ],
        children: [
          {
            title: 'MO User Management',
            permission: [PHASE_ONE_AUTHORITIES.MANAGE_MARKET_OPERATORS, PHASE_ONE_AUTHORITIES.VIEW_ROLE, PHASE_ONE_AUTHORITIES.VIEW_PRIVILEGES],
            children: [
              {
                title: 'Manage Market Operator Users',
                externalLink: externalRoutes.ADMIN.MO_USER_MANAGEMENT.MANAGE_MARKET_OPERATOR_USERS,
                permission: [PHASE_ONE_AUTHORITIES.MANAGE_MARKET_OPERATORS]
              },
              {
                title: 'Manage User Roles',
                externalLink: externalRoutes.ADMIN.MO_USER_MANAGEMENT.MANAGE_USER_ROLES,
                permission: [PHASE_ONE_AUTHORITIES.VIEW_ROLE]
              },
              {
                title: 'View Privileges',
                externalLink: externalRoutes.ADMIN.MO_USER_MANAGEMENT.VIEW_PRIVILEGES,
                permission:[PHASE_ONE_AUTHORITIES.VIEW_PRIVILEGES]
              }
            ]
          },
          {
            title: 'View Audit Logs',
            externalLink: externalRoutes.ADMIN.VIEW_AUDIT_LOGS,
            permission: [PHASE_ONE_AUTHORITIES.MANAGE_AUDIT_LOGS]
          },
          {
            title: 'View XDF Audit Logs',
            externalLink: externalRoutes.ADMIN.VIEW_XDF_AUDIT_LOGS,
            permission: [PHASE_ONE_AUTHORITIES.MANAGE_AUDIT_LOGS]
          },
          {
            title: 'System Configuration',
            externalLink: externalRoutes.ADMIN.SYSTEM_CONFIGURATION,
            permission: [PHASE_ONE_AUTHORITIES.MANAGE_SYS_CONFIG,]
          },
          {
            title: 'Manage Scheduled Jobs',
            externalLink: externalRoutes.ADMIN.MANAGE_SCHEDULED_JOBS,
            permission: [PHASE_ONE_AUTHORITIES.MANAGE_JOB_SCHEDULER]
          },
          {
            title: 'Data Interface Management',
            permission: [
              PHASE_TWO_AUTHORITIES.SET_TOD_GEN_CONFIG,
              PHASE_TWO_AUTHORITIES.VIEW_IMPORT_SUMMARY
            ],
            children: [
              {
                title: 'Manage Trading Operations Data Interface',
                externalLink: externalRoutes.ADMIN.DATA_INTERFACE_MANAGEMENT.MANAGE_TRADING_OPERATIONS_DATA_INTERFACES,
                permission: [PHASE_TWO_AUTHORITIES.SET_TOD_GEN_CONFIG]
              },
              {
                title: 'Import Trading Operations Data',
                externalLink: externalRoutes.ADMIN.DATA_INTERFACE_MANAGEMENT.IMPORT_TRADING_OPERATIONS_DATA,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_IMPORT_SUMMARY]
              }
            ]
          },
          {
            title: 'Manage Market Products',
            externalLink: externalRoutes.ADMIN.MANAGE_MARKET_PRODUCTS,
            permission: [PHASE_ONE_AUTHORITIES.MANAGE_WESM_MARKET_PRODUCTS]
          },
          {
            title: 'Manage Sub Market Products',
            externalLink: externalRoutes.ADMIN.MANAGE_SUB_MARKET_PRODUCTS,
            permission: [PHASE_ONE_AUTHORITIES.MANAGE_WESM_MARKET_PRODUCTS]
          },
          {
            title: 'Manage Field Settings',
            externalLink: externalRoutes.ADMIN.MANAGE_FIELD_SETTINGS,
            permission: [PHASE_ONE_AUTHORITIES.MANAGE_FIELD_SETTINGS]
          }
        ]
      },
      //User Account Route
      {
        title: 'Manage User Accounts',
        icon: faCircleUser,
        permission: [PHASE_ONE_AUTHORITIES.POSTREG_VIEW_LIST_USERACCOUNT, PHASE_ONE_AUTHORITIES.POSTREG_VIEW_USERACCOUNT_DETAILS],
        externalLink: externalRoutes.USER_ACCOUNTS_FOR_TP
      },
      //Calendar route
      {
        title: 'Calendar',
        icon: faCalendar,
        permission: [PHASE_ONE_AUTHORITIES.VIEW_CALENDAR],
        externalLink: externalRoutes.CALENDAR
      },
      {
        title: 'View Metering and Settlement Data',
        icon: faFileArchive,
        permission: [PHASE_ONE_AUTHORITIES.VIEW_DOWNLOAD_METER_STL_DATA],
        externalLink: externalRoutes.FILE_SUMMARY_FOR_TP
      },
      //MTN link route
      {
        title: 'View MTNs',
        icon: faCopy,
        permission: [PHASE_ONE_AUTHORITIES.VIEW_MARKET_TRADING_NODE, PHASE_ONE_AUTHORITIES.UPDATE_MARKET_TRADING_NODE],
        externalLink: externalRoutes.MTN_LINK_FOR_MSP
      },
      //Prudential requirements for tp routes
      {
        title: 'Prudential Requirements',
        icon: faAddressBook,
        permission: [
          PHASE_ONE_AUTHORITIES.MARGIN_CALL_SUMMARY_CONFIRMATION_VIEW, 
          PHASE_ONE_AUTHORITIES.VIEW_HISTORICAL_DRAWDOWN_SUMMARY, 
          PHASE_ONE_AUTHORITIES.VIEW_FINANCIAL_INFO_PAGE,
          PHASE_ONE_AUTHORITIES.VIEW_PRUDENTIAL_REQ_SECURITY_DEPOSIT_LIST,
          PHASE_ONE_AUTHORITIES.VIEW_PRUDENTIAL_REQ_EXEMPTION_LIST,
          PHASE_ONE_AUTHORITIES.VIEW_PR_SEC_DEP_EMAIL_LIST,
          PHASE_ONE_AUTHORITIES.VIEW_PR_OUT_BAL_LIST,
          PHASE_ONE_AUTHORITIES.VIEW_PR_SD_EXPIRING_SENT_NOTIFICATION_LIST,
          PHASE_ONE_AUTHORITIES.MARGIN_CALL_SUMMARY_VIEW,
          PHASE_ONE_AUTHORITIES.ADM_VIEW_HOLIDAY_LIST,
          PHASE_ONE_AUTHORITIES.GENERATE_DRAWDOWN_SUMMARY,
          PHASE_ONE_AUTHORITIES.CONFIRM_DRAWDOWN_SUMMARY,
          PHASE_ONE_AUTHORITIES.VIEW_GENERATE_DRAWDOWN_SUMMARY,
          PHASE_ONE_AUTHORITIES.VIEW_PR_MONITOR_REPORT,
          PHASE_ONE_AUTHORITIES.VIEW_CONFIRM_DRAWDOWN_SUMMARY,
          PHASE_ONE_AUTHORITIES.DOWNLOAD_HISTORICAL_DRAWDOWN_SUMMARY,
          PHASE_ONE_AUTHORITIES.VIEW_MAXIMUM_EXPOSURE_LIST
        ],
        children: [
          //TP ROUTES
          {
            title: 'View Margin Call Reports',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_TP.VIEW_MARGIN_CALL_REPORTS,
            permission: [PHASE_ONE_AUTHORITIES.MARGIN_CALL_SUMMARY_CONFIRMATION_VIEW]
          },
          {
            title: 'Financial Information',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_TP.FINANCIAL_INFORMATION,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_FINANCIAL_INFO_PAGE]
          },
          {
            title: 'View Drawdown Reports',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_TP.VIEW_DRAWDOWN_REPORTS,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_HISTORICAL_DRAWDOWN_SUMMARY]
          },
          //PEMC ROUTES
          {
            title: 'Security Deposit',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.SECURITY_DEPOSIT,
            permission: [
              PHASE_ONE_AUTHORITIES.VIEW_PRUDENTIAL_REQ_SECURITY_DEPOSIT_LIST,
              PHASE_ONE_AUTHORITIES.VIEW_PRUDENTIAL_REQ_EXPIRING_SECURITY_DEPOSIT_LIST,
              PHASE_ONE_AUTHORITIES.VIEW_PR_SD_EXPIRING_SENT_NOTIFICATION_LIST
            ]
          },
          {
            title: 'Manage PR Exemptions',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_PR_EXEMPTIONS,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_PRUDENTIAL_REQ_EXEMPTION_LIST]
          },
          {
            title: 'Manage Holiday',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_HOLIDAY,
            permission: [PHASE_ONE_AUTHORITIES.ADM_VIEW_HOLIDAY_LIST]
          },
          {
            title: 'Manage Contact List (For Financial Transactions)',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_CONTACT_LIST_FOR_FINANCIAL_TRANSACTIONS,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_PR_SEC_DEP_EMAIL_LIST]
          },
          {
            title: 'Manage Outstanding Balance',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_OUTSTANDING_BALANCE,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_PR_OUT_BAL_LIST]
          },
          {
            title: 'Maximum Exposure',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MAXIMUM_EXPOSURE,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_MAXIMUM_EXPOSURE_LIST]
          },
          {
            title: 'Manage Margin Calls',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_MARGIN_CALLS,
            permission: [PHASE_ONE_AUTHORITIES.MARGIN_CALL_SUMMARY_VIEW]
          },
          {
            title: 'Monitoring Reports',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MONITORING_REPORTS,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_PR_MONITOR_REPORT]
          },
          {
            title: 'Extract Historical WESM Bill Information',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.EXTRACT_HISTORICAL_WESM_BILL_INFORMATION,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_HISTORICAL_WESM_BILL]
          },
          {
            title: 'Manage Drawdown Summary',
            externalLink: externalRoutes.PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER.MANAGE_DRAWDOWN_SUMMARY,
            permission: [
              PHASE_ONE_AUTHORITIES.VIEW_GENERATE_DRAWDOWN_SUMMARY,
              PHASE_ONE_AUTHORITIES.VIEW_CONFIRM_DRAWDOWN_SUMMARY,
              PHASE_ONE_AUTHORITIES.VIEW_NOTICE_ISSUANCE_DRAWDOWN_SUMMARY,
              PHASE_ONE_AUTHORITIES.VIEW_HISTORICAL_DRAWDOWN_SUMMARY
            ]
          }
        ]
      },
      //Facility Managent Routes
      {
        title: 'Facility Management',
        icon: faBuildingUn,
        permission: [
          PHASE_ONE_AUTHORITIES.VIEW_MARKET_TRADING_NODE, 
          PHASE_ONE_AUTHORITIES.UPDATE_MARKET_TRADING_NODE,
          PHASE_ONE_AUTHORITIES.VIEW_MIRF, 
          PHASE_ONE_AUTHORITIES.VIEW_FACILITY_LIST,
          PHASE_ONE_AUTHORITIES.VIEW_FACILITIES_FOR_ACTIVATION, 
          PHASE_ONE_AUTHORITIES.VIEW_FACILITIES_FOR_TRANSFER
        ],
        children: [
          {
            title: 'Manage Market Trading Nodes',
            externalLink: externalRoutes.FACILITY_MANAGEMENT_PEMC_USER.MANAGE_MARKET_TRADING_NODES,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_MARKET_TRADING_NODE, PHASE_ONE_AUTHORITIES.UPDATE_MARKET_TRADING_NODE]
          },
          {
            title: 'Manage Facilities',
            externalLink: externalRoutes.FACILITY_MANAGEMENT_PEMC_USER.MANAGE_FACILITIES,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_FACILITY_LIST]
          },
          {
            title: 'Facilities For Activatiton',
            externalLink: externalRoutes.FACILITY_MANAGEMENT_PEMC_USER.FACILITIES_FOR_ACTIVATION,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_FACILITIES_FOR_ACTIVATION]
          },
          {
            title: 'Facilities For Transfer',
            externalLink: externalRoutes.FACILITY_MANAGEMENT_PEMC_USER.FACILITIES_FOR_TRANSFER,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_FACILITIES_FOR_TRANSFER]
          },
          {
            title: 'MIRF',
            permission: [PHASE_ONE_AUTHORITIES.VIEW_MIRF],
            children: [
              {
                title: 'View Facility Application',
                externalLink: externalRoutes.FACILITY_MANAGEMENT_PEMC_USER.MIRF.VIEW_FACILITY_APPLICATIONS,
                permission: [PHASE_ONE_AUTHORITIES.VIEW_MIRF]
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
        permission: [PHASE_ONE_AUTHORITIES.MQ_VIEW_METERING_QUANTITY]
      },
      //MTE Menu Route
      {
        title: 'Manage Meter Trouble Reports',
        icon: faTachometerAlt,
        externalLink: externalRoutes.MTR_MENU_FOR_MSP.MANAGE_METER_TROUBLE_REPORTS,
        permission: [PHASE_TWO_AUTHORITIES.VIEW_MTR]
      },
      //BCQ Menu Routes
      //TODO Finalize permission to this list
      {
        title: 'Manage BCQs',
        icon: faBinoculars,
        permission: [

        ],
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
        permission: [
          PHASE_ONE_AUTHORITIES.VIEW_COUNTERPARTY_LIST,
          PHASE_ONE_AUTHORITIES.VIEW_CUSTOMER_ENROLLMENT_LIST, 
          PHASE_ONE_AUTHORITIES.VIEW_CUSTOMER_SWITCHING_LIST,
          PHASE_ONE_AUTHORITIES.MANAGE_SOLR_EVENT,
          PHASE_ONE_AUTHORITIES.VIEW_COUNTERPARTY_LIST,
          PHASE_ONE_AUTHORITIES.VIEW_CUSTOMER_ENROLLMENT_LIST, 
          PHASE_ONE_AUTHORITIES.VIEW_CUSTOMER_SWITCHING_LIST
        ],
        children: [
          //PEMC ROUTES
          {
            title: 'Manage TP Counterparties',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_PEMC_USERS.MANAGE_TP_COUNTERPARTIES,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_COUNTERPARTY_LIST]
          },
          {
            title: 'Manage Supply Contracts',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_PEMC_USERS.MANAGE_SUPPLY_CONTRACTS,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_CUSTOMER_ENROLLMENT_LIST]
          },
          {
            title: 'Manage Customer Switch Request',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_PEMC_USERS.MANAGE_CUSTOMER_SWITCH_REQUESTS,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_CUSTOMER_SWITCHING_LIST]
          },
          {
            title: 'Manage SOLR Events',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_PEMC_USERS.MANAGE_SOLR_EVENTS,
            permission: [PHASE_ONE_AUTHORITIES.MANAGE_SOLR_EVENT]
          },
          //TP ROUTES
          {
            title: 'Manage Contestable Management',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_TP.MANAGE_CONTESTABLE_CUSTOMER,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_INDIRECT_CC_LIST]
          },
          {
            title: 'Manage Indirect Member Counterparties',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_TP.MANAGE_INDIRECT_MEMBER_COUNTERPARTIES,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_COUNTERPARTY_LIST]
          },
          {
            title: 'Manage Supply Contracts',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_TP.MANAGE_SUPPLY_CONTRACTS,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_CUSTOMER_ENROLLMENT_LIST]
          },
          {
            title: 'Manage Customer Switch Request',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_TP.MANAGE_CUSTOMER_SWITCH_REQUEST,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_CUSTOMER_SWITCHING_LIST]
          },
          {
            title: 'SOLR Event Request',
            externalLink: externalRoutes.CONTRACT_MANAGEMENT_FOR_TP.SOLR_EVENT_REQUEST,
            permission: [PHASE_ONE_AUTHORITIES.VIEW_SOLR_EVENT]
          }
        ]
      },
      //Settlement routes
      {
        title: 'Settlement',
        icon: faHandHoldingHand,
        permission: [
          PHASE_ONE_AUTHORITIES.UPLOAD_BCQ, 
          PHASE_ONE_AUTHORITIES.VIEW_BCQ, 
          PHASE_ONE_AUTHORITIES.BCQ_VIEW_SPECIAL_EVENT,
          PHASE_ONE_AUTHORITIES.BCQ_VIEW_PROHIBITED,
          PHASE_TWO_AUTHORITIES.SET_BILLING_ID_CONFIG,
          PHASE_TWO_AUTHORITIES.SET_BILLING_PERIOD_CONFIG, 
          PHASE_TWO_AUTHORITIES.SET_RESERVE_PROCESS_CONFIG,
          PHASE_TWO_AUTHORITIES.SET_COST_RECOVERY_MODE, 
          PHASE_TWO_AUTHORITIES.SET_CHARGE_ID_CONFIG,
          PHASE_TWO_AUTHORITIES.SET_MARKET_FEE_MODE, 
          PHASE_TWO_AUTHORITIES.SET_STL_FILE_LOCATION,
          PHASE_TWO_AUTHORITIES.SET_MRU_CONFIG, 
          PHASE_TWO_AUTHORITIES.SET_TP_PASSWORD_CONFIG,
          PHASE_TWO_AUTHORITIES.SET_STL_GEN_CONFIG,
          PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS, 
          PHASE_TWO_AUTHORITIES.VIEW_ADDTL_COMP,
          PHASE_TWO_AUTHORITIES.AC_VIEW_AMS_INV_FOR_UPDATE,
          PHASE_TWO_AUTHORITIES.VIEW_WORKSPACE, 
          PHASE_TWO_AUTHORITIES.APPROVE_STL_TP_WORKLIST
        ],
        children: [
          //PEMC ROUTES
          {
            title: 'Manage BCQs',
            permission: [
              PHASE_ONE_AUTHORITIES.UPLOAD_BCQ, 
              PHASE_ONE_AUTHORITIES.VIEW_BCQ, 
              PHASE_ONE_AUTHORITIES.BCQ_VIEW_SPECIAL_EVENT,
              PHASE_ONE_AUTHORITIES.BCQ_VIEW_PROHIBITED
            ],
            children: [
              {
                title: 'Override BCQ',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MANAGE_BCQ.OVERRIDE_BCQ,
                permission: [PHASE_ONE_AUTHORITIES.UPLOAD_BCQ]
              },
              {
                title: 'View BCQs',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MANAGE_BCQ.VIEW_BCQ,
                permission: [PHASE_ONE_AUTHORITIES.VIEW_BCQ]
              },
              {
                title: 'Special Events',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MANAGE_BCQ.SPECIAL_EVENTS,
                permission: [PHASE_ONE_AUTHORITIES.BCQ_VIEW_SPECIAL_EVENT]
              },
              {
                title: 'Manage Prohibited List',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MANAGE_BCQ.MANAGE_PROHIBITED_LIST,
                permission: [PHASE_ONE_AUTHORITIES.BCQ_VIEW_PROHIBITED]
              }
            ]
          },
          {
            title: 'Maintenance',
            permission: [
              PHASE_TWO_AUTHORITIES.SET_BILLING_ID_CONFIG,
              PHASE_TWO_AUTHORITIES.SET_BILLING_PERIOD_CONFIG, 
              PHASE_TWO_AUTHORITIES.SET_RESERVE_PROCESS_CONFIG,
              PHASE_TWO_AUTHORITIES.SET_COST_RECOVERY_MODE, 
              PHASE_TWO_AUTHORITIES.SET_CHARGE_ID_CONFIG,
              PHASE_TWO_AUTHORITIES.SET_MARKET_FEE_MODE, 
              PHASE_TWO_AUTHORITIES.SET_STL_FILE_LOCATION,
              PHASE_TWO_AUTHORITIES.SET_MRU_CONFIG, 
              PHASE_TWO_AUTHORITIES.SET_TP_PASSWORD_CONFIG,
              PHASE_TWO_AUTHORITIES.SET_STL_GEN_CONFIG
            ],
            children: [
              {
                title: 'Manage Billing ID Masterlist',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_BILLING_ID_MASTERLIST,
                permission: [PHASE_TWO_AUTHORITIES.SET_BILLING_ID_CONFIG]
              },
              {
                title: 'Manage Billing Period',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_BILLING_PERIOD,
                permission: [PHASE_TWO_AUTHORITIES.SET_BILLING_PERIOD_CONFIG]
              },
              {
                title: 'Manage Reserve Calculation Configuration',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_RESERVE_CALCULATION_CONFIGURATION,
                permission: [
                  PHASE_TWO_AUTHORITIES.SET_RESERVE_PROCESS_CONFIG,
                  PHASE_TWO_AUTHORITIES.SET_COST_RECOVERY_MODE
                ]
              },
              {
                title: 'Manage Charge IDs',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_CHARGE_IDS,
                permission: [PHASE_TWO_AUTHORITIES.SET_CHARGE_ID_CONFIG]
              },
              {
                title: 'Manage Market Fee Calculation',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_MARKET_FEE_CALCULATION,
                permission: [PHASE_TWO_AUTHORITIES.SET_MARKET_FEE_MODE]
              },
              {
                title: 'Manage MRUs',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_MRU,
                permission: [PHASE_TWO_AUTHORITIES.SET_MRU_CONFIG]
              },
              {
                title: 'Manage Output File Location',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_OUTPUT_FILE_LOCATION,
                permission: [PHASE_TWO_AUTHORITIES.SET_STL_FILE_LOCATION]
              },
              {
                title: 'Manage Password Prefix For Output Files',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.MANAGE_PASSWORD_PREFIX_FOR_OUTPUT_FILES,
                permission: [PHASE_TWO_AUTHORITIES.SET_TP_PASSWORD_CONFIG]
              },
              {
                title: 'General Calculation Configuration',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.MAINTENANCE.GENERAL_CALCULATION_CONFIGURATION,
                permission: [PHASE_TWO_AUTHORITIES.SET_STL_GEN_CONFIG]
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
            permission: [
              PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS, 
              PHASE_TWO_AUTHORITIES.VIEW_ADDTL_COMP,
              PHASE_TWO_AUTHORITIES.AC_VIEW_AMS_INV_FOR_UPDATE
            ],
            children: [
              {
                title: 'Calculate Energey Trading Amounts',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.CALCULATE_ENERGY_TRADING_AMOUNTS,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS]
              },
              {
                title: 'Calculate Energey Trading Amounts v2',
                path: NEW_ROUTES.TRADING_AMOUNTS_CALCULATION,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS]
              },
              {
                title: 'Calculate Reserve Trading Amounts',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.CALCULATE_RESERVE_TRADING_AMOUNTS,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS]
              },
              {
                title: 'Calculate Reserve Trading Amounts v2',
                path: NEW_ROUTES.RESERVE_TRADING_AMOUNTS_CALCULATION,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS]
              },
              {
                title: 'Calculate Energy Market Fee',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.CALCULATE_ENERGY_MARKET_FEE,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS]
              },
              {
                title: 'Calculate Energy Market Fee v2',
                path: NEW_ROUTES.ENERGY_MARKET_FEE_CALCULATION,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS]
              },
              {
                title: 'Calculate Reserve Market Fee',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.CALCULATE_RESERVE_MARKET_FEE,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS]
              },
              {
                title: 'Calculate Reserve Market Fee v2',
                path: NEW_ROUTES.RESERVE_MARKET_FEE_CALCULATION,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS]
              },
              {
                title: 'Manage Additional Compensation Claims',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.MANAGE_ADDITIONAL_COMPENSATION_CLAIMS,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_ADDTL_COMP]
              },
              {
                title: 'Manage Additional Compensation Claims v2',
                path: NEW_ROUTES.ADDITIONAL_COMPENSATION_LIST,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_ADDTL_COMP]
              },
              {
                title: 'Update Additional Compensation Invoice',
                externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.CALCULATE_SETTLEMENT_AMOUNTS.UPDATE_ADDITIONAL_COMPENSATION_INVOICE,
                permission: [PHASE_TWO_AUTHORITIES.AC_VIEW_AMS_INV_FOR_UPDATE]
              },
              {
                title: 'Update Additional Compensation Invoice v2',
                path: NEW_ROUTES.ADDITIONAL_COMPENSATION_INVOICE,
                permission: [PHASE_TWO_AUTHORITIES.AC_VIEW_AMS_INV_FOR_UPDATE]
              }
            ]
          },
          {
            title: 'View Settlement Workspace',
            externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.VIEW_SETTLEMENT_WORKSPACE,
            permission: [PHASE_TWO_AUTHORITIES.VIEW_WORKSPACE]
          },
          {
            title: 'Worklist',
            externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.WORKLIST,
            permission: [PHASE_TWO_AUTHORITIES.APPROVE_STL_TP_WORKLIST]
          },
          {
            title: 'Upload Billing Statement',
            externalLink: externalRoutes.SETTLEMENT_MENU_FOR_PEMC_USER.UPLOAD_BILLING_STATEMENT,
            permission: [PHASE_TWO_AUTHORITIES.UPLOAD_BILLING_STATEMENT]
          }
        ]
      },
      //METERING ROUTES
      {
        title: 'Metering',
        icon: faTachometerAverage,
        permission: [
          PHASE_TWO_AUTHORITIES.VIEW_IMPORT_METERING_CONFIGURATION,
          PHASE_TWO_AUTHORITIES.VIEW_IMPORT_SETTLEMENT_METERING_CONFIGURATION, 
          PHASE_TWO_AUTHORITIES.SET_STL_SEIN_CONFIG,
          PHASE_TWO_AUTHORITIES.SET_VSEIN_MAPPING, 
          PHASE_TWO_AUTHORITIES.SET_MTN_MODEL_CONFIG,
          PHASE_TWO_AUTHORITIES.SET_MTN_GROUP_SCHED_SCHED, 
          PHASE_TWO_AUTHORITIES.SET_MTN_LOOP_CONFIG,
          PHASE_TWO_AUTHORITIES.SET_RCOA_CHANNEL_CONFIG, 
          PHASE_TWO_AUTHORITIES.SET_MET_GEN_CONFIG,
          PHASE_TWO_AUTHORITIES.VIEW_METER_PROCESS, 
          PHASE_TWO_AUTHORITIES.VIEW_MTR,
          PHASE_ONE_AUTHORITIES.MQ_VIEW_METERING_QUANTITY, 
          PHASE_TWO_AUTHORITIES.VIEW_SHIFTING_ANALYSIS,
          PHASE_TWO_AUTHORITIES.APPROVE_MET_MP_WORKLIST
        ],
        children: [
          {
            title: 'Calculations',
            externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATIONS,
            permission: [PHASE_TWO_AUTHORITIES.VIEW_METER_PROCESS]
          },
          {
            title: 'Calculations v2',
            path: NEW_ROUTES.METER_PROCESS,
            permission: [PHASE_TWO_AUTHORITIES.VIEW_METER_PROCESS]
          },
          {
            title: 'Meter Streaming Statistics',
            externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.METER_STREAMING_STATISTICS,
            permission: [PHASE_TWO_AUTHORITIES.VIEW_METER_PROCESS]
          },
          {
            title: 'Calculation Maintenance and Configuration',
            permission: [
              PHASE_TWO_AUTHORITIES.VIEW_IMPORT_METERING_CONFIGURATION,
              PHASE_TWO_AUTHORITIES.VIEW_IMPORT_SETTLEMENT_METERING_CONFIGURATION, 
              PHASE_TWO_AUTHORITIES.SET_STL_SEIN_CONFIG,
              PHASE_TWO_AUTHORITIES.SET_VSEIN_MAPPING, 
              PHASE_TWO_AUTHORITIES.SET_MTN_MODEL_CONFIG,
              PHASE_TWO_AUTHORITIES.SET_MTN_GROUP_SCHED_SCHED, 
              PHASE_TWO_AUTHORITIES.SET_MTN_LOOP_CONFIG,
              PHASE_TWO_AUTHORITIES.SET_RCOA_CHANNEL_CONFIG, 
              PHASE_TWO_AUTHORITIES.SET_MET_GEN_CONFIG
            ],
            children: [
              {
                title: 'Import Metering Configuration',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.IMPORT_METERING_CONFIGURATION,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_IMPORT_METERING_CONFIGURATION]
              },
              {
                title: 'Import Settlement Metering Point Configuration',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.IMPORT_SETTLEMENT_METERING_POINT_CONFIGURATION,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_IMPORT_SETTLEMENT_METERING_CONFIGURATION]
              },
              {
                title: 'Settlement SEIN Masterlist',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.SETTLEMENT_SEIN_MASTERLIST,
                permission: [PHASE_TWO_AUTHORITIES.SET_STL_SEIN_CONFIG]
              },
              {
                title: 'Historical Factors Maintenance',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.HISTORICAL_FACTOR_MAINTENANCE,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_MET_CFG]
              },
              {
                title: 'Virtual SEIN Mapping',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.VIRTUAL_SEIN_MAPPING,
                permission: [PHASE_TWO_AUTHORITIES.SET_VSEIN_MAPPING]
              },
              {
                title: 'MTN Model Configuration',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.MTN_MODEL_CONFIGURATION,
                permission: [PHASE_TWO_AUTHORITIES.SET_MTN_MODEL_CONFIG]
              },
              {
                title: 'MTN Group and Schedule',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.MTN_GROUP_AND_SCHEDULE,
                permission: [PHASE_TWO_AUTHORITIES.SET_MTN_GROUP_SCHED_SCHED]
              },
              {
                title: 'RCOA Channel Configuration',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.RCOA_CHANNEL_CONFIGURATION,
                permission: [PHASE_TWO_AUTHORITIES.SET_RCOA_CHANNEL_CONFIG]
              },
              {
                title: 'File Location',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.FILE_LOCATION,
                permission: [PHASE_TWO_AUTHORITIES.SET_MET_GEN_CONFIG]
              },
              {
                title: 'Manage Virtual Metering Point',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.MANAGE_VIRTUAL_METERING_POINT,
                permission: [PHASE_ONE_AUTHORITIES.VMP_MAINTENANCE_VIEW]
              },
              {
                title: 'Meter Registry Maintenance',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.CALCULATION_MAINTENANCE_AND_CONFIGURATION.METER_REGISTRY_MAINTENANCE,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_MET_CFG]
              }
            ]
          },
          {
            title: 'Manage MTR',
            externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.MANAGE_MTR,
            permission: [PHASE_TWO_AUTHORITIES.VIEW_MTR]
          },
          {
            title: 'Worklist',
            externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.WORKLIST,
            permission: [PHASE_TWO_AUTHORITIES.APPROVE_MET_MP_WORKLIST]
          },
          {
            title: 'Data Analysis and Validation',
            permission: [PHASE_ONE_AUTHORITIES.MQ_VIEW_METERING_QUANTITY, PHASE_TWO_AUTHORITIES.VIEW_SHIFTING_ANALYSIS],
            children: [
              {
                title: 'View Submitted Meter Data',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.DATA_ANALYSIS_AND_VALIDATION.VIEW_SUBMITTED_METER_DATA,
                permission: [PHASE_ONE_AUTHORITIES.MQ_VIEW_METERING_QUANTITY]
              },
              {
                title: 'RTU Comparison',
                externalLink: externalRoutes.METERING_MENU_FOR_PEMC_USER.DATA_ANALYSIS_AND_VALIDATION.RTU_COMPARISON,
                permission: [PHASE_TWO_AUTHORITIES.VIEW_SHIFTING_ANALYSIS]
              }
            ]
          }
        ]
      },
      //Activity log route
      {
        title: 'Activity Logs',
        icon: faListCheck,
        permission: [PHASE_TWO_AUTHORITIES.VIEW_ACTIVITY_LOG],
        externalLink: externalRoutes.ACTIVITY_LOGS
      },
      //Job Queue route
      {
        title: 'Job Queue',
        icon: faRoadCircleCheck,
        permission: [PHASE_TWO_AUTHORITIES.VIEW_QUEUE],
        externalLink: externalRoutes.JOB_QUEUE
      }
    ];

    this.navItems = this.navItems.filter(item => this.hasPermission(item)); //for checking
  }
  
  toggleCollapse(): void {
    this.navbarToggle.emit();
  }
  
  shouldShowText(): boolean {
    return !this.isCollapsed || this.isHovered;
  }
  
  navigateTo(item: navItems): void {
    if (item.externalLink && item.externalLink.trim() !== '') {
      window.location.href = item.externalLink;
    } else if (item.path && item.path.trim() !== '') {
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
    const user = this.userData();
    if (!item.permission || item.permission.length === 0) {
      return true;
    }

    if (!user || !user.principal.privileges) {
      return false;
    }

    return isAuthorizedAny(user.principal.privileges, item.permission);
  }
}
