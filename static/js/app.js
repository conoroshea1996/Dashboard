queue()
  .defer(d3.csv, "data/vgsales.csv")
  .await(chart);

function chart(error, data) {
  var ndx = crossfilter(data);

  platform(ndx);
  genre(ndx);
  YearSale(ndx);
  Publisher(ndx);
  netSales(ndx);
  dataCount(ndx);
  region(ndx);
  dc.renderAll();
}
/// Graph Width in realtion to screen size
var width;
$(window).on("load", function() {
  width = $(window).width();
  console.log(width);
});

// platform Pie-chart
function platform(ndx) {
  var dim = ndx.dimension(dc.pluck("Platform"));

  var group = dim.group();

  dc.pieChart("#platform")
    .dimension(dim)
    .group(group)
    .legend(
      dc
        .legend()
        .x(-4)
        .y(0)
    )
    .width(340);
}
// genre Bar-Chart
function genre(ndx) {
  var dim = ndx.dimension(dc.pluck("Genre"));

  var group = dim.group();
  dc.barChart("#genre")
    .width(600)
    .dimension(dim)
    .group(group)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .margins({
      top: 0,
      left: 50,
      right: 0,
      bottom: 40
    });
}
// year Sale Line-Chart
function YearSale(ndx) {
  var dim = ndx.dimension(dc.pluck("Year"));
  var group = dim.group().reduceSum(function(d) {
    return Math.floor(d.Global_Sales);
  });

  var chart = dc.lineChart("#salesSpan");
  chart
    .dimension(dim)
    .group(group)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .width(width);

  chart.xAxis().ticks(8);
}
// Top 5 pulishers
function Publisher(ndx) {
  var dim = ndx.dimension(dc.pluck("Publisher"));

  var group = dim.group();

  function getTops(group) {
    return {
      all: function() {
        return group.top(10);
      }
    };
  }
  var top = getTops(group);

  dc.rowChart("#publisher")
    .width(300)
    .height(300)
    .dimension(dim)
    .group(top)
    .colors(d3.scale.category10());
}

function netSales(ndx) {
  var totalSales = ndx.groupAll().reduceSum(function(d) {
    return d.Global_Sales * 100000;
  });

  dc.numberDisplay("#total-sales")
    .formatNumber(d3.format("d"))
    .valueAccessor(function(d) {
      return d;
    })
    .group(totalSales)
    .formatNumber(d3.format(".3s"));
}

function dataCount(ndx) {
  var dim = ndx;
  var all = dim.groupAll();

  dc.dataCount("#all-data")
    .dimension(dim)
    .group(all);
}

function region(ndx) {
  var dim = ndx.dimension(function(d) {
    return +d.Year;
  });

  var EUgroup = dim.group().reduceSum(function(d) {
    return d.EU_Sales;
  });

  var JPgroup = dim.group().reduceSum(function(d) {
    return d.JP_Sales;
  });

  var NAgroup = dim.group().reduceSum(function(d) {
    return d.NA_Sales;
  });

  console.log(JPgroup.all());
  console.log(EUgroup.all());

  var composite = dc.compositeChart("#region");

  var maxDate = new Date(dim.top(1)[0].Year).getFullYear();
  var minDate = new Date(dim.bottom(1)[0].Year).getFullYear();
  console.log(minDate);

  composite
    .width(650)
    .height(480)
    .x(d3.scale.linear().domain([minDate, maxDate]))

    .legend(
      dc
        .legend()
        .x(80)
        .y(20)
        .itemHeight(13)
        .gap(5)
    )
    .renderHorizontalGridLines(false)
    .compose([
      dc
        .lineChart(composite)
        .dimension(dim)
        .colors("red")
        .group(JPgroup, "Japan"),
      dc
        .lineChart(composite)
        .dimension(dim)
        .colors("blue")
        .group(EUgroup, "Europe")
        .dashStyle([5, 1]),
      dc
        .lineChart(composite)
        .dimension(dim)
        .colors("green")
        .group(NAgroup, "North America")
        .dashStyle([8, 2])
    ])
    .brushOn(false);
}

// Reset Button
var resetButton = document.querySelector("#reset-charts");
resetButton.addEventListener("click", function() {
  javascript: dc.filterAll();
  dc.redrawAll();
});

// start intro.js
$("#tour").click(function() {
  javascript: introJs().start();
});
