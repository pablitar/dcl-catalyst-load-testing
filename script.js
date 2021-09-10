import { sleep, check } from "k6";
import http from "k6/http";
import { Counter } from "k6/metrics";

import { sample } from "./sample-zone.js";

var myCounter = new Counter("not-found");

const notContent = sample.filter((it) => !it.includes("contents"));
const content = sample.filter((it) => it.includes("contents"));
const getSamples = [...notContent, ...content.slice(0, 30)];

const catalystUrl = "https://peer-ap1.decentraland.zone";

export let options = {
  vus: 400,
  duration: "600s",
};

function randomSample() {
  return getSamples[Math.floor(Math.random() * getSamples.length)];
}

export default function () {
  const request = randomSample();
  let url = catalystUrl + request.replace(/\w+ (.*) HTTP.*/, "$1");

  url =
    url +
    (url.includes("?") ? "&" : "?") +
    `random=${Math.random() * Number.MAX_SAFE_INTEGER}`;
  // const url = catalystUrl + "/content/entities/scene?pointer=0,0&pointer=0,1&pointer=0,2&pointer=0,3&pointer=0,4&pointer=0,5&pointer=0,6&pointer=1,0&pointer=1,1&pointer=1,2&pointer=1,3&pointer=1,4&pointer=1,5&pointer=1,6&pointer=2,0&pointer=2,1&pointer=2,2&pointer=2,3&pointer=2,4&pointer=2,5&pointer=2,6&pointer=3,0&pointer=3,1&pointer=3,2&pointer=3,3&pointer=3,4&pointer=3,5&pointer=3,6&pointer=4,0&pointer=4,1&pointer=4,2&pointer=4,3&pointer=4,4&pointer=4,5&pointer=4,6&pointer=5,0&pointer=5,1&pointer=5,2&pointer=5,3&pointer=5,4&pointer=5,5&pointer=5,6&pointer=6,0&pointer=6,1&pointer=6,2&pointer=6,3&pointer=6,4&pointer=6,5&pointer=6,6"

  // const url = catalystUrl + "/comms/status"

  const res = http.get(url, { timeout: "120s" });

  if (res.status === 404) {
    myCounter.add(1);
  }

  check(res, {
    "is status 200": (r) => r.status === 200 || r.status === 404,
  });

  sleep(0.5);
}
