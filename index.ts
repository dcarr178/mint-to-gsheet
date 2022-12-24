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

// access the current Google Sheet
const workbook = SpreadsheetApp.getActiveSpreadsheet()

const globals = {
    // reference all the named ranges in one place to make changes easier
    namedRange: {
        ImportAccounts: workbook.getRangeByName("import_accounts"),
        ImportCredit: workbook.getRangeByName("import_credit"),
        ImportInvestments: workbook.getRangeByName("import_investments"),
        ImportTransactions: workbook.getRangeByName("import_transactions"),
        ImportLoans: workbook.getRangeByName("import_loans"),
        SessionKey: workbook.getRangeByName("session_key"),
        SlackUrl: workbook.getRangeByName("slack_url"),
        UpdateTransactionsAfter: workbook.getRangeByName("update_transactions_after"),
        WorkbookUpdated: workbook.getRangeByName("workbook_updated"),
        FastUpdate: workbook.getRangeByName("fast_update"),
    },
    sheetName: {
        Accounts: workbook.getRangeByName("sheet_accounts").getValue(),
        Credit: workbook.getRangeByName("sheet_credit").getValue(),
        Investments: workbook.getRangeByName("sheet_investments").getValue(),
        Loans: workbook.getRangeByName("sheet_loans").getValue(),
        Transactions: workbook.getRangeByName("sheet_transactions").getValue(),
    },
    sheet: {
        Instructions: workbook.getSheetByName("Instructions"),
    }
}

const mintData = {
    getAccounts: () => {
        workbook.toast("Getting account balances", "Mint")
        const mintUrl = "https://mint.intuit.com/pfm/v1/accounts?offset=0&limit=1000"
        const apiResponse: types.MintAccountAPI.apiResponse = api.mint(mintUrl)
        utils.updateSheet(apiResponse.Account, globals.sheetName.Accounts)
    },
    getCredit: () => {
        const mintUrl = "https://credit.finance.intuit.com/v1/creditreports?limit=1"
        workbook.toast("Getting credit report", "Mint")
        const creditReport: types.MintCreditReportsAPI.apiResponse = api.mint(mintUrl)
        const reports = creditReport.vendorReports
        if (!reports.length) return
        const items = utils.transpose(reports[0].creditReportList[0])
        utils.updateSheet(items, globals.sheetName.Credit, "item.id", "no-sort")
    },
    getInvestments: () => {
        workbook.toast("Getting investments", "Mint")
        const mintUrl = "https://mint.intuit.com/pfm/v1/investments"
        const apiResponse: types.MintInvestmentAPI.apiResponse = api.mint(mintUrl)
        utils.updateSheet(apiResponse.Investment, globals.sheetName.Investments)
    },
    getLoans: () => {
        workbook.toast("Getting loans", "Mint")
        const mintUrl = "https://credit.finance.intuit.com/v1/creditreports/0/tradelines"
        const apiResponse: types.MintCreditAccountsAPI.apiResponse = api.mint(mintUrl)
        utils.updateSheet(apiResponse.tradeLine, globals.sheetName.Loans)
    },
    getTransactions: () => {
        workbook.toast("Getting transactions", "Mint")
        const mintUrl = "https://mint.intuit.com/pfm/v1/transactions/search"
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const endDate = tomorrow.toISOString().substring(0, 10)
        const startDate = (new Date(globals.namedRange.UpdateTransactionsAfter.getValue())).toISOString().substring(0, 10)
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
        utils.updateSheet(apiResponse.Transaction, globals.sheetName.Transactions)
    },
    getAll: () => {
        if (globals.namedRange.ImportAccounts.getValue()) mintData.getAccounts()
        if (globals.namedRange.ImportCredit.getValue()) mintData.getCredit()
        if (globals.namedRange.ImportInvestments.getValue()) mintData.getInvestments()
        if (globals.namedRange.ImportLoans.getValue()) mintData.getLoans()
        if (globals.namedRange.ImportTransactions.getValue()) mintData.getTransactions()
        return "Workbook data updated"
    },
}

const googleSheet = {
    createMenu: () => {
        SpreadsheetApp.getUi()
            .createMenu('Mint')
            .addItem('Update accounts', 'mintData.getAccounts')
            .addItem('Update credit', 'mintData.getCredit')
            .addItem('Update investments', 'mintData.getInvestments')
            .addItem('Update loans', 'mintData.getLoans')
            .addItem('Update transactions', 'mintData.getTransactions')
            .addItem('Update ALL', 'mintData.getAll')
            .addToUi();
    },
    clearWorksheetData: (sheetName: string) => {
        const sheet = workbook.getSheetByName(sheetName)
        if (!sheet) return
        const firstDataRow = (sheet.getFrozenRows() || 1) + 1
        const lastDataRow = sheet.getLastRow()
        const lastDataColumn = sheet.getLastColumn()
        sheet.getRange(firstDataRow, 1, lastDataRow, lastDataColumn).clearContent()
        sheet.getRange(firstDataRow, 1).activate()
    },
    clearWorkbookData: () => {
        googleSheet.clearWorksheetData(globals.sheetName.Accounts)
        googleSheet.clearWorksheetData(globals.sheetName.Investments)
        googleSheet.clearWorksheetData(globals.sheetName.Loans)
        googleSheet.clearWorksheetData(globals.sheetName.Transactions)

        // for transposed worksheets we only want to clear column B
        const sheet = workbook.getSheetByName(globals.sheetName.Credit)
        const firstDataRow = (sheet.getFrozenRows() || 1) + 1
        const lastDataRow = sheet.getLastRow()
        sheet.getRange(firstDataRow, 2, lastDataRow, 1).clearContent()
        sheet.getRange(firstDataRow, 1).activate()

        // clear workbook and cell colors
        globals.namedRange.WorkbookUpdated.setValue("Never")
        globals.namedRange.WorkbookUpdated.setBackground(null)
        globals.namedRange.SessionKey.setValue("")
        globals.namedRange.SlackUrl.setValue("")
        globals.sheet.Instructions.setTabColor(null)
        globals.sheet.Instructions.getRange(1, 1).activate()

    }
}

const api = {
    mint: (url, method: HttpMethod = "get", payload: any = null): any => {
        const sessionKey = globals.namedRange.SessionKey.getValue()

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
            const apiResults = UrlFetchApp.fetch(url, params);
            const response = JSON.parse(apiResults.getContentText())

            // update last updated datetime
            const now = new Date()
            globals.namedRange.WorkbookUpdated.setValue(now)

            // set cell and tab colors
            const greenColor = "#00ff00"
            globals.sheet.Instructions.setTabColor(greenColor)
            globals.namedRange.WorkbookUpdated.setBackground(greenColor)

            return response
        } catch (error) {
            console.log(error)

            // assume the session key is invalid and delete it, so we don't keep hammering the Mint api
            globals.namedRange.SessionKey.setValue("")

            // set cell and tab colors
            const redColor = "#FF0000"
            globals.namedRange.WorkbookUpdated.setBackground(redColor)
            globals.sheet.Instructions.setTabColor(redColor)

            const response = "Invalid Mint session credentials"
            slack.post(response)
            throw response
        }
    },
}

const slack = {
    post: (message: string) => {
        const slackUrl = globals.namedRange.SlackUrl.getValue()
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
    flattenObj: ob => {
        const result = {};
        for (const i in ob) {
            if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i])) {
                const temp = utils.flattenObj(ob[i]);
                for (const j in temp) {
                    result[i + '.' + j] = temp[j];
                }
            } else {
                result[i] = ob[i];
            }
        }
        return result
    },
    updateSheet: (items: any, sheetName: string, key = "item.id", defaultSortField = "name", defaultSortDirection = "A") => {

        // create worksheet
        let worksheet = workbook.getSheetByName(sheetName)
        let writeHeader = false
        if (!worksheet) {
            worksheet = workbook.insertSheet(sheetName)
            worksheet.setFrozenRows(2)
            writeHeader = true
        }
        const headerRowNum = worksheet.getFrozenRows() || 2
        let numRows = worksheet.getLastRow() || 2
        let numCols = worksheet.getLastColumn() || 1
        const fields: types.FieldDictionary = {}
        const keys = {}
        let keyColNum = 1
        const sortArray = []
        let addNew: boolean
        let foundNew = false
        const fastUpdate = globals.namedRange.FastUpdate.getValue()
        const fastUpdateValues = worksheet.getRange(headerRowNum + 1, 1, numRows, numCols).getValues()

        // write new values
        let itemNum = 0
        for (const item of items) {
            itemNum++

            // create header row if needed
            if (writeHeader) {
                const flat = utils.flattenObj(item)
                let numCols = 0
                for (const field in flat) {
                    numCols++
                    const noteCell = worksheet.getRange(1, numCols)
                    const labelCell = worksheet.getRange(2, numCols)
                    const fieldName = `item.${field}`
                    if (fieldName == key) keyColNum = numCols
                    let note = fieldName
                    if (field == defaultSortField) {
                        note += "||sort" + defaultSortDirection
                        sortArray.push({column: numCols, ascending: true})
                    } else if (field.includes("Date")) {
                        note += "||date"
                    }
                    labelCell.setValue(fieldName)
                    // labelCell.setNote(note)
                    noteCell.setValue(note)
                    fields[numCols] = {
                        expression: fieldName,
                        type: "string",
                        update: true,
                        addNew: true
                    }
                }
                writeHeader = false
            }

            // things to only do once after we know what the rows are
            if (itemNum == 1) {

                // scan header rows to find fields to populate
                for (let colNum = 1; colNum <= numCols; colNum++) {
                    const note = worksheet.getRange(headerRowNum - 1, colNum).getValue().trim()
                    if (note) {
                        const [field, paramString] = note.split("||")
                        const params = paramString ? paramString.split(",") : []
                        fields[colNum] = {
                            expression: field,
                            type: "string",
                            update: true,
                            addNew: true
                        }
                        if (params.includes("sortA")) {
                            sortArray.push({column: colNum, ascending: true})
                        }
                        if (params.includes("sortD")) {
                            sortArray.push({column: colNum, ascending: false})
                        }
                        if (params.includes("date")) {
                            fields[colNum].type = "date"
                        }
                        if (params.includes("Date")) {
                            fields[colNum].type = "date"
                        }
                        if (params.includes("no-update")) {
                            fields[colNum].update = false
                        }
                        if (params.includes("no-new")) {
                            fields[colNum].addNew = false
                        }
                        if (field == key) {
                            keyColNum = colNum
                            addNew = fields[colNum].addNew
                        }
                    }
                }

                // create key dictionary
                for (let rowNum = headerRowNum + 1; rowNum <= numRows; rowNum++) {
                    const cellKeyValue = worksheet.getRange(rowNum, keyColNum).getValue()
                    if (cellKeyValue) keys[cellKeyValue] = rowNum
                }
            }

            // add a char to the beginning of an id so that the sheet interprets it as a string not a number
            eval(`${key} = "a" + ${key}`)

            // write updates to cells
            const itemKey = eval(key)
            let rowNum = 0
            let isNew = false
            if (itemKey in keys) {
                rowNum = keys[itemKey]
            } else {
                if (addNew) {
                    foundNew = true
                    rowNum = ++numRows
                    isNew = true

                    if (fastUpdate) {
                        fastUpdateValues.push(Array(numCols))
                    } else {
                        // add row and remove header formatting from new row
                        worksheet.insertRowAfter(numRows + 1)
                        const range = worksheet.getRange(rowNum, 1, rowNum, numCols)
                        range.setBackground(null)
                        range.setFontWeight("normal")
                    }
                }
            }
            for (const colNum in fields) {
                const f = fields[colNum]
                if (isNew == false && f.update == false) continue // do not update field if we are not supposed to
                if (!rowNum) continue
                let value = eval(f.expression)
                // if (f.type == "date") value = (new Date(value)).toISOString().replace(/[TZ]/g, " ") // unfortunately this reports in a different timezone than the user has
                if (f.type == "date") value = new Date(value)
                if (fastUpdate) {
                    // update data array and write it later
                    fastUpdateValues[rowNum - headerRowNum - 1][parseInt(colNum) - 1] = value
                } else {
                    // write one cell at a time. Danger: formulas will be replaced with values
                    worksheet.getRange(rowNum, parseInt(colNum)).setValue(value)
                }
            }
        }

        if (fastUpdate) {
            // set worksheet values all at once instead of one at a time
            worksheet.getRange(headerRowNum + 1, 1, fastUpdateValues.length, fastUpdateValues[0].length).setValues(fastUpdateValues)
        }

        // sort range
        if (sortArray.length) {
            if (foundNew) worksheet.insertRowAfter(numRows)
            const sortFrom = headerRowNum + 1
            if (numRows > sortFrom) worksheet.getRange(sortFrom, 1, numRows, numCols).sort(sortArray)
        }
    },
    transpose: (obj: object): types.TransposedRow[] => {
        const flat = utils.flattenObj(obj)
        const items: types.TransposedRow[] = []
        for (const key in flat) {
            items.push({
                name: key,
                value: flat[key],
                id: key,
            })
        }
        return items
    }
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

// make nested functions visible to the Apps Script console if you want to run them manually
const clearWorkbookData = () => {
    googleSheet.clearWorkbookData()
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





