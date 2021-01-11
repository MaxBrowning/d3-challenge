// Chart Params
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
        d3.max(stateData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  };

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  };

// function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.max(stateData, d => d[chosenYAxis]) * 1.2,
      d3.min(stateData, d => d[chosenYAxis]) * 0.8,
    ])
    .range([0, height]);

  return yLinearScale;
};

// function used for updating xAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
};

// function used for updating circles group with a transition to new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  };

// function used for updating circles group with a transition to new circles
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
};

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(stateData, err) {
    if (err) throw err;
  
    // parse data
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.healthcare = +data.healthcare;
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
       d3.max(stateData, d => d[chosenYAxis]) * 1.2])
      .range([height, 0]);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr('class', 'stateCircle');

    // add label to circles with state abbreviation
    circlesGroup.append('text')
      .text(d => d['abbr'])
      .attr('class', 'stateText')
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr('z-index', 1000);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
    
    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(0, ${height / 2})`);
  
    var obeseLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", -80)
      .attr("value", "obesity") // value to grab for event listener
      .classed("active", true)
      .text("Obese (%)");
  
    var smokeLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", -60)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smoke (%)");

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", -40)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");
  
    // updateToolTip function above csv import
    // var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var xValue = d3.select(this).attr("value");
        if (xValue !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = xValue;
  
          console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(stateData, chosenXAxis);
  
          // updates axes with transition
          xAxis = renderXAxis(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
  
          // updates tooltips with new info
          // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // changes x axis classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          };
        }
      });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var yValue = d3.select(this).attr("value");
        if (yValue !== chosenYAxis) {
  
          // replaces chosenYAxis with value
          chosenYAxis = yValue;
  
          console.log(chosenYAxis)
  
          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = yScale(stateData, chosenYAxis);
  
          // updates y axis with transition
          yAxis = renderYAxis(yLinearScale, yAxis);
  
          // updates circles with new y values
          circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          // circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
  
          // changes y axis classes to change bold text
          if (chosenYAxis === "obesity") {
            obeseLabel
              .classed("active", true)
              .classed("inactive", false);
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
            smokeLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "healthcare") {
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          };
        }
      });
  }).catch(function(error) {
    console.log(error);
  });
  