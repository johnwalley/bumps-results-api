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

    const ncrews: { year: number }[] = e["ncrews" as any];

    const latestYear = ncrews.map((d) => d.year).sort()[ncrews.length - 1];

    const highest = ncrews
      .filter((d) => d.year === latestYear)
      .sort((d) => d.year)[0];

    const body = {
      ncrews: highest,
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
