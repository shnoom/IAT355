const config = {
  "view": {"stroke": "transparent"},
  "font": "Work Sans",
  "axis": {
    "domain": false,
    "ticks": false,
    "labelColor": "#888",
    "titleColor": "#888",
    "gridColor": "#f0f0f0",
    "titlePadding": 15
  }
};

// get data 
const dataSource = {
  "url": "true_cost_fast_fashion.csv", 
  "format": {"type": "csv"}
};

// Chart 1: Global production
vegaEmbed('#vis-production', {
  ...config,
  "data": dataSource,
  "width": 600, "height": 300,
  "mark": {"type": "bar", "color": "#222", "size": 30},
  "encoding": {
    "x": {
      "field": "Brand", 
      "type": "nominal", 
      "sort": "-y", 
      "axis": {"labelAngle": 0, "title": "Brand"}
    },
    "y": {
      "aggregate": "sum", 
      "field": "Monthly_Production_Tonnes", 
      "type": "quantitative", 
      "title": "Total Production (Tonnes)"
    }
  }
});

// Chart 2: Global water ussage
vegaEmbed('#vis-water', {
  ...config,
  "data": dataSource,
  "width": 600, "height": 300,
  "layer": [
    {
      "mark": {"type": "bar", "color": "#eee"},
      "encoding": {
        "x": {"field": "Brand", "type": "nominal", "sort": "-y", "axis": {"labelAngle": 0}},
        "y": {
          "aggregate": "sum", 
          "field": "Water_Usage_Million_Litres", 
          "type": "quantitative", 
          "title": "Total Million Litres"
        }
      }
    },
    {
      "data": {"values": [{"y": 0.081}]}, 
      "mark": {"type": "rule", "color": "#e63946", "size": 2},
      "encoding": {"y": {"field": "y", "type": "quantitative"}}
    }
  ]
});

// Chart 3: Cleveland dot plot for wage vs, price
//ERROR i relaize in this visualization it like takes sum od all the locations for each retailer, so it skews it as factories in like develoopping countries have work weeks of like 40 vs more devellopping countries closer to 60+, were going to have to change and or do a second graph comparing GEOGRPAHICAL location ratehr than from rband but imm leave this for now for this submission

vegaEmbed('#vis-wage', {
  ...config,
  "data": dataSource,
  "transform": [
    {"calculate": "datum.Avg_Worker_Wage_USD / 26", "as": "DailyWage"},
    {"calculate": "datum.Working_Hours_Per_Week / 5", "as": "DailyHours"}
  ],
  "width": 600, "height": 300,
  "layer": [
    // The connector line
    {
      "mark": {"type": "rule", "color": "#ccc"},
      "encoding": {
        "x": {"field": "Brand", "type": "nominal", "axis": {"labelAngle": 0}},
        "y": {"aggregate": "mean", "field": "DailyWage", "type": "quantitative"},
        "y2": {"aggregate": "mean", "field": "Avg_Item_Price_USD"}
      }
    },
    // The Price
    {
      "mark": {"type": "point", "size": 100, "filled": true, "color": "#e63946"},
      "encoding": {
        "x": {"field": "Brand", "type": "nominal"},
        "y": {"aggregate": "mean", "field": "Avg_Item_Price_USD", "type": "quantitative", "title": "USD ($)"},
        "tooltip": [
          {"field": "Brand", "type": "nominal"},
          {"aggregate": "mean", "field": "Avg_Item_Price_USD", "type": "quantitative", "title": "Avg Item Price", "format": "$.2f"}
        ]
      }
    },

    {
      "mark": {"type": "point", "filled": true, "color": "#222"},
      "encoding": {
        "x": {"field": "Brand", "type": "nominal"},
        "y": {"aggregate": "mean", "field": "DailyWage", "type": "quantitative"},
        "size": {
          "aggregate": "mean", 
          "field": "DailyHours", 
          "type": "quantitative",
          "scale": {"range": [50, 700]}, 
          "legend": {"title": "Avg Daily Hours", "orient": "bottom"}
        },
        "tooltip": [
          {"field": "Brand", "type": "nominal"},
          {"aggregate": "mean", "field": "DailyWage", "type": "quantitative", "title": "Avg Daily Wage", "format": "$.2f"},
          {"aggregate": "mean", "field": "DailyHours", "type": "quantitative", "title": "Avg Hours Worked/Day", "format": ".1f"}
        ]
      }
    }
  ]
});