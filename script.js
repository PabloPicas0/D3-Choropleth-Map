"use strict";

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//Dimmensions of graph and other important data
const educationData =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const w = 960;
const h = 600;
const margin = { top: 40, bottom: 20, left: 10, right: 10 };

const innerWidth = w - margin.left - margin.right;
const innerHeight = h - margin.bottom - margin.top;

const svg = d3.select("main").append("svg").attr("width", w).attr("height", h);
const container = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

const render = (data) => {
  const [country, education] = data;

  console.log(country)
  console.log(education);
};

//Here it is how to fetch multiple data at once
//Source: https://stackoverflow.com/questions/46241827/fetch-api-requesting-multiple-get-requests
Promise.all([
  fetch(countyData).then((response) => response.json()),
  fetch(educationData).then((response) => response.json()),
]).then((values) => render(values));
