import { withSensor as brekenWithSensor } from "../../lib/breken-sensor";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

  function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'John Doe' })
}

export default brekenWithSensor(handler, {"route":"/api/hello","routeFile":"src/pages/api/hello.ts"});
