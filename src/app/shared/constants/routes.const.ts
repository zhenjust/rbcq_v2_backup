import { environment } from "environments/environment"

export const HEADER_ROUTES = {
    ABOUT_US: `${environment.__PHASE_ONE_URL__}/#/about-us`,
    HOW: `${environment.__PHASE_ONE_URL__}/#/`,
    FAQ: `${environment.__PHASE_ONE_URL__}/#/`
}

// PHASE ONE ROUTES
export const REGISTRATION_TRANSACTIONS = {
    MANAGE_REGISTRATION_TRANSACTION: `${environment.__PHASE_ONE_URL__}//#/list/registration`,
    MANAGE_SIGNUP_APPLICATION: `${environment.__PHASE_ONE_URL__}//#/signup`,
    MANAGE_BUSINESS_ORGANIZATION: `${environment.__PHASE_ONE_URL__}//#/list/organization`,
    CREATE_NEW_TRADING_PARTICIPANTS: `${environment.__PHASE_ONE_URL__}//#/registration/internal/list`,
}

export const POST_REGISTRATION_TRANSACTIONS = {
    MANAGE_POST_REGISTRATION_TRANSACTIONS: `${environment.__PHASE_ONE_URL__}//#/list/post-registration`,
    ADVISORY_PUBLICATION: `${environment.__PHASE_ONE_URL__}//#/list/advisory-publication`
}

export const DOCUMENT_MANAGEMENT = {
    MANAGE_REGISTRATION_DOCUMENTS: `${environment.__PHASE_ONE_URL__}//#/doc/document-management`,
    VIEW_EXPIRING_REGISTRATION_DOCUMENTS: `${environment.__PHASE_ONE_URL__}//#/doc/expiry/notif`,
    VIEW_EXPIRED_REGISTRATION_DOCUMENTS: `${environment.__PHASE_ONE_URL__}//#/doc/expired`
}

export const REPORTS = {
    WESM_REGISTRATION_UPDATES: `${environment.__PHASE_ONE_URL__}//#/reports/wesm`,
    RETAIL_COMPLIANCE_REPORTS: `${environment.__PHASE_ONE_URL__}//#/reports/retails`
}

export const EXTERNAL_MANAGEMENT = {
    MANAGE_TRADING_PARTICIPANT_USERS: `${environment.__PHASE_ONE_URL__}//#/list/admin/user/MP`,
    MANAGE_SERVICE_PROVIDER_USERS: `${environment.__PHASE_ONE_URL__}//#/list/admin/user/SO`
}

//MAIN REGISTRATION ROUTES FOR PEMC USERS
export const REGISTRATION_PEMC = {
    REGISRATION_TRANSACTIONS: REGISTRATION_TRANSACTIONS,
    POST_REGISTRATION_TRANSACTIONS: POST_REGISTRATION_TRANSACTIONS,
    VIEW_SUSPENDED_PARTICIPANTS: `${environment.__PHASE_ONE_URL__}//#/list/suspended-participants`,
    UPLOAD_IPRS: `${environment.__PHASE_ONE_URL__}//#/upload-initial-pr`,
    DOCUMENT_MANAGEMENT: DOCUMENT_MANAGEMENT,
    REPORTS: REPORTS,
    EXTERNAL_MANAGEMENT: EXTERNAL_MANAGEMENT
}

//MAIN REGISTRATION ROUTES FOR NON-PEMC USERS
export const REGISTRATION_TP = {

}

export const REGISTRATION_MSP = {

}

export const PhaseOneRoutes = {
    HOME: `${environment.__PHASE_ONE_URL__}/#/`,
    NOTIFICATION: `${environment.__PHASE_ONE_URL__}/#/notifications`,
    REGISTRATION_PEMC: REGISTRATION_PEMC,
    REGISTRATION_TP: REGISTRATION_TP,
    REGISTRATION_MSP: REGISTRATION_MSP
}

export const PhaseTwoRoutes = {
    
}