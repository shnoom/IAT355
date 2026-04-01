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
      text: "Selected Fast Fashion Manufacturing Countries",
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
            title: "Record Count",
            scale: { scheme: "oranges" }
          },
          tooltip: [
            { field: "properties.name", type: "nominal", title: "Country" },
            { field: "factoryCount", type: "quantitative", title: "Records" }
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
  "transform": [
    { "filter": "datum.Year == 2024" },
  ],
  "layer": [
    {
      "mark": {"type": "bar", "color": "#eee", "stroke":null,"clip":false},
      "encoding": {
        "x": {
          "field": "Brand",
          "type": "nominal",
          "sort": "-y",
          "axis": {"labelAngle": 0}
        },
        "y": {
          "aggregate": "sum",
          "field": "Water_Usage_Million_Litres",
          "type": "quantitative",
          "title": "Total Million Litres"
        },
        "tooltip": [
          {"field": "Brand", "type": "nominal"},
          {"field": "Year", "type": "quantitative"},
          {
            "aggregate": "sum", 
            "field": "Water_Usage_Million_Litres", 
            "type": "quantitative", 
            "title": "Total Litres (Millions)", 
            "format": ",.0f"
          }
        ]
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
      anchor: "start",
      fontSize: 18,
      offset: 15
    },
  "width": "container",
  "height": 300,
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
        "range": ["#d65f5f", "#5b9bd5"]
      },
      "legend": {"title": "Metric"}
    },
    "tooltip": [
      {"field": "Brand", "type": "nominal"},
      {"field": "Metric", "type": "nominal"},
      {"field": "Value", "type": "quantitative","title": "Value", "format": "$.2f"}
    ]
  }
});

vegaEmbed("#vis-Wagemap", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 420,
  title: {
    text: "Daily Wage & Labour Hours by Brand & Country",
    anchor: "start",
    fontSize: 18,
    offset: 15
  },
  params: [
    {
      "name": "brand_select",
      "value": "Shein",
      "bind": {
        "input": "select", 
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
          "scale": { "scheme": "yellowgreenblue" }
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
  "data": dataSource,
  "width": "container",
  "height": 420,
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": "Total Carbon Emissions Each Year by Brand and Country",

  "transform": [
    {
      "filter": "datum.Year == 2024"
    },
    {
      "filter": "datum.Country !== 'USA' && datum.Country !== 'UK' && datum.Country !== 'Germany'"
    },
    {
      "calculate": "datum.Country == 'Vietnam' ? 'Viet Nam' : datum.Country",
      "as": "map_name"
    }
  ],
  "mark": "rect",
  "encoding": {
    "x": {
      "field": "Country",
      "type": "nominal",
      "title": "Production Country"
    },
    "y": {
      "field": "Brand",
      "type": "nominal",
      "title": "Brand"
    },
    "color": {
      "field": "Carbon_Emissions_tCO2e",
      "type": "quantitative",
      "aggregate": "sum",
      "scale": {
        "scheme": "oranges"
      },
      "title": "Total Emissions (CO2)"
    },
    "tooltip": [
      {"field": "Brand", "type": "nominal"},
      {"field": "Country", "type": "nominal"},
      {
        "field": "Carbon_Emissions_tCO2e", 
        "type": "quantitative", 
        "aggregate": "sum", 
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