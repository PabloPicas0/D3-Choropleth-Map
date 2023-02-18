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

  //Minimum and maximum values od education degrees
  const legendMin = d3.min(education, (data) => data.bachelorsOrHigher);
  const legendMax = d3.max(education, (data) => data.bachelorsOrHigher);

  //Legend scale
  const xScale = d3.scaleLinear().domain([legendMin, legendMax]).rangeRound([600, 860]);

  //Legend Scale domain and colors range
  const colorsDomain = d3.range(legendMin, legendMax, (legendMax - legendMin) / 8);
  const colorsRange = d3.schemeBlues[9];
  const colors = d3.scaleThreshold().domain(colorsDomain).range(colorsRange);

  //x Axis
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(colors.domain())
    .tickFormat((x) => `${x.toFixed(0)}%`)
    .tickSize(15);

  //Legend G element
  const legend = container.append("g").attr("id", "legend").attr("transform", `translate(0, ${margin.top})`);

  //Creating dataset for for colors
  //To fully see whats going on here console.log(d)
  //After that delete if statements and console.log(d) again
  const dataset = colors.range().map((color) => {
    const d = colors.invertExtent(color);
    if (d[0] == null) d[0] = xScale.domain()[0];
    if (d[1] == null) d[1] = xScale.domain()[1];
    return d;
  });

  //Ragne of colors for legend
  legend
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("height", 10)
    .attr("x", (d) => xScale(d[0]))
    .attr("width", (d) => {
      return xScale(d[1]) - xScale(d[0]);
    })
    .attr("fill", (d) => colors(d[0]));

  //Legend Axis
  legend.call(xAxis).call((g) => g.select(".domain").remove());

  console.log(country);
  console.log(education);
};

//Here it is how to fetch multiple data at once
//Source: https://stackoverflow.com/questions/46241827/fetch-api-requesting-multiple-get-requests
Promise.all([
  fetch(countyData).then((response) => response.json()),
  fetch(educationData).then((response) => response.json()),
]).then((values) => render(values));
