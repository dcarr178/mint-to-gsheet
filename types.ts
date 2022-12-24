/*
@OnlyCurrentDoc
*/
export namespace MintAccountAPI {
    export interface apiResponse {
        Account: Account[]
        metaData: MetaData2
    }

    export interface Account {
        type: string
        investmentType?: string
        marginBalance?: number
        dormant401K?: boolean
        metaData: MetaData
        id: string
        name: string
        value: number
        isVisible: boolean
        isDeleted: boolean
        planningTrendsVisible: boolean
        accountStatus: string
        systemStatus: string
        currency: string
        fiLoginId: string
        fiLoginStatus: string
        currentBalance: number
        cpId?: string
        cpAccountName: string
        cpAccountNumberLast4?: string
        hostAccount: boolean
        fiName: string
        accountTypeInt: number
        isAccountClosedByMint: boolean
        isAccountNotFound: boolean
        isActive: boolean
        isClosed: boolean
        isError: boolean
        isHiddenFromPlanningTrends: boolean
        isTerminal: boolean
        credentialSetId?: string
        ccAggrStatus?: string
        bankAccountType?: string
        availableBalance?: number
        interestRate?: number
        cpInterestRate?: number
        minimumNoFeeBalance?: number
        userMinimumNoFeeBalance?: number
        monthlyFee?: number
        userMonthlyFee?: number
        userFreeBillPay?: boolean
        userAtmFeeReimbursement?: boolean
        numOfTransactions?: number
        userCardType?: string
        creditAccountType?: string
        creditLimit?: number
        availableCredit?: number
        minPayment?: number
        absoluteMinPayment?: number
        statementMinPayment?: number
        statementDueDate?: string
        statementDueAmount?: number
        userRewardsType?: string
        rewardsRate?: number
        annualFee?: number
        loanType?: string
        loanTermType?: string
        loanInterestRateType?: string
        principalBalance?: number
        originationDate?: string
        realEstateType?: string
        realEstateTypeDesc?: string
        realEstateValueProviderType?: string
        accountDescription?: string
        providerValue?: number
        propertyType?: string
        userAddress?: string
        userZip?: string
        cyberHomesAddress?: string
        cyberHomesCity?: string
        cyberHomesState?: string
        cyberHomesZip?: string
        associatedLoanAccounts?: AssociatedLoanAccount[]
    }

    export interface MetaData {
        createdDate: string
        lastUpdatedDate: string
        link: Link[]
    }

    export interface Link {
        otherAttributes: OtherAttributes
        href: string
        rel: string
    }

    export interface OtherAttributes {
    }

    export interface AssociatedLoanAccount {
        id: number
    }

    export interface MetaData2 {
        asOf: string
        totalSize: number
        pageSize: number
        currentPage: number
        offset: number
        limit: number
        link: Link2[]
    }

    export interface Link2 {
        otherAttributes: OtherAttributes2
        href: string
        rel: string
    }

    export interface OtherAttributes2 {
        method: string
    }

}

export namespace MintInvestmentAPI {
    export interface apiResponse {
        Investment: Investment[]
        metaData: MetaData2
    }

    export interface Investment {
        accountId: string
        cpSymbol?: string
        symbol?: string
        cpSrcElementId: string
        description: string
        cpCusipNumber?: string
        cpAssetClass: string
        holdingType: string
        initialTotalCost: number
        inceptionDate: string
        initialQuantity: number
        currentQuantity: number
        currentPrice: number
        currentValue: number
        averagePricePaid: number
        idsInstrumentId?: string
        metaData: MetaData
        id: string
        weekStartPrice?: number
        weekEndPrice?: number
    }

    export interface MetaData {
        lastUpdatedDate: string
        link: Link[]
    }

    export interface Link {
        otherAttributes: OtherAttributes
        href: string
        rel: string
    }

    export interface OtherAttributes {
    }

    export interface MetaData2 {
        totalSize: number
        pageSize: number
        currentPage: number
        offset: number
        limit: number
        link: Link2[]
    }

    export interface Link2 {
        otherAttributes: OtherAttributes2
        href: string
        rel: string
    }

    export interface OtherAttributes2 {
        method: string
    }

}

export namespace MintTransactionAPI {
    export interface apiResponse {
        Transaction: Transaction[]
        aggregate: Aggregate
        metaData: MetaData2
    }

    export interface Transaction {
        type: string
        metaData: MetaData
        id: string
        accountId: string
        accountRef: AccountRef
        date: string
        description: string
        category: Category
        amount: number
        status: string
        matchState: string
        fiData: FiData
        merchantId?: number
        etag: string
        isExpense: boolean
        isPending: boolean
        discretionaryType: string
        isLinkedToRule: boolean
        transactionReviewState: string
        isReviewed?: boolean
        price?: number
        quantity?: number
        commission?: number
        transactionDescriptionRuleId?: string
        symbol?: string
    }

    export interface MetaData {
        lastUpdatedDate: string
        link: Link[]
        createdDate?: string
    }

    export interface Link {
        otherAttributes: OtherAttributes
        href: string
        rel: string
    }

    export interface OtherAttributes {
    }

    export interface AccountRef {
        id: string
        name: string
        type: string
        hiddenFromPlanningAndTrends: boolean
    }

    export interface Category {
        id: string
        name: string
        categoryType: string
        parentId: string
        parentName: string
    }

    export interface FiData {
        date: string
        amount: number
        description: string
        inferredDescription: string
        inferredCategory: InferredCategory
        id?: string
    }

    export interface InferredCategory {
        id: string
        name: string
    }

    export interface Aggregate {
        totalAmount: number
    }

    export interface MetaData2 {
        asOf: string
        totalSize: number
        pageSize: number
        currentPage: number
        offset: number
        limit: number
        link: Link2[]
        sortBy: string
    }

    export interface Link2 {
        otherAttributes: OtherAttributes2
        href: string
        rel: string
    }

    export interface OtherAttributes2 {
        method?: string
    }

}

export namespace MintCreditAccountsAPI {
    export interface apiResponse {
        tradeLine: TradeLine[]
    }

    export interface TradeLine {
        id: string
        subscriberName: string
        typeOfAccount: TypeOfAccount
        dateOpened: string
        kindOfBusiness: KindOfBusiness
        amount: string
        accountCondition: string
        accountStatus: string
        currentBalance: string
        paymentHistory: string
        creditReportId: string
        paymentFrequency: PaymentFrequency
        highCreditAmount: string
        pastDueAmount: string
        dateReported: string
        creditorName: string
        creditLimit: string
        termsFrequency: TermsFrequency
        termsDuration: string
        dateOfLastPayment?: string
        historyDerogatoryCounters: HistoryDerogatoryCounters
        portfolioType: PortfolioType
        isClosed: boolean
        aggregateCreditUtilizationIncluded: boolean
        creditUtilization: string
        detailedPaymentHistories: DetailedPaymentHistories
        paymentStatus: PaymentStatus
        computedStatus: string
        monthlyPaymentAmount: string
        responsibility: Responsibility
        dateClosed?: string
        comments?: Comment[]
    }

    export interface TypeOfAccount {
        code: string
        description: string
    }

    export interface KindOfBusiness {
        code: string
        description: string
    }

    export interface PaymentFrequency {
        code: string
        description: string
    }

    export interface TermsFrequency {
        code: string
        description: string
    }

    export interface HistoryDerogatoryCounters {
        count30DayPastDue: string
        count60DayPastDue: string
        count90DayPastDue: string
    }

    export interface PortfolioType {
        code: string
        description: string
    }

    export interface DetailedPaymentHistories {
        latePaymentCount: number
        totalPaymentCount: number
        detailedPaymentHistory: DetailedPaymentHistory[]
    }

    export interface DetailedPaymentHistory {
        year: string
        months: Month[]
    }

    export interface Month {
        name: string
        status: string
    }

    export interface PaymentStatus {
        code: string
        description: string
    }

    export interface Responsibility {
        code: string
        description: string
    }

    export interface Comment {
        code: string
        description: string
    }

}

export namespace MintCreditReportsAPI {
    export interface apiResponse {
        vendorReports: VendorReport[]
    }

    export interface VendorReport {
        creditScoreProviderRef: CreditScoreProviderRef
        creditReportList: CreditReportList[]
    }

    export interface CreditScoreProviderRef {
        id: number
        name: string
    }

    export interface CreditReportList {
        metaData: MetaData
        id: string
        refreshStatus: RefreshStatus
        refreshDate: string
        nextRefreshDate: string
        creditScore: string
        bandReference: string
        creditScoreProviderRef: CreditScoreProviderRef2
        aggregates: Aggregates
    }

    export interface MetaData {
        link: Link[]
    }

    export interface Link {
        otherAttributes: OtherAttributes
        href: string
        rel: string
    }

    export interface OtherAttributes {
        method: string
    }

    export interface RefreshStatus {
        status: string
    }

    export interface CreditScoreProviderRef2 {
        id: number
        name: string
    }

    export interface Aggregates {
        creditUsage: CreditUsage
        paymentHistory: PaymentHistory
        ageOfCreditHistory: AgeOfCreditHistory
        totalAccounts: TotalAccounts
        creditInquiries: CreditInquiries
        derogatoryRemarks: DerogatoryRemarks
    }

    export interface CreditUsage {
        creditUtilizationPercentage: number
        creditUtilizationAmount: number
        creditLimit: number
        bandReference: string
    }

    export interface PaymentHistory {
        onTimePaymentsPercentage: number
        latePayments: number
        totalPayments: number
        bandReference: string
    }

    export interface AgeOfCreditHistory {
        averageAgeOfCredit: number
        averageAgeOfCreditAge: string
        newestCreditLine: string
        oldestCreditLine: string
        newestCreditLineAge: string
        oldestCreditLineAge: string
        bandReference: string
    }

    export interface TotalAccounts {
        totalAccounts: number
        openAccounts: number
        closedAccounts: number
        bandReference: string
    }

    export interface CreditInquiries {
        creditInquiries: number
        oldestInquiry: string
        newestInquiry: string
        oldestInquiryAge: string
        newestInquiryAge: string
        bandReference: string
    }

    export interface DerogatoryRemarks {
        totalDerogatoryRemarks: number
        totalPublicRecords: number
        collectionAccounts: number
        bandReference: string
        bankruptAccounts: number
        foreclosureAccounts: number
        pastDueAmountAccounts: number
        historyDerogatoryCountersAccounts: number
        majorDelinquencyReportedAccounts: number
    }

}

export namespace MintCreditUtilizationAPI {
    export interface apiResponse {
        cumulative: Cumulative
        tradelines: Tradeline[]
    }

    export interface Cumulative {
        creditUtilization: CreditUtilization[]
    }

    export interface CreditUtilization {
        year: string
        months: Month[]
    }

    export interface Month {
        name: string
        creditUtilization: number
    }

    export interface Tradeline {
        creditorName: string
        kindOfBusiness: string
        dateOpened: string
        creditUtilization: CreditUtilization2[]
    }

    export interface CreditUtilization2 {
        year: string
        months: Month2[]
    }

    export interface Month2 {
        name: string
        creditUtilization: number
    }

}

export interface WorksheetValues {
    values: {
        [key: string]: any[]
    },
    numColumns: number
}

export interface FieldDictionary {
    [colNum: number]: {
        expression: string,
        type: "string"|"date",
        update: boolean,
        addNew: boolean
    }
}

export interface TransposedRow {
    name: string
    value: any
    id: string
}
