import { environment } from "environments/environment";

export const NEW_ROUTES = {
    METER_PROCESS: 'meter-process-v2',
}

export const HEADER_ROUTES = {
    ABOUT_US: `${environment.__PHASE_ONE_URL__}/#/about-us`,
    HOW: `${environment.__PHASE_ONE_URL__}/#/`,
    FAQ: `${environment.__PHASE_ONE_URL__}/#/`
}

// PHASE ONE ROUTES
const REGISTRATION_TRANSACTIONS = {
    MANAGE_REGISTRATION_TRANSACTION: `${environment.__PHASE_ONE_URL__}/#/list/registration`,
    MANAGE_SIGNUP_APPLICATION: `${environment.__PHASE_ONE_URL__}/#/signup`,
    MANAGE_BUSINESS_ORGANIZATION: `${environment.__PHASE_ONE_URL__}/#/list/organization`,
    CREATE_NEW_TRADING_PARTICIPANTS: `${environment.__PHASE_ONE_URL__}/#/registration/internal/list`,
}

const POST_REGISTRATION_TRANSACTIONS = {
    MANAGE_POST_REGISTRATION_TRANSACTIONS: `${environment.__PHASE_ONE_URL__}/#/list/post-registration`,
    ADVISORY_PUBLICATION: `${environment.__PHASE_ONE_URL__}/#/list/advisory-publication`
}

const DOCUMENT_MANAGEMENT = {
    MANAGE_REGISTRATION_DOCUMENTS: `${environment.__PHASE_ONE_URL__}/#/doc/document-management`,
    VIEW_EXPIRING_REGISTRATION_DOCUMENTS: `${environment.__PHASE_ONE_URL__}/#/doc/expiry/notif`,
    VIEW_EXPIRED_REGISTRATION_DOCUMENTS: `${environment.__PHASE_ONE_URL__}/#/doc/expired`
}

const REPORTS = {
    WESM_REGISTRATION_UPDATES: `${environment.__PHASE_ONE_URL__}/#/reports/wesm`,
    RETAIL_COMPLIANCE_REPORTS: `${environment.__PHASE_ONE_URL__}/#/reports/retails`
}

const EXTERNAL_MANAGEMENT = {
    MANAGE_TRADING_PARTICIPANT_USERS: `${environment.__PHASE_ONE_URL__}/#/list/admin/user/MP`,
    MANAGE_SERVICE_PROVIDER_USERS: `${environment.__PHASE_ONE_URL__}/#/list/admin/user/SO`
}

//MAIN REGISTRATION ROUTES FOR PEMC USERS
const REGISTRATION_PEMC = {
    REGISRATION_TRANSACTIONS: REGISTRATION_TRANSACTIONS,
    POST_REGISTRATION_TRANSACTIONS: POST_REGISTRATION_TRANSACTIONS,
    VIEW_SUSPENDED_PARTICIPANTS: `${environment.__PHASE_ONE_URL__}/#/list/suspended-participants`,
    UPLOAD_IPRS: `${environment.__PHASE_ONE_URL__}/#/upload-initial-pr`,
    DOCUMENT_MANAGEMENT: DOCUMENT_MANAGEMENT,
    REPORTS: REPORTS,
    EXTERNAL_MANAGEMENT: EXTERNAL_MANAGEMENT
}

const MANAGE_FACILITIES = {
    AVAILABLE_FACILITIES: `${environment.__PHASE_ONE_URL__}/#/transfer-facilities/available`,
    FACILITIES_FOR_TRANSFER: `${environment.__PHASE_ONE_URL__}/#//transfer-facilities`,

}

const MANAGE_MIRF = {
    UPLOAD_MIRF: `${environment.__PHASE_ONE_URL__}/#//mirf/upload/csv`,
    VIEW_MIRF_SUMMARY: `${environment.__PHASE_ONE_URL__}/#/mirf/list/view-summary"`,
    MIRF_UPDATES: `${environment.__PHASE_ONE_URL__}/#/post-reg-mirf-updates`
}

const MO_USER_MANAGEMENT = {
    MANAGE_MARKET_OPERATOR_USERS: `${environment.__PHASE_ONE_URL__}/#/list/admin/user/MO`,
    MANAGE_USER_ROLES: `${environment.__PHASE_ONE_URL__}/#/list/admin/role`,
    VIEW_PRIVILEGES: `${environment.__PHASE_ONE_URL__}/#/list/admin/privilege`
}

const DATA_INTERFACE_MANAGEMENT = {
    MANAGE_TRADING_OPERATIONS_DATA_INTERFACES: `${environment.__PHASE_TWO_URL__}/#/data-interface-config`,
    IMPORT_TRADING_OPERATIONS_DATA: `${environment.__PHASE_TWO_URL__}/#/data-interface"`
}

const ADMIN = {
    MO_USER_MANAGEMENT: MO_USER_MANAGEMENT,
    VIEW_AUDIT_LOGS: `${environment.__PHASE_ONE_URL__}/#/list/admin/audit"`,
    VIEW_XDF_AUDIT_LOGS: `${environment.__PHASE_ONE_URL__}/#/list/admin/xdf`,
    SYSTEM_CONFIGURATION: `${environment.__PHASE_ONE_URL__}/#/admin/config/form`,
    MANAGE_SCHEDULED_JOBS: `${environment.__PHASE_ONE_URL__}/#/list/admin/scheduler/jobs`,
    DATA_INTERFACE_MANAGEMENT: DATA_INTERFACE_MANAGEMENT,
    MANAGE_MARKET_PRODUCTS: `${environment.__PHASE_ONE_URL__}/#/list/market-product"`,
    MANAGE_SUB_MARKET_PRODUCTS: `${environment.__PHASE_ONE_URL__}/#/list/sub-market-product`,
    MANAGE_FIELD_SETTINGS: `${environment.__PHASE_ONE_URL__}/#/manage/field-settings`
}

const MIRF = {
    VIEW_FACILITY_APPLICATIONS: `${environment.__PHASE_ONE_URL__}/#/list/mirf`
}

//FACILITY MANAGEMENT FOR PEMC USER
const FACILITY_MANAGEMENT_PEMC_USER = {
    MANAGE_MARKET_TRADING_NODES: `${environment.__PHASE_ONE_URL__}/#/list/mtn`,
    MANAGE_FACILITIES: `${environment.__PHASE_ONE_URL__}/#/facilities`,
    FACILITIES_FOR_ACTIVATION: `${environment.__PHASE_ONE_URL__}/#/transfer-facilities/for-activation`,
    FACILITIES_FOR_TRANSFER: `${environment.__PHASE_ONE_URL__}/#/transfer-facilities/irps`,
    MIRF: MIRF
    //TODO find out what's Ancillary Service Facility
}

const MQ_MENU_FOR_MSP = {
    VIEW_SUBMITTED_METER_DATA: `${environment.__PHASE_ONE_URL__}/#/metering/list/meter-data`
}

const MTR_MENU_FOR_MSP = {
    MANAGE_METER_TROUBLE_REPORTS: `${environment.__PHASE_TWO_URL__}/#/mtr`
}

//BCQ MENU FOR TP ROUTE
const BCQ_MENU_FOR_TP = {
    SUBMIT_BCQ_AS_SELLER: `${environment.__PHASE_ONE_URL__}/#/bcq/upload`,
    CONFIRM_AS_BUYER_VIEW_BCQ: `${environment.__PHASE_ONE_URL__}/#/list/bcq/declaration`,
    BCQ_DOWNLOAD_TEMPLATE: `${environment.__PHASE_ONE_URL__}/#/bcq/download/template`
}

//CONTRACT MANAGEMENT FOR PEMC USERS ROUTE
const CONTRACT_MANAGEMENT_FOR_PEMC_USERS = {
    MANAGE_TP_COUNTERPARTIES: `${environment.__PHASE_ONE_URL__}/#/list/counterparty`,
    MANAGE_SUPPLY_CONTRACTS: `${environment.__PHASE_ONE_URL__}/#/list/enrollment`,
    MANAGE_CUSTOMER_SWITCH_REQUESTS: `${environment.__PHASE_ONE_URL__}/#/customer-switching`,
    MANAGE_SOLR_EVENTS: `${environment.__PHASE_ONE_URL__}/#/customer-switching/cessation`
}

//CONTRACT MANAGEMENT FOR TP ROUTES
const CONTRACT_MANAGEMENT_FOR_TP = {
    MANAGE_CONTESTABLE_CUSTOMER: `${environment.__PHASE_ONE_URL__}/#/registration/0/cc`,
    MANAGE_INDIRECT_MEMBER_COUNTERPARTIES: `${environment.__PHASE_ONE_URL__}/#/list/counterparty`,
    MANAGE_SUPPLY_CONTRACTS: `${environment.__PHASE_ONE_URL__}/#/list/enrollment`,
    MANAGE_CUSTOMER_SWITCH_REQUEST: `${environment.__PHASE_ONE_URL__}/#/customer-switching`,
    SOLR_EVENT_REQUEST: `${environment.__PHASE_ONE_URL__}/#/customer-switching/cessation`
}

const MANAGE_BCQ = {
    OVERRIDE_BCQ: `${environment.__PHASE_ONE_URL__}/#/bcq/settlement/upload`,
    VIEW_BCQ: `${environment.__PHASE_ONE_URL__}/#/list/bcq/declaration`,
    SPECIAL_EVENTS: `${environment.__PHASE_ONE_URL__}/#/bcq/special-event/list`,
    MANAGE_PROHIBITED_LIST: `${environment.__PHASE_ONE_URL__}/#/bcq/prohibited/list`
}

const MAINTENANCE = {
    MANAGE_BILLING_ID_MASTERLIST: `${environment.__PHASE_TWO_URL__}/#/billing-id-masterlist`,
    MANAGE_BILLING_PERIOD: `${environment.__PHASE_TWO_URL__}/#/billing-period`,
    MANAGE_RESERVE_CALCULATION_CONFIGURATION: `${environment.__PHASE_TWO_URL__}/#/reserve-config`,
    MANAGE_CHARGE_IDS: `${environment.__PHASE_TWO_URL__}/#/charge-id-config`,
    MANAGE_MARKET_FEE_CALCULATION: `${environment.__PHASE_TWO_URL__}/#/market-fee-config`,
    MANAGE_MRU: `${environment.__PHASE_TWO_URL__}/#/mru-maintenance`,
    MANAGE_OUTPUT_FILE_LOCATION: `${environment.__PHASE_TWO_URL__}/#/settlement-file-location`,
    MANAGE_PASSWORD_PREFIX_FOR_OUTPUT_FILES: `${environment.__PHASE_TWO_URL__}/#/billing-id-password`,
    GENERAL_CALCULATION_CONFIGURATION: `${environment.__PHASE_TWO_URL__}/#/system-config`,
    MANAGE_SINGLE_BUYER: `${environment.__PHASE_TWO_URL__}/#/single-buyer-config`
}

const CALCULATE_SETTLEMENT_AMOUNTS = {
    CALCULATE_ENERGY_TRADING_AMOUNTS: `${environment.__PHASE_TWO_URL__}/#/settlement/trading-amounts-calculation`,
    CALCULATE_RESERVE_TRADING_AMOUNTS: `${environment.__PHASE_TWO_URL__}/#/settlement/reserve-trading-amounts-calculation`,
    CALCULATE_ENERGY_MARKET_FEE: `${environment.__PHASE_TWO_URL__}/#/settlement/energy-market-fee-calculation`,
    CALCULATE_RESERVE_MARKET_FEE: `${environment.__PHASE_TWO_URL__}/#/settlement/reserve-market-fee-calculation`,
    MANAGE_ADDITIONAL_COMPENSATION_CLAIMS: `${environment.__PHASE_TWO_URL__}/#/additional-compensation`,
    UPDATE_ADDITIONAL_COMPENSATION_INVOICE: `${environment.__PHASE_TWO_URL__}/#/addtl-comp-ams-update`
}

const DATA_ANALYSIS_AND_VALIDATION = {
    VIEW_SUBMITTED_METER_DATA: `${environment.__PHASE_ONE_URL__}/#/metering/list/meter-data`,
    RTU_COMPARISON: `${environment.__PHASE_TWO_URL__}/#/rtu-comparison`
}

const CALCULATION_MAINTENANCE_AND_CONFIGURATION = {
    IMPORT_METERING_CONFIGURATION: `${environment.__PHASE_TWO_URL__}/#/import-metering-config`,
    IMPORT_SETTLEMENT_METERING_POINT_CONFIGURATION: `${environment.__PHASE_TWO_URL__}/#/import-stl-mpconfig`,
    SETTLEMENT_SEIN_MASTERLIST: `${environment.__PHASE_TWO_URL__}/#/settlement-mpoint`,
    HISTORICAL_FACTOR_MAINTENANCE: `${environment.__PHASE_TWO_URL__}/#/historical-factor`,
    VIRTUAL_SEIN_MAPPING: `${environment.__PHASE_TWO_URL__}/#/virtual-sein-mapping`,
    MTN_MODEL_CONFIGURATION: `${environment.__PHASE_TWO_URL__}/#/mtn-model-config`,
    MTN_GROUP_AND_SCHEDULE: `${environment.__PHASE_TWO_URL__}/#/mtn-group-sched`,
    RCOA_CHANNEL_CONFIGURATION: `${environment.__PHASE_TWO_URL__}/#/rcoa-config`,
    FILE_LOCATION: `${environment.__PHASE_TWO_URL__}/#/meterprocess-file-loc-config`,
    MANAGE_VIRTUAL_METERING_POINT: `${environment.__PHASE_TWO_URL__}/#/virtual-metering-point`,
    METER_REGISTRY_MAINTENANCE: `${environment.__PHASE_TWO_URL__}/#/mtr-meter-list`
}

// SETTLEMENT MENU FOR PEMC USER ROUTES
const SETTLEMENT_MENU_FOR_PEMC_USER = {
    MANAGE_BCQ: MANAGE_BCQ,
    MAINTENANCE: MAINTENANCE,
    CALCULATE_SETTLEMENT_AMOUNTS: CALCULATE_SETTLEMENT_AMOUNTS,
    VIEW_SETTLEMENT_WORKSPACE: `${environment.__PHASE_TWO_URL__}/#/workspace`,
    WORKLIST: `${environment.__PHASE_TWO_URL__}/#/tp-worklist`,
    UPLOAD_BILLING_STATEMENT: `${environment.__PHASE_TWO_URL__}/#/upload-billing-statement`
}

//METERING MENU FOR PEMC USER ROUTES
const METERING_MENU_FOR_PEMC_USER = {
    CALCULATIONS: `${environment.__PHASE_TWO_URL__}/#/meter-process`,
    METER_STREAMING_STATISTICS: `${environment.__PHASE_TWO_URL__}/#/meter-streaming-stats`,
    CALCULATION_MAINTENANCE_AND_CONFIGURATION: CALCULATION_MAINTENANCE_AND_CONFIGURATION,
    MANAGE_MTR: `${environment.__PHASE_TWO_URL__}/#/mtr`,
    WORKLIST: `${environment.__PHASE_TWO_URL__}/#/mpoint-worklist`,
    DATA_ANALYSIS_AND_VALIDATION: DATA_ANALYSIS_AND_VALIDATION
}

//MAIN REGISTRATION ROUTES FOR NON-PEMC USERS
const REGISTRATION_TP = {
    MANAGE_REGISTRATION: `${environment.__PHASE_ONE_URL__}/#/registration/0/`,
    VIEW_GEOP_END_USERS: `${environment.__PHASE_ONE_URL__}/#/registration/0/indirect/list`,
    MANAGE_FACILITIES: MANAGE_FACILITIES,
    VIEW_EXPIRING_EXPIRED_DOCUMENTS: `${environment.__PHASE_ONE_URL__}/#/doc/expiry/notif`
}

const REGISTRATION_MSP = {
    MANAGE_REGISTRATION: `${environment.__PHASE_ONE_URL__}/#/registration/0/`,
    VIEW_EXPIRING_EXPIRED_DOCUMENTS: `${environment.__PHASE_ONE_URL__}/#/doc/expiry/notif`   
}

const PRUDENTIAL_REQUIREMENTS_FOR_TP = {
    VIEW_MARGIN_CALL_REPORTS: `${environment.__PHASE_ONE_URL__}/#/prudential-requirements/margin-call-summary`,
    FINANCIAL_INFORMATION: `${environment.__PHASE_ONE_URL__}/#/registration/0/financial-info/view`,
    VIEW_DRAWDOWN_REPORTS: `${environment.__PHASE_ONE_URL__}/#/prudential-requirements/drawdown-summary`
}

const PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER = {
    SECURITY_DEPOSIT: `${environment.__PHASE_ONE_URL__}/#/prudential-requirements/security-deposit`,
    MANAGE_PR_EXEMPTIONS: `${environment.__PHASE_ONE_URL__}/#/prudential-requirements/exemption`,
    MANAGE_HOLIDAY: `${environment.__PHASE_ONE_URL__}/#/list/admin/holiday`,
    MANAGE_CONTACT_LIST_FOR_FINANCIAL_TRANSACTIONS: `${environment.__PHASE_ONE_URL__}/#/prudential-requirements/contact`,
    MANAGE_OUTSTANDING_BALANCE: `${environment.__PHASE_ONE_URL__}/#/prudential-requirements/outstandingBalance`,
    MAXIMUM_EXPOSURE: `${environment.__PHASE_ONE_URL__}/#/prudential-requirements/maximum-exposure`,
    MANAGE_MARGIN_CALLS: `${environment.__PHASE_ONE_URL__}/#/prudential-requirements/margin-call-summary`,
    MONITORING_REPORTS: `${environment.__PHASE_ONE_URL__}/#/prudential-requirements/monitoring-report`,
    EXTRACT_HISTORICAL_WESM_BILL_INFORMATION: `${environment.__PHASE_ONE_URL__}/#/historical-wesm-bill/summary`,
    MANAGE_DRAWDOWN_SUMMARY: `${environment.__PHASE_ONE_URL__}/#/prudential-requirements/drawdown-summary`
}

export const externalRoutes = {
    HOME: `${environment.__PHASE_ONE_URL__}/#/`,
    NOTIFICATION: `${environment.__PHASE_ONE_URL__}/#/notifications`,
    REGISTRATION_PEMC: REGISTRATION_PEMC,
    REGISTRATION_TP: REGISTRATION_TP,
    REGISTRATION_MSP: REGISTRATION_MSP,
    MANAGE_FACILITY_APPLICATIONS: `${environment.__PHASE_ONE_URL__}/#/list/mirf`,
    MANAGE_MIRF: MANAGE_MIRF,
    ADMIN: ADMIN,
    FACILITY_MANAGEMENT_PEMC_USER: FACILITY_MANAGEMENT_PEMC_USER, //PEMC USERS
    MQ_MENU_FOR_MSP: MQ_MENU_FOR_MSP,
    MTR_MENU_FOR_MSP: MTR_MENU_FOR_MSP,
    BCQ_MENU_FOR_TP: BCQ_MENU_FOR_TP,
    CONTRACT_MANAGEMENT_FOR_PEMC_USERS: CONTRACT_MANAGEMENT_FOR_PEMC_USERS,
    CONTRACT_MANAGEMENT_FOR_TP: CONTRACT_MANAGEMENT_FOR_TP,
    SETTLEMENT_MENU_FOR_PEMC_USER: SETTLEMENT_MENU_FOR_PEMC_USER,
    METERING_MENU_FOR_PEMC_USER: METERING_MENU_FOR_PEMC_USER,
    ACTIVITY_LOGS: `${environment.__PHASE_TWO_URL__}/#/audit-log/list`, 
    JOB_QUEUE: `${environment.__PHASE_TWO_URL__}/#/job-queue`,
    USER_ACCOUNTS_FOR_TP: `${environment.__PHASE_ONE_URL__}/#/user-account`,
    CALENDAR: `${environment.__PHASE_ONE_URL__}/#/calendar`,
    FILE_SUMMARY_FOR_TP: `${environment.__PHASE_ONE_URL__}/#/tp-files`,
    MTN_LINK_FOR_MSP: `${environment.__PHASE_ONE_URL__}/#/list/mtn`,
    PRUDENTIAL_REQUIREMENTS_FOR_TP: PRUDENTIAL_REQUIREMENTS_FOR_TP,
    PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER: PRUDENTIAL_REQUIREMENTS_FOR_PEMC_USER,
    UPLOAD_AMS_BILLING_INFO: `${environment.__PHASE_ONE_URL__}/#/billing/upload`
}