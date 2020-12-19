import Cors from "cors";
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";

import * as fakeData from "data";

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_DOCUMENT_ID!);
doc.useApiKey(process.env.GOOGLE_API_KEY!);

function initMiddleware(middleware: any) {
  return (req: any, res: any) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

const cors = initMiddleware(
  Cors({
    methods: ["GET", "OPTIONS"],
  }),
);

export default async (req: any, res: any) => {
  await cors(req, res);

  if (process.env.QUOTES_ENV === "development") {
    console.log("Loading fake data.");
    res.statusCode = 200;
    return res.json({ data: fakeData });
  }

  try {
    await doc.loadInfo();
    console.log(`Loading data from: ${doc.title}.`);

    const quotesSheet = doc.sheetsById[process.env.GOOGLE_SHEET_QUOTES_ID!];
    const personsSheet = doc.sheetsById[process.env.GOOGLE_SHEET_PERSONS_ID!];
    const [quotesRows = [], personsRows = []] = await Promise.all([
      quotesSheet.getRows(),
      personsSheet.getRows(),
    ]);

    const quotes = quotesRows.map(rowToQuote).reverse();
    const persons = personsRows.map(rowToPerson);

    res.statusCode = 200;
    return res.json({ data: { persons, quotes } });
  } catch (error) {
    res.statusCode = 500;
    return res.json({
      data: { persons: [], quotes: [], error: error.message },
    });
  }
};

const rowToQuote = (row: GoogleSpreadsheetRow) => ({
  id: row.rowIndex,
  text: row.Text,
  author: row.Author,
  date: new Date(row.Date).toISOString(),
});

const rowToPerson = (row: GoogleSpreadsheetRow) => ({
  id: row.Name,
  color: row.Color,
  color2: row.Color2,
  avatar: row.Avatar,
  showInGame: row.ShowInGame || false,
});
