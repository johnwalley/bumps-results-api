// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
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
  res: NextApiResponse<Data | { message: string }>
) {
  try {
    Joi.assert(req.query, schema);

    const { event = "mays", gender = "women" } = req.query;

    const file = await fs.readFile(
      process.cwd() + `/pages/api/output/results/${event}/${gender}/results.json`,
      "utf8"
    );

    const data = JSON.parse(file);

    const latestEvent = transformData(data[data.length - 1]);
    const joinedEvents = joinEvents([latestEvent], event, gender);

    joinedEvents.small = event;
    joinedEvents.gender = gender;
    joinedEvents.set = set[event as keyof typeof set];

    res.status(200).json(joinedEvents);
  } catch (error) {
    let message = "There was an error";

    console.log(error)

    if (error instanceof ValidationError) {
      message = error.details.map((detail) => detail.message).join(", ");
    }

    res.status(400).json({ message });
  }
}
