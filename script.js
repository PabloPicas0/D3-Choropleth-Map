"use strict";

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//Dimmensions of graph and other important data
const educationData =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const w = 960;
const h = 650;
const margin = { top: 40, bottom: 20, left: 10, right: 10 };

const svg = d3.select("main").append("svg").attr("width", w).attr("height", h);
const container = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

const render = (data) => {
  const [country, education] = data;

  //Minimum and maximum values od education degrees
  const legendMin = d3.min(education, (data) => data.bachelorsOrHigher);
  const legendMax = d3.max(education, (data) => data.bachelorsOrHigher);

  const info = new Map();

  //Set for each county id info about them in map object
  for (let i = 0; i < education.length; i++) {
    const { fips, state, area_name, bachelorsOrHigher } = education[i];

    info.set(fips, { state: state, area_name: area_name, bachelorsOrHigher: bachelorsOrHigher, fips: fips });
  }

  //Draw path for map
  const path = d3.geoPath();

  //Documentation examples how to do Choropleth map
  //Source: https://gist.github.com/almccon/410b4eb5cad61402c354afba67a878b8
  //Source: https://gist.github.com/mbostock/4060606
  const geojsonCounties = topojson.feature(country, country.objects.counties);
  const geojsonStates = topojson.mesh(country, country.objects.states, (a, b) => a !== b);

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

  //onMouseOver function
  const onMouseOver = (event) => {
    const tooltip = d3.select("#tooltip");

    const showMessage = (state, area_name, bachelorsOrHigher) => {
      return `${area_name}, ${state} <br> Bachelor's degree or Higher: ${bachelorsOrHigher}%`;
    };

    //Data for tooltip
    const { id } = event.target.__data__; //take id from hovered element
    const { state, area_name, bachelorsOrHigher } = info.get(id);

    tooltip
      .attr("data-education", bachelorsOrHigher)
      .style("left", `${event.clientX - 140}px`)
      .style("top", `${event.clientY - 90}px`)
      .style("opacity", 0.9)
      .html(showMessage(state, area_name, bachelorsOrHigher));
  };

  const onMouseOut = () => {
    const tooltip = d3.select("#tooltip");

    tooltip.style("opacity", 0);
  };

  //Counties G element
  const counties = container.append("g").attr("id", "county-map");

  //Creates counties path elements
  counties
    .selectAll("path")
    .data(geojsonCounties.features)
    .enter()
    .append("path")
    .attr("class", "county")
    .on("mouseover", onMouseOver)
    .on("mouseout", onMouseOut)
    .attr("fill", (d) => {
      const { bachelorsOrHigher } = info.get(d.id);

      return colors(bachelorsOrHigher);
    })
    .attr("data-fips", (d) => {
      return d.id;
    })
    .attr("data-education", (d) => {
      const { bachelorsOrHigher } = info.get(d.id);

      return bachelorsOrHigher;
    })
    .attr("d", path);

  container.append("path").datum(geojsonStates).attr("class", "states").attr("d", path);
};

//Here it is how to fetch multiple data at once
//Source: https://stackoverflow.com/questions/46241827/fetch-api-requesting-multiple-get-requests
Promise.all([
  fetch(countyData).then((response) => response.json()),
  fetch(educationData).then((response) => response.json()),
]).then((values) => render(values));
