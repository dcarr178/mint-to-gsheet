import HttpMethod = GoogleAppsScript.URL_Fetch.HttpMethod
import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions
import * as types from "./types";
/*
@OnlyCurrentDoc
*/
/*
ATTENTION DEVELOPERS
The source code for this project is TypeScript found at https://github.com/dcarr178/mint-to-gsheet and was
deployed as Apps Script (JavaScript) to this Google Sheet using Clasp (https://github.com/google/clasp). Feel
free to make a copy of this Google Sheet and enhance/modify the Apps Script however you see fit. Alternatively, you
may branch or fork the GitHub project, make code changes, and deploy them to your Google Sheet using Clasp.

For reference https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app
*/
const workbook = SpreadsheetApp.getActiveSpreadsheet()

const globals = {
    cellImportAccounts: workbook.getRangeByName("import_accounts"),
    cellImportCredit: workbook.getRangeByName("import_credit"),
    cellImportInvestments: workbook.getRangeByName("import_investments"),
    cellImportTransactions: workbook.getRangeByName("import_transactions"),
    cellImportLoans: workbook.getRangeByName("import_loans"),
    cellSessionKey: workbook.getRangeByName("session_key"),
    cellSlackUrl: workbook.getRangeByName("slack_url"),
    cellUpdateTransactionsAfter: workbook.getRangeByName("update_transactions_after"),
    cellWorkbookUpdated: workbook.getRangeByName("workbook_updated"),
    sheetInstructions: workbook.getSheetByName("Instructions"),
    sheetNameAccounts: "Accounts",
    sheetNameInvestments: "Investments",
    sheetNameTransactions: "Transactions",
    sheetNameCreditAccounts: "Loans",
    sheetNameCreditReport: "Credit",
    
}

const mintData = {
    getAccounts: () => {
        const columns = [
            "Account",
            "Balance",
            "Bank",
            "Last Updated",
            "ID",
        ]

        // create worksheet
        const sheetName = globals.sheetNameAccounts
        const worksheet = workbook.getSheetByName(sheetName) || workbook.insertSheet(sheetName)
        const data = googleSheet.readWorksheet(worksheet)

        // get new values from Mint
        workbook.toast("Getting account balances from Mint", "Mint")
        const mintUrl = "https://mint.intuit.com/pfm/v1/accounts?offset=0&limit=1000"
        const apiResponse: types.MintAccountAPI.apiResponse = api.mint(mintUrl)
        for (const mintAccount of apiResponse.Account) {
            if (!mintAccount.isActive) continue
            const key = `a${mintAccount.id}`
            let column = 0
            if (!(key in data.values)) {
                data.values[key] = Array(data.numColumns)
            }
            data.values[key][column++] = mintAccount.name
            data.values[key][column++] = mintAccount.currentBalance
            data.values[key][column++] = mintAccount.fiName
            data.values[key][column++] = new Date(mintAccount.metaData.lastUpdatedDate)
            data.values[key][column++] = key
        }

        googleSheet.writeWorksheet(worksheet, data, columns)
    },
    getCreditReport: () => {
        const columns = null

        // create worksheet
        const sheetName = globals.sheetNameCreditReport
        const worksheet = workbook.getSheetByName(sheetName) || workbook.insertSheet(sheetName)
        const data: types.WorksheetValues = {
            values: {},
            numColumns: 2
        }

        // get new values from Mint
        workbook.toast("Getting credit report", "Mint")
        const mintUrl = "https://credit.finance.intuit.com/v1/creditreports?limit=1"
        const item: types.MintCreditReportsAPI.apiResponse = api.mint(mintUrl)
        let row = 0;
        utils.addKeyValue(data, row++, "my key", "my value")
        utils.addKeyValue(data, row++, "my key1", "my value1")
        utils.addKeyValue(data, row++, "my key2", "my value2")

        googleSheet.writeWorksheet(worksheet, data, columns)

    },
    getInvestments: () => {
        const columns = [
            "Investment",
            "Current Price",
            "Quantity",
            "Value",
            "Average Cost",
            "Cost Basis",
            "Gain (Loss)",
            "Description",
            "Asset Type",
            "Last Updated",
            "ID",
        ]

        // create worksheet
        const sheetName = globals.sheetNameInvestments
        const worksheet = workbook.getSheetByName(sheetName) || workbook.insertSheet(sheetName)
        const data = googleSheet.readWorksheet(worksheet)

        // get new values from Mint
        workbook.toast("Getting investment data from Mint", "Mint")
        const mintUrl = "https://mint.intuit.com/pfm/v1/investments"
        const apiResponse: types.MintInvestmentAPI.apiResponse = api.mint(mintUrl)
        for (const item of apiResponse.Investment) {
            const key = `a${item.id}`
            let column = 0;
            if (!(key in data.values)) {
                data.values[key] = Array(data.numColumns)
            }
            data.values[key][column++] = item.symbol || item.description
            data.values[key][column++] = item.currentPrice
            data.values[key][column++] = item.currentQuantity
            data.values[key][column++] = item.currentValue
            const pricePaid = Math.abs(item.averagePricePaid)
            data.values[key][column++] = pricePaid
            const costBasis = pricePaid * item.currentQuantity
            data.values[key][column++] = costBasis
            data.values[key][column++] = costBasis > 0 ? (item.currentValue / costBasis) - 1 : 0
            data.values[key][column++] = item.description
            data.values[key][column++] = item.holdingType
            data.values[key][column++] = new Date(item.metaData.lastUpdatedDate)
            data.values[key][column++] = key
        }

        googleSheet.writeWorksheet(worksheet, data, columns)

    },
    getLoans: () => {
        const columns = [
            "Lender",
            "Loan Type",
            "Current Balance",
            "Credit Limit",
            "Payment Amount",
            "Months",
            "Payments Made",
            "Past Due",
            "Late Payments",
            "Account Status",
            "Opened",
            "Last Payment",
            "Max Credit Used",
            "Last Updated",
            "ID"
        ]

        // create worksheet
        const sheetName = globals.sheetNameCreditAccounts
        const worksheet = workbook.getSheetByName(sheetName) || workbook.insertSheet(sheetName)
        const data = googleSheet.readWorksheet(worksheet)

        // get new values from Mint
        workbook.toast("Getting loans from Mint", "Mint")
        const mintUrl = "https://credit.finance.intuit.com/v1/creditreports/0/tradelines"
        const apiResponse: types.MintCreditAccountsAPI.apiResponse = api.mint(mintUrl)
        for (const item of apiResponse.tradeLine) {
            const key = `a${item.id}`
            let column = 0;
            if (!(key in data.values)) {
                data.values[key] = Array(data.numColumns)
            }
            data.values[key][column++] = item.creditorName // Lender
            data.values[key][column++] = item.typeOfAccount.description // Loan Type
            data.values[key][column++] = item.currentBalance // Current Balance
            data.values[key][column++] = item.creditLimit // Credit Limit
            data.values[key][column++] = item.monthlyPaymentAmount // Payment Amount
            data.values[key][column++] = item.termsDuration // Months
            data.values[key][column++] = item.detailedPaymentHistories.totalPaymentCount // Payments Made
            data.values[key][column++] = item.pastDueAmount // Amount Past Due
            data.values[key][column++] = item.detailedPaymentHistories.latePaymentCount // Late Payments
            data.values[key][column++] = item.accountCondition // Account Status
            data.values[key][column++] = new Date(item.dateOpened || "2000-01-01").toISOString().substring(0, 10) // Date Opened
            data.values[key][column++] = new Date(item.dateOfLastPayment || item.dateOpened).toISOString().substring(0, 10) // Last Payment
            data.values[key][column++] = item.highCreditAmount // Max Credit Used
            data.values[key][column++] = item.dateReported // Last Updated
            data.values[key][column++] = key // ID
        }

        googleSheet.writeWorksheet(worksheet, data, columns, 11, true)

    },
    getTransactions: () => {
        const columns = [
            "My Category",
            "My Description",
            "Date",
            "Amount",
            "Account",
            "Month",
            "Original Category",
            "Original Description",
            "Last Updated",
            "ID",
        ]

        // create worksheet
        const sheetName = globals.sheetNameTransactions
        const worksheet = workbook.getSheetByName(sheetName) || workbook.insertSheet(sheetName)
        const data = googleSheet.readWorksheet(worksheet)

        // get new values from Mint
        workbook.toast("Getting transactions from Mint", "Mint")
        const mintUrl = "https://mint.intuit.com/pfm/v1/transactions/search"
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const endDate = tomorrow.toISOString().substring(0, 10)
        const startDate = (new Date(globals.cellUpdateTransactionsAfter.getValue())).toISOString().substring(0, 10)
        const params = {
            limit: 50000,
            offset: 0,
            searchFilters: [],
            dateFilter: {
                type: "CUSTOM",
                endDate,
                startDate
            },
            "sort": "DATE_DESCENDING"
        }
        const apiResponse: types.MintTransactionAPI.apiResponse = api.mint(mintUrl, "post", params)
        for (const item of apiResponse.Transaction) {
            if (item.isPending) continue
            const key = `a${item.id}`
            let column = 0;
            if (!(key in data.values)) {
                data.values[key] = Array(data.numColumns)
                data.values[key][column++] = item.category.name
                data.values[key][column++] = item.description
            }
            column = 2
            data.values[key][column++] = new Date(item.date)
            data.values[key][column++] = item.amount
            data.values[key][column++] = item.accountRef.name
            data.values[key][column++] = item.date.substring(0, 7)
            data.values[key][column++] = item.category.name
            data.values[key][column++] = item.description
            data.values[key][column++] = item.metaData.lastUpdatedDate
            data.values[key][column++] = key
        }

        googleSheet.writeWorksheet(worksheet, data, columns, 2)

    },
    getAll: () => {
        if (globals.cellImportAccounts.getValue()) mintData.getAccounts()
        if (globals.cellImportInvestments.getValue()) mintData.getInvestments()
        if (globals.cellImportTransactions.getValue()) mintData.getTransactions()
        if (globals.cellImportLoans.getValue()) mintData.getLoans()
        if (globals.cellImportCredit.getValue()) mintData.getCreditReport()
        return "Workbook data updated"
    },
}

const googleSheet = {
    createMenu: () => {
        SpreadsheetApp.getUi()
            .createMenu('Mint')
            .addItem('Update accounts', 'mintData.getAccounts')
            .addItem('Update investments', 'mintData.getInvestments')
            .addItem('Update transactions', 'mintData.getTransactions')
            .addItem('Update loans', 'mintData.getLoans')
            .addItem('Update credit report', 'mintData.getLoans')
            .addItem('Update ALL', 'mintData.updateWorkbook')
            .addToUi();
    },
    readWorksheet: (worksheet: GoogleAppsScript.Spreadsheet.Sheet): types.WorksheetValues => {
        const valuesArray = worksheet.getDataRange().getValues()
        const numColumns = valuesArray[0].length
        const values = {}
        for (let i = 1; i < valuesArray.length; i++) {
            const row = valuesArray[i]
            const key = row[row.length - 1]
            values[key] = row
        }
        return {
            values,
            numColumns
        }
    },
    writeWorksheet: (worksheet: GoogleAppsScript.Spreadsheet.Sheet, data: types.WorksheetValues, columns: string[], sortColumn: number = 0, sortDescending = false) => {
        // put items in order
        const itemArray = Object.keys(data.values).map(key => data.values[key])
        itemArray.sort((a, b) => {
            let compare1 = a[sortColumn]
            let compare2 = b[sortColumn]
            if (sortDescending) {
                compare1 = b[sortColumn]
                compare2 = a[sortColumn]
            }
            console.log(`Compare ${compare1} to ${compare2} ${typeof compare1}`)
            if (typeof compare1 === 'string' || compare2 instanceof String) {
                return compare1.toLowerCase().localeCompare(compare2.toLowerCase())
            }
            return compare1 < compare2
        })

        // add columns as first item in list
        if (columns) {
            const columnRow = Array(data.numColumns)
            for (let i = 0; i < columns.length; i++) {
                columnRow[i] = columns[i]
            }
            itemArray.unshift(columnRow)
        }

        // write list to worksheet
        worksheet.getRange(
            1,
            1,
            itemArray.length,
            itemArray[0].length
        ).setValues(itemArray)
    },
    reset: () => {
        // TODO write reset function to clear data from the workbook
    }
}

const api = {
    mint: (url, method: HttpMethod = "get", payload: any = null): any => {
        const sessionKey = globals.cellSessionKey.getValue()

        // only run if session key exists
        if (!sessionKey) throw "Unable to update Mint session because the workbook contains no session credentials. Please log into Mint and paste your session credentials into this workbook on the Instructions worksheet."

        // pull API request headers out of session key
        const apiHeaders = eval(sessionKey)

        try {
            // send api call
            const params: URLFetchRequestOptions = {
                method: method,
                headers: apiHeaders
            }
            if (payload) {
                params.payload = JSON.stringify(payload)
                params.contentType = "application/json"
            }
            // console.log(UrlFetchApp.getRequest(url, params))
            // throw "Stop here"
            const apiResults = UrlFetchApp.fetch(url, params);
            const response = JSON.parse(apiResults.getContentText())

            // update last updated datetime
            const now = new Date()
            globals.cellWorkbookUpdated.setValue(now)

            // set cell and tab colors
            const greenColor = "#00ff00"
            globals.sheetInstructions.setTabColor(greenColor)
            globals.cellWorkbookUpdated.setBackground(greenColor)

            return response
        } catch (error) {
            console.log(error)

            // assume the session key is invalid and delete it, so we don't keep hammering the Mint api
            // todo uncomment this after i'm done testing
            // cellSessionKey.setValue("")

            // set cell and tab colors
            const redColor = "#FF0000"
            globals.cellWorkbookUpdated.setBackground(redColor)
            globals.sheetInstructions.setTabColor(redColor)

            const response = "Invalid Mint session credentials"
            slack.post(response)
            throw response
        }
    },
}

const slack = {
    post: (message: string) => {
        const slackUrl = globals.cellSlackUrl.getValue()
        if (slackUrl) {
            // post message to slack webhook url
            UrlFetchApp.fetch(slackUrl, {
                method: "post",
                payload: JSON.stringify({text: message})
            });
        }
    },
}

const utils = {
    addKeyValue: (obj: types.WorksheetValues, rowNum: number, key: any, value: any) => {
        const index = String(rowNum).padStart(8, "0")
        obj.values[index] = []
        obj.values[index][0] = key
        obj.values[index][1] = value
    },
}

const doGet = () => {
    /*
    This function gets called when you deploy the workbook Apps Script as a web service, and you use it as a REST API.
    This allows you to automate updates from Mint and helps keep your Mint session key valid indefinitely.
    */
    const response = mintData.getAll()
    return ContentService.createTextOutput(response)
}

const onOpen = () => {
    /*
    This function runs every time you open the Google Sheet.
    */
    googleSheet.createMenu()
}

// @ts-ignore
fetch = (url, params) => {
    /*
    This overrides the Javascript fetch function so that we can extract the headers we need out of the Mint fetch command
    */
    const headers = params["headers"]
    return {
        authorization: headers["authorization"],
        intuit_tid: headers["intuit_tid"],
        cookie: headers["cookie"],
        accept: "application/json",
        Referer: headers["Referer"],
    }
}





