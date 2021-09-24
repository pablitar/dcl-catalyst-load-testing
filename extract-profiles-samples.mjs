import { argv } from "process";
import fetch from "node-fetch";

const baseUrl = argv[2];
const offset = parseInt(argv[3] ?? "0");
const quantity = parseInt(argv[4] ?? "200");

if (!baseUrl) {
  console.log(
    "Usage: node extract-profiles-samples.mjs <contentServerBaseUrl> [offset] [quantity]."
  );

  console.log("If offset is not provided, 0 will be used.");
  console.log(
    "If quantity is not provided, 200 will be used. Maximum quantity: 500"
  );
  process.exit(1);
}

fetch(
  `${baseUrl}/deployments?entityType=profile&onlyCurrentlyPointed=true&offset=${offset}`
).then(async (res) => {
  if (!res.ok) {
    const text = await res.text();
    console.log("Response not OK: ", res.status, text);
  }

  const { deployments } = await res.json();

  const requests = deployments
    .slice(0, quantity)
    .map((it) => `GET /lambdas/profiles?id=${it.pointers[0]}`);

  console.log(JSON.stringify(requests, undefined, 2));
});
