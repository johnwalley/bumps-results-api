// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import Joi, { ValidationError } from "joi";

const GENDER = {
  MEN: "Men",
  WOMEN: "Women",
};

const SET = {
  EIGHTS: "Summer Eights",
  TORPIDS: "Torpids",
  LENTS: "Lent Bumps",
  MAYS: "May Bumps",
  TOWN: "Town Bumps",
};

const set = {
  eights: SET.EIGHTS,
  torpids: SET.TORPIDS,
  lents: SET.LENTS,
  mays: SET.MAYS,
  town: SET.TOWN,
};

const schema = Joi.object({
  event: Joi.any()
    .valid("eights", "lents", "mays", "torpids", "town")
    .required(),
  gender: Joi.any().valid("men", "women").required(),
});

type Data = {
  set: string;
  gender: string;
  crews: any[];
  divisions: any[];
  startYear: number;
}[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | { message: string }>
) {
  try {
    Joi.assert(req.query, schema);

    const { event = "mays", gender = "women" } = req.query;

    const file_movdo = await fs.readFile(
      process.cwd() +
        `/pages/api/output/statistics/${event}/${gender}/movdo.json`,
      "utf8"
    );

    const data_movdo = JSON.parse(file_movdo);

    const file_movup = await fs.readFile(
      process.cwd() +
        `/pages/api/output/statistics/${event}/${gender}/movup.json`,
      "utf8"
    );

    const data_movup = JSON.parse(file_movup);

    const file_nhead = await fs.readFile(
      process.cwd() +
        `/pages/api/output/statistics/${event}/${gender}/movup.json`,
      "utf8"
    );

    const data_nhead = JSON.parse(file_nhead);


    const body = {
      movdo: data_movdo,
      movup: data_movup,
      nhead: data_nhead,
    };

    res.status(200).json(body);
  } catch (error) {
    let message = "There was an error";

    if (error instanceof ValidationError) {
      message = error.details.map((detail) => detail.message).join(", ");
    }

    res.status(400).json({ message });
  }
}
