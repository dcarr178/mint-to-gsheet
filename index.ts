import HttpMethod = GoogleAppsScript.URL_Fetch.HttpMethod
import * as types from "./types";
import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions
/*
@OnlyCurrentDoc
*/

/***************************************************
 Global variables
 ****************************************************/
const workbook = SpreadsheetApp.getActiveSpreadsheet()
const cellImportAccounts = workbook.getRangeByName("import_accounts")
const cellImportCredit = workbook.getRangeByName("import_credit")
const cellImportInvestments = workbook.getRangeByName("import_investments")
const cellImportTransactions = workbook.getRangeByName("import_transactions")
const cellSessionKey = workbook.getRangeByName("session_key")
const cellSessionUpdated = workbook.getRangeByName("session_updated")
const cellSlackUrl = workbook.getRangeByName("slack_url")
const cellUpdateTransactionsAfter = workbook.getRangeByName("update_transactions_after")
const cellWorkbookUpdated = workbook.getRangeByName("workbook_updated")
const sheetInstructions = workbook.getSheetByName("Instructions")
const sheetNameAccounts = "Accounts"
const sheetNameInvestments = "Investments"
const sheetNameTransactions = "Transactions"


// @ts-ignore
fetch = (url, params) => {
    // this overrides the Javascript fetch function so that we can pull the headers out of the Mint session key
    const headers = params["headers"]
    return {
        authorization: headers["authorization"],
        intuit_tid: headers["intuit_tid"],
        cookie: headers["cookie"],
        accept: "application/json",
        Referer: headers["Referer"],
    }
}

const postToSlack = (message: string) => {
    const slackUrl = cellSlackUrl.getValue()
    if (slackUrl) {
        // post message to slack webhook url
        UrlFetchApp.fetch(slackUrl, {
            method: "post",
            payload: JSON.stringify({text: message})
        });
    }
}

const callMintAPI = (url, method: HttpMethod = "get", payload: any = null): any => {
    const sessionKey = cellSessionKey.getValue()

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
        cellSessionUpdated.setValue(now)

        // set cell and tab colors
        const greenColor = "#00ff00"
        sheetInstructions.setTabColor(greenColor)
        cellSessionUpdated.setBackground(greenColor)

        return response
    } catch (error) {
        console.log(error)

        // assume the session key is invalid and delete it, so we don't keep hammering the Mint api
        // todo uncomment this after i'm done testing
        // cellSessionKey.setValue("")

        // set cell and tab colors
        const redColor = "#FF0000"
        cellSessionUpdated.setBackground(redColor)
        sheetInstructions.setTabColor(redColor)

        const response = "Invalid Mint session credentials"
        postToSlack(response)
        throw response
    }
}

const readValuesFromWorksheet = (worksheet: GoogleAppsScript.Spreadsheet.Sheet): types.WorksheetValues => {
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
}

const writeDataToWorksheet = (worksheet: GoogleAppsScript.Spreadsheet.Sheet, data: types.WorksheetValues, columns: string[], sortColumn: number = 0, sortDescending = false) => {
    // put items in order
    const itemArray = Object.keys(data.values).map(key => data.values[key])
    itemArray.sort((a, b) => {
        let compare1 = a[sortColumn]
        let compare2 = b[sortColumn]
        if (sortDescending) {
            compare1 = b[sortColumn]
            compare2 = a[sortColumn]
        }
        if (typeof compare1 === 'string' || compare2 instanceof String) {
            return compare1.toLowerCase().localeCompare(compare2.toLowerCase())
        }
        return compare1 < compare2
    })

    // add columns as first item in list
    const columnRow = Array(data.numColumns)
    for (let i = 0; i < columns.length; i++) {
        columnRow[i] = columns[i]
    }
    itemArray.unshift(columnRow)

    // write list to worksheet
    worksheet.getRange(
        1,
        1,
        itemArray.length,
        itemArray[0].length
    ).setValues(itemArray)
}


/***************************************************
 Unused functions
 ****************************************************/
/*
const updateMintDataFromBanks = () => {
    /!*
    This url is what the mintapi library uses but it errors when I try to run it. Mint supposedly updates
    data every day automatically.
    *!/
    let response = "Updating Mint data from banks"
    try {
        const mintUrl = "https://mint.intuit.com/refreshFILogins.xevent"
        callMintAPI(mintUrl, "post")
    } catch (error) {
        response = error
    }
    workbook.toast(response, "Mint")
    return response
}
*/

/***************************************************
 GUI functions
 ****************************************************/
const createCustomMenu = () => {
    SpreadsheetApp.getUi()
        .createMenu('Mint')
        .addItem('Update workbook data from Mint', 'updateWorkbookDataFromMint')
        .addItem('Keep mint session alive', 'keepMintSessionAlive')
        .addToUi();
}

const doGet = (e) => {
    const params = e.parameter
    let response
    if ("update-workbook-data" in params) {
        response = updateWorkbookDataFromMint()
        // } else if ("update-mint-data" in params) {
        //     response = updateMintDataFromBanks()
    } else {
        response = keepMintSessionAlive()
    }
    return ContentService.createTextOutput(response);
}

const onOpen = () => {
    createCustomMenu()
}

const updateWorkbookDataFromMint = () => {
    let response = "Updating workbook data from Mint"

    if (cellImportAccounts.getValue()) getAccountData()
    if (cellImportInvestments.getValue()) getInvestmentData()
    if (cellImportTransactions.getValue()) getTransactionData()
    if (cellImportCredit.getValue()) getCreditData()

    // update last updated datetime
    const now = new Date()
    cellWorkbookUpdated.setValue(now)

    return response
}


/***************************************************
 Mint API functions
 ****************************************************/
// for reference https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app
const getAccountData = () => {
    const columns = [
        "Account",
        "Balance",
        "Bank",
        "Last Updated",
        "ID",
    ]

    // create worksheet
    const sheetName = sheetNameAccounts
    const worksheet = workbook.getSheetByName(sheetName) || workbook.insertSheet(sheetName)
    const data = readValuesFromWorksheet(worksheet)

    // get new values from Mint
    workbook.toast("Getting account balances from Mint", "Mint")
    const mintUrl = "https://mint.intuit.com/pfm/v1/accounts?offset=0&limit=1000"
    const apiResponse: types.MintAccountAPI.apiResponse = callMintAPI(mintUrl)
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

    writeDataToWorksheet(worksheet, data, columns)
}
const getInvestmentData = () => {
    const columns = [
        "Asset",
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
    const sheetName = sheetNameInvestments
    const worksheet = workbook.getSheetByName(sheetName) || workbook.insertSheet(sheetName)
    const data = readValuesFromWorksheet(worksheet)

    // get new values from Mint
    workbook.toast("Getting investment data from Mint", "Mint")
    const mintUrl = "https://mint.intuit.com/pfm/v1/investments"
    const apiResponse: types.MintInvestmentAPI.apiResponse = callMintAPI(mintUrl)
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

    writeDataToWorksheet(worksheet, data, columns)

}
const getTransactionData = () => {
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
    const sheetName = sheetNameTransactions
    const worksheet = workbook.getSheetByName(sheetName) || workbook.insertSheet(sheetName)
    const data = readValuesFromWorksheet(worksheet)

    // get new values from Mint
    workbook.toast("Getting transactions from Mint", "Mint")
    const mintUrl = "https://mint.intuit.com/pfm/v1/transactions/search"
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const endDate = tomorrow.toISOString().substring(0, 10)
    const startDate = (new Date(cellUpdateTransactionsAfter.getValue())).toISOString().substring(0, 10)
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
    const apiResponse: types.MintTransactionAPI.apiResponse = callMintAPI(mintUrl, "post", params)
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

    writeDataToWorksheet(worksheet, data, columns, 2)

}
const getCreditData = () => {
    workbook.toast("Getting credit score from Mint", "Mint")
}

const keepMintSessionAlive = () => {

    let response = "Updated Mint session"
    try {
        const mintUrl = "https://mint.intuit.com/pfm/v1/accounts?offset=0&limit=1"
        callMintAPI(mintUrl)
    } catch (error) {
        response = error
    }
    workbook.toast(response, "Mint")
    return response
}



