// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import results from "../../../../results.json";
import Joi, { ValidationError } from "joi";

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
};

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

    const data = (results as any[])
      .filter(
        (d) => d.gender.toLowerCase() === (gender as string).toLowerCase()
      )
      .filter(
        (d) => d.small.toLowerCase() === (event as string).toLowerCase()
      )[0];

    const dataRange = {
      set: data.set,
      gender: data.gender,
      crews: data.crews
        .filter((crew: any) => crew.values[crew.values.length - 1].pos !== -1)
        .map((crew: any) => ({
          name: crew.name,
          values: crew.values
            .slice(-5)
            .map((v: any, i: number) => ({ day: i, pos: v.pos })),
          valuesSplit: crew.valuesSplit.slice(-1),
        })),
      divisions: data.divisions.slice(-1),
    };

    res.status(200).json({
      ...dataRange,
      startYear: data.divisions[data.divisions.length - 1].year,
    });
  } catch (error) {
    let message = "There was an error";

    if (error instanceof ValidationError) {
      message = error.details.map((detail) => detail.message).join(", ");
    }

    res.status(400).json({ message });
  }
}
