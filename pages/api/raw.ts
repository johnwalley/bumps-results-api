// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import events from "./events.json";
import { write_ad, write_tg } from "bumps-results-tools";
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
  format: Joi.any().valid("tg", "ad").required(),
  gender: Joi.any().valid("men", "women").required(),
  year: Joi.number(),
});

type Data = string;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { message: string }>
) {
  try {
    Joi.assert(req.query, schema);

    const {
      event = "mays",
      format = "tg",
      gender = "women",
      year = 2022,
    } = req.query;

    const data = (events as any[])
      .filter(
        (d) => d.gender.toLowerCase() === (gender as string).toLowerCase()
      )
      .filter((d) => d.small.toLowerCase() === (event as string).toLowerCase())
      .filter((d) => d.year === +year);

    res.status(200).json(format === "tg" ? write_tg(data[0]) : write_ad(data[0]));
  } catch (error) {
    let message = "There was an error";

    if (error instanceof ValidationError) {
      message = error.details.map((detail) => detail.message).join(", ");
    }

    res.status(400).json({ message });
  }
}
