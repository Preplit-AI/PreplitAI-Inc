/**
 * The campus reader on Cloudflare. Ajou's website refuses Amazon and Microsoft
 * (where the API and GitHub run) but answers Cloudflare, so the boards are read
 * here every 3 hours and sent to the API. The reading and sending code is the
 * server's own (server/services/campusSend.js); Wrangler bundles it in.
 */
import campusSend from "../../../server/services/campusSend.js";

export default {
  async scheduled(controller, env, ctx) {
    const lines = [];
    const ok = await campusSend.sendAll({
      key: env.CAMPUS_INGEST_KEY,
      target: env.CAMPUS_INGEST_URL || undefined,
      log: (line) => lines.push(line),
    });
    console.log(lines.join("\n"));
    // A failed run shows as an error in the Worker's logs and metrics.
    if (!ok) throw new Error("campus reader: not every campus was read and sent");
  },
};
