import { getProjectViews } from "@/lib/pageviews";
import { allProjects } from "contentlayer/generated";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  void req;
  const views = await getProjectViews(allProjects.map((p) => p.slug));

  res.status(200).json({ views });
}
