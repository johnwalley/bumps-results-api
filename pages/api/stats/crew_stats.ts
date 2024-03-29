// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import stats from "../stats.json";
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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | { message: string }>
) {
  try {
    Joi.assert(req.query, schema);

    const { event = "mays", gender = "women" } = req.query;

    const e = (stats as any)[event as any][gender as any];

    const body = {
      movdo: e["movdo" as any][0],
      movup: e["movup" as any][0],
      nhead: e["nhead" as any][0],
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
