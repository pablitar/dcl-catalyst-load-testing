import { sleep } from "k6"
import http from "k6/http"

import { sample } from "./sample.js"

const getSamples = sample.filter(it => it.includes("GET"))

const catalystUrl = "https://peer-ue-2.decentraland.zone"

export let options = {
  vus: 10,
  duration: '30s',
};

function randomSample() {
  return getSamples[Math.floor(Math.random() * getSamples.length)]
}

export default function() {
  const request = randomSample()
  const url = catalystUrl + request.replace(/\w+ (.*) HTTP.*/, "$1")

  http.get(url)

  sleep(1)
}