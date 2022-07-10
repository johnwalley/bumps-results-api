// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import events from "./events.json";
import { transformData, joinEvents } from "bumps-results-tools";
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
      .filter((d) => d.year <= end)
      .map(transformData);

    const joinedEvents = joinEvents(data, event, gender);

    joinedEvents.small = event;
    joinedEvents.gender = gender;
    joinedEvents.set = set[event as keyof typeof set];

    res.status(200).json(joinedEvents);
  } catch (error) {
    let message = "There was an error";

    if (error instanceof ValidationError) {
      message = error.details.map((detail) => detail.message).join(", ");
    }

    res.status(400).json({ message });
  }
}
