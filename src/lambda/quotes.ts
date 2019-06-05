import { Handler, Context, Callback, APIGatewayEvent } from "aws-lambda";
import fetch from "node-fetch";
import parse from "csv-parse/lib/sync";

const url =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTX-rEV_2QPSPicSDNE_3I5siM_6rPL-UGI112IvTRfCXqcsF4cagiBbq8YxcTHC__hP-RMbZs1rWUc/pub?output=csv";

const headers = { "Content-Type": "application/json" };

export const handler: Handler = async (
  _event: APIGatewayEvent,
  _context: Context,
  callback: Callback,
) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw Error("Fuck");
    }

    const text = await response.text();
    const records = parse(text);
    const [_head, ...tail] = records;
    const data = tail
      .map((record: any, key: string) => ({
        id: key,
        text: record[0],
        author: record[1],
        date: new Date(record[2]).toISOString(),
      }))
      .reverse();

    callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data }),
    });
  } catch (error) {
    console.error(error);

    callback(null, {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error }),
    });
  }
};