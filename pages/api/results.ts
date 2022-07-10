// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import events from "./events.json";
import Joi, { ValidationError } from "joi";

const schema = Joi.object({
  event: Joi.any()
    .valid("eights", "lents", "mays", "torpids", "town")
    .required(),
  gender: Joi.any().valid("men", "women").required(),
  start: Joi.number(),
  end: Joi.number(),
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
  res: NextApiResponse<Data | { message: string }>
) {
  try {
    Joi.assert(req.query, schema);

    const {
      event = "mays",
      gender = "women",
      start = Number.NEGATIVE_INFINITY,
      end = Number.POSITIVE_INFINITY,
    } = req.query;

    const data = (events as any[])
      .filter(
        (d) => d.gender.toLowerCase() === (gender as string).toLowerCase()
      )
      .filter((d) => d.small.toLowerCase() === (event as string).toLowerCase())
      .filter((d) => d.year >= +start)
      .filter((d) => d.year <= end);

    res.status(200).json(data);
  } catch (error) {
    let message = "There was an error";

    if (error instanceof ValidationError) {
      message = error.details.map((detail) => detail.message).join(", ");
    }

    res.status(400).json({ message });
  }
}
