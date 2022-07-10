// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import results from "../results.json";

type Data = {
  set: string;
  gender: string;
  divisions: any;
  startYear: number;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    event = "mays",
    gender = "women",
    start = Number.NEGATIVE_INFINITY,
    end = Number.POSITIVE_INFINITY,
  } = req.query;

  const data = (results as any[])
    .filter((d) => d.gender.toLowerCase() === (gender as string).toLowerCase())
    .filter(
      (d) => d.small.toLowerCase() === (event as string).toLowerCase()
    )[0];

  const indexes = data.divisions.map((d) => d.year >= +start && d.year <= +end);

  console.log(indexes);

  const dataRange = {
    set: data.set,
    gender: data.gender,
    crews: data.crews.map((crew) => ({
      name: crew.name,
      //values: crew.values,
      valuesSplit: crew.valuesSplit.filter((d, i) => indexes[i]),
    })),
    divisions: data.divisions.filter((d, i) => indexes[i]),
  };

  res.status(200).json({ ...dataRange, startYear: data.divisions[0].year });
}
