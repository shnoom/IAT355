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

// Chart 1: Map Factories

// I added the countries manually from the dataset (US and Europe excluded)
d3.csv("true_cost_fast_fashion.csv").then(data => {
  const focusCountries = [
    "India",
    "Bangladesh",
    "Vietnam",
    "Indonesia",
    "China",
    "Turkey",
    "Brazil"
  ];
  const counts = {};

  data.forEach(d => {
    const year = +d.Year;
    const country = d.Country;

    // you can control years here
    if (/*year >= 2022 && year <= 2024 && */focusCountries.includes(country)) {
      counts[country] = (counts[country] || 0) + 1;
    }
  });

  const factoryCounts = Object.entries(counts).map(([Country, factoryCount]) => ({
    Country,
    factoryCount
  }));

  vegaEmbed("#vis-map", {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 420,
    title: {
      text: "Global Fast Fashion Factory Hubs",
      anchor: "start",
      fontSize: 18,
      offset: 15
    },
    config: config,
    layer: [
      {
        data: {
          url: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
          format: {
            type: "topojson",
            feature: "countries"
          }
        },
        projection: { type: "equalEarth" },
        mark: {
          type: "geoshape",
          fill: "#efefef",
          stroke: "white",
          strokeWidth: 0.6
        }
      },
      {
        data: {
          url: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
          format: {
            type: "topojson",
            feature: "countries"
          }
        },
        projection: { type: "equalEarth" },
        transform: [
          {
            lookup: "properties.name",
            from: {
              data: { values: factoryCounts },
              key: "Country",
              fields: ["factoryCount"]
            }
          },
          {
            filter: "datum.factoryCount != null"
          }
        ],
        mark: {
          type: "geoshape",
          stroke: "white",
          strokeWidth: 0.6
        },
        encoding: {
          color: {
            field: "factoryCount",
            type: "quantitative",
            title: "Factory Count",
            scale: {
                range: ["#fbb1d8", "#f062a6", "#c73789", "#0d47a1"],
                domain: [270, 310]
            }
          },
          tooltip: [
            { field: "properties.name", type: "nominal", title: "Country" },
            { field: "factoryCount", type: "quantitative", title: "Factories" },
            
          ]
        }
      }
    ]
  }, { actions: false });
});

// Chart 2: Global production
vegaEmbed('#vis-production', {
  ...config,
  "data": dataSource,
  "width": "container", "height": 300,
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
    },
    "tooltip": [
      {"field": "Brand", "type": "nominal"},
      {"aggregate": "sum", "field": "Monthly_Production_Tonnes", "type": "quantitative", "title": "Total Tonnes", "format": ",.0f"}
    ]
  }
});

// Chart 3: Global water ussage
vegaEmbed('#vis-water', {
  ...config,
  "data": dataSource,
  "width": "container",
  "height": 420,
    title: {
      text: "Water Usage by Fast Fashion Brands per Year ",
       "subtitle": "Estimated annual water usage (in billion litres)",
      anchor: "start",
      fontSize: 18,
      offset: 15
    },

  "transform": [
    { "filter": "datum.Year == 2024" },
    {
      "aggregate": [
        {
          "op": "sum",
          "field": "Water_Usage_Million_Litres",
          "as": "Total_Million_Litres"
        }
      ],
      "groupby": ["Brand"]
    },
    {
      "calculate": "datum.Total_Million_Litres / 1000",
      "as": "Total_Billion_Litres"
    },
    {
      "joinaggregate": [
        {"op": "max", "field": "Total_Billion_Litres", "as": "max_val"}
      ]
    },
    {
      "calculate": "datum.Total_Billion_Litres === datum.max_val ? 'highlight' : 'normal'",
      "as": "highlight_flag"
    }
  ],

  "layer": [
    {
      "mark": {
        "type": "bar",
      },
      "encoding": {
        "x": {
          "field": "Brand",
          "type": "nominal",
          "sort": "-y",
          "axis": {"labelAngle": 0, "title": "Brand"}
        },
        "y": {
          "field": "Total_Billion_Litres",
          "type": "quantitative",
          "title": "Water Usage (Billion Litres)"
        },
        "color": {
          "field": "highlight_flag",
          "type": "nominal",
          "scale": {
            "domain": ["highlight", "normal"],
            "range": ["#7a1e4d", "#fbb1d8"]
          },
          "legend": null
        },
        "tooltip": [
          {"field": "Brand", "type": "nominal"},
          {
            "field": "Total_Billion_Litres",
            "type": "quantitative",
            "title": "Water Usage (Billion Litres)",
            "format": ".2f"
          }
        ]
      }
    },

    {
      "mark": {
        "type": "text",
        "dy": -5,
        "fontSize": 11,
        "color": "#333"
      },
      "encoding": {
        "x": {"field": "Brand", "type": "nominal", "sort": "-y"},
        "y": {"field": "Total_Billion_Litres", "type": "quantitative"},
        "text": {
          "field": "Total_Billion_Litres",
          "type": "quantitative",
          "format": ".2f"
        }
      }
    }
  ]
}, { "actions": false });
// Chart 4: Cleveland dot plot for wage vs, price
//ERROR i relaize in this visualization it like takes sum od all the locations for each retailer, so it skews it as factories in like develoopping countries have work weeks of like 40 vs more devellopping countries closer to 60+, were going to have to change and or do a second graph comparing GEOGRPAHICAL location ratehr than from rband but imm leave this for now for this submission

vegaEmbed('#vis-wage', {
  ...config,
  "data": dataSource,
  "transform": [
    {"calculate": "datum.Avg_Worker_Wage_USD / 26", "as": "DailyWage"},
    {"calculate": "datum.Working_Hours_Per_Week / 5", "as": "DailyHours"}
  ],
  "width": "container", "height": 300,
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

vegaEmbed('#vis-bars', {
  ...config,
  
  "data": dataSource,
  title: {
      text: "Average Item Price vs Daily Wage for Workers by Brand",
      subtitle: "How many days a worker must labor to afford a single item from the brand",
      anchor: "start",
      fontSize: 18,
      offset: 15
    },
  "width": "container",
  "height": 420,
  "transform": [
    // divide by 23 (average working days) since it onyl gives a monthly wage
    {"calculate": "datum.Avg_Worker_Wage_USD / 23", "as": "Daily_Wage"},
    
  
    {
      "aggregate": [
        {"op": "mean", "field": "Avg_Item_Price_USD", "as": "Avg Item Price ($)"},
        {"op": "mean", "field": "Daily_Wage", "as": "Avg Daily Wage ($)"}
      ],
      "groupby": ["Brand"]
    },
    {"calculate": "datum['Avg Item Price ($)'] / datum['Avg Daily Wage ($)']", "as": "Work_Ratio"},
    
    {
      "fold": ["Avg Item Price ($)", "Avg Daily Wage ($)"],
      "as": ["Metric", "Value"]
    }
  ],
  
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "Brand", 
      "type": "nominal", 
      "axis": {"labelAngle": 0},
      "title": "Brand"
    },
    "y": {
      "field": "Value", 
      "type": "quantitative", 
      "title": "Value (USD)"
    },
    "xOffset": {
      "field": "Metric", 
      "type": "nominal"
    },
    "color": {
      "field": "Metric", 
      "type": "nominal",
      "scale": {
        "domain": ["Avg Item Price ($)", "Avg Daily Wage ($)"],
        "range": ["#fbb1d8", "#f062a6", "#c73789", "#0d47a1"]

      },
      "legend": {"title": "Metric"}
    },
    "tooltip": [
      {"field": "Brand", "type": "nominal", title: "Brand"},
      {"field": "Metric", "type": "nominal"},
      {"field": "Value", "type": "quantitative","title": "Value", "format": "$.2f"}
    ]
  }
});

vegaEmbed("#vis-Wagemap", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  config:config,
  height: 420,
  
  title: {
   text: "Regional Wage Disparities in the Fast Fashion Industry",
    subtitle: "Hourly wages for garment workers (USD) and Daily Hours Worked",
    anchor: "start",
    fontSize: 18,
    offset: 15
  },
  params: [
    {
      "name": "brand_select",
      "value": "Shein",
      "bind": {
        "input": "radio", 
        "options": ["Shein", "Zara", "Uniqlo", "Forever 21", "H&M"],
        "name": "Brand: "
      }
    }
  ],
  layer: [
    {
      // Layer 1: Background World Map
      data: {
        url: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
        format: { type: "topojson", feature: "countries" }
      },
      projection: { type: "equalEarth" },
      mark: { type: "geoshape", fill: "#efefef", stroke: "white" }
    },
    {
    //  data aggrevated from dataset
      data: { url: "true_cost_fast_fashion.csv" },
      projection: { type: "equalEarth" },
      transform: [
        //filter by the brand
        { "filter": "datum.Brand == brand_select" },
        
        // remove usa and other global north countries
        { 
          "filter": "datum.Country != 'USA' && datum.Country != 'UK' && datum.Country != 'Germany'" 
        },
        //for correcting mismatch with certain countries
        {
         "calculate": "datum.Country == 'Vietnam' ? 'Viet Nam' : datum.Country",
          "as": "map_name"
        },

        // aggregrate all the rows into 1 per country
        {
          "aggregate": [
            {"op": "mean", "field": "Avg_Worker_Wage_USD", "as": "Monthly_Wage"},
            {"op": "mean", "field": "Working_Hours_Per_Week", "as": "Weekly_Hours"}
          ],
          "groupby": ["map_name"]
        },

        // turn the dataset columns into daily wage, wekkly hours and get hourly wage as better method for comparison
        { "calculate": "datum.Monthly_Wage / 23", "as": "Daily_Wage" },
        { "calculate": "datum.Weekly_Hours / 5", "as": "Daily_Hours" },
        { "calculate": "datum.Daily_Wage / datum.Daily_Hours", "as": "Hourly_Wage" },
        {
          "lookup": "map_name",
          "from": {
            "data": {
              "url": "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
              "format": { "type": "topojson", "feature": "countries" }
            },
            "key": "properties.name"
          },
          "as": "geo"
        }
      ],
      "mark": { "type": "geoshape", "stroke": "white" },
      "encoding": {
        "shape": { "field": "geo", "type": "geojson" },
        "color": {
          "field": "Hourly_Wage",
          "type": "quantitative",
          "title": "Hourly Wage ($)",
           scale: {
                range: ["#fbb1d8", "#f062a6", "#c73789", "#0d47a1"]
            }
        },
        "tooltip": [
          { "field": "map_name", "type": "nominal", "title": "Country" },
          { "field": "Hourly_Wage", "type": "quantitative", "title": "Hourly Wage", "format": "$.2f" },
          { "field": "Daily_Wage", "type": "quantitative", "title": "Daily Wage", "format": "$.2f" },
          { "field": "Daily_Hours", "type": "quantitative", "title": "Daily Hours", "format": ".1f" }
        ]
      }
    }
  ]
}, { actions: false });


vegaEmbed("#vis-HeatMap", {
  ...config,
  config:config,
  "data": dataSource,
  "width": "container",
  "height": 420,
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  title: {
      text: "Total Carbon Emissions by Brand and Country per year",
      anchor: "start",
      fontSize: 18,
      offset: 15
    },

"params": [
  {
    "name": "brand_select",
      "value": "All",
      "bind": {
        "input": "radio",
        "options": ["All", "Shein", "Zara", "Uniqlo", "Forever 21", "H&M"],
        "name": "Brand: "
      }
    },
    {
      "name": "country_select",
      "value": "All",
      "bind": {
        "input": "radio",
        "options": ["All", "China", "Vietnam", "Bangladesh", "India"],
        "name": "Country: "
      }
  },
  {
      "name": "hover",
      "select": {"type": "point", "on": "mouseover", "clear": "mouseout"}
    }
],
  "transform": [
    { "filter": "datum.Year == 2024" },
    { "filter": "datum.Country !== 'USA' && datum.Country !== 'UK' && datum.Country !== 'Germany'" },
    { "calculate": "datum.Country == 'Vietnam' ? 'Viet Nam' : datum.Country", "as": "map_name" },
    { "calculate": "datum.Carbon_Emissions_tCO2e / 4.6", "as": "Car_Years" }
  ],
  "mark": "rect",
  "encoding": {
  "x": {
    "field": "Country",
    "type": "nominal",
    "title": "Production Country",
    "sort": {
      "op": "sum",
      "field": "Carbon_Emissions_tCO2e",
      "order": "descending"
    }
  },
  "y": {
    "field": "Brand",
    "type": "nominal",
    "title": "Brand",
    "sort": {
      "op": "sum",
      "field": "Carbon_Emissions_tCO2e",
      "order": "descending"
    }
  },
  "color": {
    "aggregate": "sum",
    "field": "Carbon_Emissions_tCO2e",
    "type": "quantitative",
    "scale": {
      "range": ["#fde0dd", "#fa9fb5", "#c51b8a", "#7a0177"]
      
      
    },
    "title": "Total Emissions (CO2)"
  },
  "opacity": {
    "condition": {
      "test": "(brand_select === 'All' || datum.Brand === brand_select) && (country_select === 'All' || datum.Country === country_select)",
      "value": 1,
      "empty": true
    },
    "value": 0.15
  },
  "tooltip": [
    {"field": "Brand", "type": "nominal"},
    {"field": "Country", "type": "nominal"},
    {
      "aggregate": "sum",
      "field": "Carbon_Emissions_tCO2e",
      "type": "quantitative",
      "title": "Total Emissions",
      "format": ",.0f"
    }
  ]
},
  "config": {
    "view": {"stroke": "transparent"},
    "axis": {"grid": false}
  }
}, {
  "actions": false
});
 
// consumer spending vs labour risk scatterplot viz
vegaEmbed('#vis-social-scatter', {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  config:config,
  "height": 420,
  "title": {
    text: "Do Consumers Shop More Frequently at Less Ethical Brands?",
    subtitle: "Comparing ethical risk with how often customers purchase",
    "anchor": "start",
    "fontSize": 18,
    "subtitleFontSize": 13,
    "offset": 15
  },
  "data": dataSource,
  "transform": [
    {
      "calculate": "datum.Working_Hours_Per_Week * 0.4 + (100 - datum.Compliance_Score) * 0.15 + datum.Child_Labor_Incidents * 0.5",
      "as": "Labour_Risk_Score"
    },
    {
      "aggregate": [
        {"op": "mean", "field": "Labour_Risk_Score", "as": "avg_risk"},
        {"op": "mean", "field": "Shopping_Frequency_Per_Year", "as": "avg_frequency"}
      ],
      "groupby": ["Brand"]
    }
  ],
  "layer": [
    {
      "mark": {
        "type": "line",
        "color": "#999",
        "strokeWidth": 1.5,
        "strokeDash": [4, 4]
      },
      "transform": [
        {
          "regression": "avg_frequency",
          "on": "avg_risk",
          "method": "linear"
        }
      ],
      "encoding": {
        "x": {"field": "avg_risk", "type": "quantitative"},
        "y": {"field": "avg_frequency", "type": "quantitative"}
      }
    },

    {
      "transform": [
        {
          "joinaggregate": [
            {"op": "mean", "field": "avg_risk", "as": "mean_x"},
            {"op": "mean", "field": "avg_frequency", "as": "mean_y"}
          ]
        },
        {
          "calculate": "(datum.avg_risk - datum.mean_x) * (datum.avg_frequency - datum.mean_y)",
          "as": "num"
        },
        {
          "calculate": "pow(datum.avg_risk - datum.mean_x, 2)",
          "as": "den_x"
        },
        {
          "joinaggregate": [
            {"op": "sum", "field": "num", "as": "sum_num"},
            {"op": "sum", "field": "den_x", "as": "sum_den_x"}
          ]
        },
        {
          "calculate": "datum.sum_num / datum.sum_den_x",
          "as": "slope"
        },
        {
          "aggregate": [
            {"op": "mean", "field": "slope", "as": "slope_value"}
          ]
        },
        {
          "calculate": "'Slope: ' + format(datum.slope_value, '.3f')",
          "as": "label"
        }
      ],
      "mark": {
        "type": "text",
        "align": "left",
        "fontSize": 0,
        "fontWeight": "bold",
        "color": "#444"
      },
      "encoding": {
        "x": {"value": 10},
        "y": {"value": 10},
        "text": {"field": "label"}
      }
    },
    {
      "mark": {
        "type": "circle",
        "size": 260,
        "opacity": 1,
        "stroke": "white",
        "strokeWidth": 2
      },
      "encoding": {
        "x": {
          "field": "avg_risk",
          "type": "quantitative",
          "title": "Ethical Risk Score (Higher = Worse)",
          "scale": {"zero": false}
        },
        "y": {
          "field": "avg_frequency",
          "type": "quantitative",
          "title": "Shopping Frequency (Purchases per Year)",
          "scale": {"zero": false}
        },
        "color": {
          "field": "Brand",
          "type": "nominal",
          "scale": {
            "domain": ["Shein", "Forever 21", "Uniqlo", "H&M", "Zara"],
            "range": ["#f062a6"]
          },
          "legend": null
        },
        "tooltip": [
          {"field": "Brand", "type": "nominal"},
          {"field": "avg_risk", "type": "quantitative", "title": "Ethical Risk Score", "format": ".1f"},
          {"field": "avg_frequency", "type": "quantitative", "title": "Purchases per Year", "format": ".1f"}
        ]
      }
    },

    {
      "mark": {
        "type": "text",
        "dy": -16,
        "fontSize": 12,
        "fontWeight": "bold",
        "color": "#333"
      },
      "encoding": {
        "x": {"field": "avg_risk", "type": "quantitative"},
        "y": {"field": "avg_frequency", "type": "quantitative"},
        "text": {"field": "Brand", "type": "nominal"}
      }
    }
  ]
}, { actions: false });

// public sentiment vs ethical rating scatterplot

vegaEmbed('#vis-ethics-sentiment', {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 420,
  config: config,
  title: {
    text: "Public Sentiment vs Ethical Rating by Brand",
    anchor: "start",
    fontSize: 18,
    offset: 15
  },
  data: dataSource,
  transform: [
    {
      "aggregate": [
        { "op": "mean", "field": "Ethical_Rating", "as": "avg_ethics" },
        { "op": "mean", "field": "Sentiment_Score", "as": "avg_sentiment" }
      ],
      "groupby": ["Brand"]
    }
  ],
  layer: [
    {
      "transform": [
        { "regression": "avg_sentiment", "on": "avg_ethics", "method": "linear" }
      ],
      "mark": {
        "type": "line",
        "color": "black",
        "strokeWidth": 2
      },
      "encoding": {
        "x": {
          "field": "avg_ethics",
          "type": "quantitative",
          "scale": { "zero": false }
        },
        "y": {
          "field": "avg_sentiment",
          "type": "quantitative",
          "scale": { "zero": false }
        }
      }
    },
    {
      "mark": {
        "type": "circle",
        "size": 250,
        "stroke": "white",
        "strokeWidth": 1.5
      },
      "encoding": {
        "x": {
          "field": "avg_ethics",
          "type": "quantitative",
          "title": "Average Ethical Rating →",
          "scale": { "zero": false }
        },
        "y": {
          "field": "avg_sentiment",
          "type": "quantitative",
          "title": "↑ Average Public Sentiment Score",
          "scale": { "zero": false }
        },
        "color": {
          "field": "Brand",
          "type": "nominal",
          "scale": {
            "domain": ["Shein", "Forever 21", "Uniqlo", "H&M", "Zara"],
"range": ["#ffd6ea", "#fbb1d8", "#f062a6", "#c73789", "#7a1e4d"]
          },
          "legend": null
        },
        "tooltip": [
          { "field": "Brand", "type": "nominal" },
          {
            "field": "avg_ethics",
            "type": "quantitative",
            "title": "Avg Ethical Rating",
            "format": ".3f"
          },
          {
            "field": "avg_sentiment",
            "type": "quantitative",
            "title": "Avg Public Sentiment Score",
            "format": ".3f"
          }
        ]
      }
    },
    {
      "mark": {
        "type": "text",
        "dy": -18,
        "fontSize": 13,
        "fontWeight": "bold",
        "color": "#333"
      },
      "encoding": {
        "x": { "field": "avg_ethics", "type": "quantitative" },
        "y": { "field": "avg_sentiment", "type": "quantitative" },
        "text": { "field": "Brand", "type": "nominal" }
      }
    }
  ]
}, { actions: false });