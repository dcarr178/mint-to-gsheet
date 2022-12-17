# Mint to Google Sheet

# Background

Consumers wanting to do advanced personal finance, budgeting, or financial analysis and modeling need aggregated
financial data from the banks and other institutions they do business with. For example, a consumer’s total financial
picture may include

- One or more brokerage accounts at Charles Schwab, E-trade, or another bank
- One or more IRA, 401k, or Roth IRA accounts at multiple banks in your name and/or your partner’s name
- One or more Health Savings accounts at multiple banks
- A checking account with a local bank and checking accounts with national banks
- Life insurance policies with cash balances
- Credit cards with various banks and companies
- Car loans and mortgages with various banks, credit unions, and other lending institutions

To get a full view of one’s financial picture, a consumer needs secure and open APIs to each of the banks they
do business with. Unfortunately, most banks do not offer consumer APIs but only support giant data aggregators
such as Intuit, eMoney Advisor, or Envestnet Yodlee.

eMoney Advisor and Envestnet Yodlee are geared toward institutional money managers and charge high fees for data
access. They offer no consumer-level access or APIs that consumers can use.

Intuit Mint, on the other hand, is geared toward consumers and offers free accounts. However, the aggregated data Intuit
pulls from YOUR banks on YOUR behalf and with YOUR permission is only accessible via Intuit’s browser or mobile
applications. Mint’s applications are great in many ways but are also quite constrained and limited for advanced
budgeting, financial planning, and analysis.

# Purpose of this project

The purpose of this project is to extract your aggregated financial data from Mint automatically, as frequently as you
like, into a Google Sheet (aka workbook) where you could do account grouping, vlookups, formulas, pivot tables, and all
manner of advanced functionality. This gives you a place to do all your financial modeling and create your own dashboard
and charts. You can even write your own Javascript code to perform advanced processing on your data, send email alerts
to yourself based on financial conditions, etc.

# How does it work?

Depending on your user type, the following features are available to you in order of increasing complexity.
Feel free to stop at any level you feel comfortable with. Of course, all of the source code is available in this code
repository (and inside the workbook) for you to see, but you don’t need to unless you want to.

### Level 1 user

Simply [open this workbook](https://docs.google.com/spreadsheets/d/1j6m9DPJfggGm9_QKYg6inT_xDkqyOwE8uP56hLfZpVQ/edit?usp=sharing)
and make a copy for yourself from the File menu. After you make your own copy, it entirely
belongs to you, and nobody else has access to it. All you need to do is paste in your Mint session credentials (see
below) and then click a button to import or update your latest financial data into the Google sheet.

The most common use case for level 1 users is being able to change the category and description for all of their
transactions. Of course you can also do this from inside the Mint browser and mobile applications, but not as easily.
Some things that Google sheets does better might include

- Sort, filter, and copy/paste values in a much easier way than you can in the Mint application
- The workbook is yours, so you retain access to all the data you have entered even if you get locked out of your Mint
  account
- You can share viewer or editor access to your workbook with your partner or investment counselor whereas your Mint
  account is heavily locked down with burdensome (but secure) restrictions. For example, how is your partner supposed to
  access Mint when the multi-factor authentication email goes to your email account or an SMS goes to your phone? How do
  you provide Mint with an SMS code when you are travelling internationally with a different sim card in your phone?

### Level 2 user

Customize the google sheet per your own needs. Add additional worksheets, vlookups, pivot tables, charts, and whatever
else you need to accomplish the goals you have.

For example, if you are familiar with concepts that Daniel McDonald presents in his
book [From Savvy Saver to Smart Spender](https://www.amazon.com/dp/B09V8CNYTB), you could create a worksheet that does a
vlookup on your account balances from Mint and classifies them into **bucket 1** (regular 401ks and IRAs that will be
taxed at ordinary income rates), **bucket 2** (Roth IRAs and potential life insurance proceeds taxed at 0%), and *
*bucket 3** (regular stocks from your brokerage account that will be taxed according to their cost basis).

This is just one example of a million things you can accomplish in your workbook that would be hard or impossible in the
Mint application.

### Level 3 user

Automate your workflow so that you never have to log into Mint again and your workbook gets updated automatically on a
regular schedule. (instructions below)

### Level 4 user

Enhance the Google Apps code (Javascript) embedded within your worksheet to perform any kind of advanced processing that
you need.

### Level 5 user

Clone and fork this code repository and hack away on your version of it!

# Authenticating to Mint

One thing that is out of scope for this project is authenticating to Mint. Other projects,
including [mintapi](https://github.com/mintapi/mintapi), have made heroic attempts to script browser automation in order
to log into your Mint account headlessly. Unfortunately, despite some early successes, log-term success is a
cat-and-mouse game with Intuit where Intuit tries to block you and you try to continually get around their latest
controls.

At first Intuit blocked us by implementing email-based multi-factor authentication where they email a code to you. So
mintapi implemented IMAP functionality. Then Intuit changed to app-based MFA (Google authenticator, Authly, etc) so
mintapi implemented soft-token functionality. Then Intuit changed or added SMS-based codes so mintapi had to work around
those. Now mintapi can’t log in because Intuit has implemented reCaptcha, another attempt to block you if you’re a
“robot”.

### Our approach

Our approach to this problem is to bypass all the cat-and-mouse drama that routinely causes mintapi to fail and simply
allow users to log in (aka create a Mint session key) manually in their browser and then paste that session key into the
workbook so that we can execute our API calls against Mint as an authenticated user. Your Mint access remains secure
because your Mint session key is stored only in your own copy of the workbook which nobody else can access (unless you
share it with them). If you do share your workbook with someone and don’t want them to have your Mint session key,
simply delete it from your workbook.

### Step-by-step instructions

1. Open the web browser of your choice
2. Press F12 to open the developer console
3. Click the `Network` tab and then click the checkbox that says `Preserve log`
4. Navigate your browser to [https://mint.intuit.com/transactions](https://mint.intuit.com/transactions)
5. In the `Network` tab, enter the word “accounts” into the search bar. You should see one or more results that might
   look like like `accounts?offset=0&limit=1000`,
6. Right click one of these results and choose `Copy` > `Copy as node.js fetch`. This places it in your system
   clipboard.
7. Open your workbook, go to the `Instructions` worksheet, and paste the value from your system clipboard into the
   indicated cell. Make sure everything pasted goes into one worksheet cell and doesn't get pasted over many cells. It
   may be easiest to click the cell, press delete to delete the cell contents, then F2 to edit the cell, and then paste
   from your clipboard.
8. Click the workbook button that says `Update worksheet data from Mint`.

# Automating this program

When using the authentication steps listed above, you Mint session will timeout after a few minutes and your session key
will no longer work. The next time you want to update your worksheet data from Mint, you will need to manually log into
Mint and paste a new session key into your workbook.

In order to overcome this manual process and set up automation for your worksheet, you need to stop your Mint session
from timing out. The best way to do this is to create a scheduled (aka cron) job to use your session key every 30
minutes until the end of time. When you do this, your session key will stay valid in perpetuity.

There are actually three cron jobs needed in order for this strategy to be successful:

1. A `keep-session-alive` network request to Mint every 30 minutes to keep your session key active
2. A `update-mint-data` network request 10 minutes before each time you want to update your worksheet data. This is the
   step that makes Mint contact all of your bank accounts and get updated data.
3. A `update-worksheet-data` network request 10 minutes after each time `update-mint-data` runs. This is the step that
   extracts your latest financial data from Mint and puts it inside your workbook.

### Step-by-step instructions

1. Create your own copy of the workbook per the instructions above
2. Open the Google Sheet and click the `Extensions` menu, then `App Script`
3. Click the `Deploy` button in the upper-right corner of the screen, then `New deployment`
4. Select type `Web app`, execute as `Me`, and allow it to be ran by `Anyone`.

This will create a Web app URL that only you know. Now log into your home server and create the following cron jobs:

```bash
# Keep session alive every 30 minutes
*/30 * * * * curl "https://script.google.com/macros/s/<yourScriptId>/exec?keep-session-alive" > /dev/null

# Update Mint data from banks every day at 5:50 AM
50 5 * * * curl "https://script.google.com/macros/s/<yourScriptId>/exec?update-mint-data" > /dev/null

# Update worksheet data from Mint every day at 6:00 AM
0 6 * * * curl "https://script.google.com/macros/s/<yourScriptId>/exec?update-workbook-data" > /dev/null
```

### Don’t have a home server?

You can also schedule jobs using Google Cloud. The instructions for how to this are outside the scope of this project
but we’ll point you to [instructions here](https://cloud.google.com/scheduler/docs/creating) and
the [Google Cloud Scheduler here](https://console.cloud.google.com/cloudscheduler).

# Developer information

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
git clone https://github.com/dcarr178/mint-to-gsheet.git
cd mint-to-gsheet
npm install
npx clasp login
npx clasp clone <your_script_id>

# delete js files from google app, clasp will compile again on push
rm -rf *.js

# edit/enhance the .ts files now

# there is no need to compile/tsc your typescript file - clasp will do it automatically
npx clasp push

# open the google sheet
npx clasp open

```
