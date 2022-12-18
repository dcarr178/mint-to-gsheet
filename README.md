# Mint to Google Sheet

## Background

Consumers wanting to do advanced personal finance, budgeting, or financial analysis and modeling need aggregated
financial data from the banks and other institutions they do business with. For example, a consumer’s total financial
picture may include

* One or more brokerage accounts at Charles Schwab, E-trade, or another bank
* One or more IRA, 401k, or Roth IRA accounts at multiple banks in your name and/or your partner’s name
* One or more Health Savings accounts at multiple banks
* A checking account with a local bank and checking accounts with national banks
* Life insurance policies with cash balances
* Credit cards with various banks and companies
* Car loans and mortgages with various banks, credit unions, and other lending institutions
* To get a full view of one’s financial picture, a consumer needs secure and open APIs to each of the banks they do
  business with. Unfortunately, most banks do not offer consumer APIs but only support giant data aggregators such as
  Intuit, eMoney Advisor, or Envestnet Yodlee.
* eMoney Advisor and Envestnet Yodlee are geared toward institutional money managers and charge high fees for data
  access. They offer no consumer-level access or APIs that consumers can use.
* Intuit Mint, on the other hand, is geared toward consumers and offers free accounts. However, the aggregated data
  Intuit pulls from YOUR banks on YOUR behalf and with YOUR permission is only accessible via Intuit’s browser or mobile
  applications. Mint’s applications are great in many ways but are also quite constrained and limited for advanced
  budgeting, financial planning, and analysis.

## Goals

This project aims to automatically extract your aggregated financial data from Mint as frequently as you like into a
Google Sheet (aka workbook) where you can do account grouping, vlookups, formulas, pivot tables, and all manner of
advanced functionality. This gives you a place to do all your financial modeling and create your own dashboards and
charts. You can even write Javascript code to perform advanced processing on your data, send email alerts to yourself
based on financial conditions, etc.

## Architecture

We made specific architecture and design tradeoffs to ensure that this project could be useful to a broad spectrum
of technical and non-technical users using free, widely-available cloud resources. In other words, you don't need
your own server or compute resources to use it.

The source code for this project is TypeScript found at https://github.com/dcarr178/mint-to-gsheet and can be
deployed as Apps Script (JavaScript) to any Google Sheet using Clasp (https://github.com/google/clasp). Once deployed,
all the code runs entirely within the Google Sheet and users can make unlimited copies of each Sheet. Technical users
are welcome to enhance/modify the Apps Script within their own Google Sheet. Alternatively, they may branch or fork the
GitHub project, make code changes, and deploy them independently Google Sheets using Clasp.

# Documentation

In keeping with the design and purpose of this project, all further documentation will be maintained 
[on Google Docs](https://docs.google.com/document/d/1HeN4Jo0_pgtT2HskRtB7eqV4RLec7R9Izxd-XjxdGO8/edit?usp=sharing)
so that non-technical users don't need to access the code repository if they don't want to.

# Deployment

You will need a variable `your_script_id` to use below. Find your script id this way:

1. Open
   [the Mint to Google Sheet workbook](https://docs.google.com/spreadsheets/d/1j6m9DPJfggGm9_QKYg6inT_xDkqyOwE8uP56hLfZpVQ/edit?usp=sharing)
2. Make a copy for yourself
3. Click `Extensions` menu, then `Apps Script`
4. Click `Project Settings` (the gear icon)
5. Scroll down and copy the `Script ID`

You will also need to verify [the Google Apps Script API](https://script.google.com/home/usersettings) is turned on for
your account.

```bash
# clone the code repository
git clone https://github.com/dcarr178/mint-to-gsheet.git
cd mint-to-gsheet

# install code dependencies
npm install

# log into your google account
npx clasp login

# connect clasp to your Google Sheet
npx clasp clone <your_script_id>

# delete any js files that clasp downloaded - Clasp will compile again on push
rm -rf *.js

# branch
git checkout -b your_branch_name

# edit/enhance the .ts files as you see fit 

# no need to compile/tsc your typescript files - clasp will do it automatically
npx clasp push

# open the google sheet
npx clasp open

```
