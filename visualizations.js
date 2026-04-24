// tooltip
function customTooltipHandler(handler, event, item, value) {
  let tooltip = document.querySelector('.vega-tooltip');

  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'vega-tooltip';
    document.body.appendChild(tooltip);
  }

  if (value) {
    let html = "";

    // Title (first key)
    const titleKey = Object.keys(value)[0];
    if (titleKey) {
      html += `<div class="title">${value[titleKey]}</div>`;
    }

    Object.entries(value).forEach(([key, val]) => {
      if (key === titleKey || val == null) return;

      html += `
        <div class="row">
          <span class="label">${key.replace(/_/g, ' ')}</span>
          <span class="value">${val}</span>
        </div>
      `;
    });

    tooltip.innerHTML = html;
    tooltip.style.opacity = 1;
    tooltip.style.left = event.pageX + 15 + 'px';
    tooltip.style.top = event.pageY + 15 + 'px';
  } else {
    tooltip.style.opacity = 0;
  }
}

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

  // Process the data
  data.forEach(d => {
    const country = d.Country;
    if (focusCountries.includes(country)) {
      counts[country] = (counts[country] || 0) + 1;
    }
  });

  const factoryCounts = Object.entries(counts).map(([Country, factoryCount]) => ({
    Country,
    factoryCount
  }));

  // --- MAP VISUALIZATION ---
  vegaEmbed("#vis-map", {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 400,
      config:config,
    title: {
      text: "Global Fast Fashion Factory Hubs",
      anchor: "start",
      fontSize: 18,
      offset: 15
    },
    layer: [
      {
        data: {
          url: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
          format: { type: "topojson", feature: "countries" }
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
          format: { type: "topojson", feature: "countries" }
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
          { filter: "datum.factoryCount != null" }
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
            { field: "factoryCount", type: "quantitative", title: "Factories" }
          ]
        }
      }
    ]
  }, { actions: false ,  tooltip: customTooltipHandler});

  // --- donut ---
  vegaEmbed("#vis-donut", {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    config:config,
    height: 400,
    title: {
      text: "Factory Distribution by Country",
      anchor: "start",
      fontSize: 18,
      offset: 15
    },
    data: {
      values: factoryCounts
    },
    params: [
    {
      name: "Select_Country",
      select: { type: "point", fields: ["Country"] },
      bind: {
        input: "radio",
        options: [null, "India", "Bangladesh", "Vietnam", "Indonesia", "China", "Turkey", "Brazil"],
        labels: ["Show All", "India", "Bangladesh", "Vietnam", "Indonesia", "China", "Turkey", "Brazil"],name: "Region:"
      }
    }
  ],
    mark: {
      type: "arc",
      innerRadius: 90,
      outerRadius: 160,
      padAngle: 0.02,
      cornerRadius:4,
    },
    encoding: {
      theta: {
        field: "factoryCount",
        type: "quantitative"
      },
      color: {
        field: "Country",
        type: "nominal",
      
        scale: {
      // Flowing from Pastel Pink -> Lavender -> Soft Blue
    range: [
        "#FF71CE",
            "#94e9eb", 
            "#05FFA1", 
            "#dfabf7", 
            "#FFFB96", 
            "#700B97", 
            "#2D5FF5"
        ]
     
    }
      },
      opacity:{
        condition: { param: "Select_Country", value: 1 },
      value: 0.15
      },
      tooltip: [
        { field: "Country", type: "nominal" },
        { field: "factoryCount", type: "quantitative", title: "Factories" }
      ]
    }
  }, { actions: false,  tooltip: customTooltipHandler });

}).catch(err => {
  console.error("Error loading or processing data: ", err);
});

// Chart 3: Global water ussage
vegaEmbed('#vis-water', {
   $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  config:config,
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
        "type": "bar", "cornerRadiusTopLeft": 10, "cornerRadiusTopRight": 10,
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
            "range": [ "#fbb1d8"]
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
}, { actions: false,
  tooltip: customTooltipHandler  });


vegaEmbed('#vis-bars', {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  config: config,
  data: dataSource,
 
  width: "container",
  height: 420,

  title: {
    text: "Daily Wage vs Item Price by Brand",
    subtitle: "Gap shows how many days a worker must labor to afford one item",
    anchor: "start",
    fontSize: 18,
    offset: 15
  },


  transform: [
    {"calculate": "datum.Avg_Worker_Wage_USD / 23", "as": "Daily_Wage"},

    {
      "aggregate": [
        {"op": "mean", "field": "Avg_Item_Price_USD", "as": "Avg_Item_Price"},
        {"op": "mean", "field": "Daily_Wage", "as": "Avg_Daily_Wage"}
      ],
      "groupby": ["Brand"]
    },

    {
      "calculate": "datum.Avg_Item_Price / datum.Avg_Daily_Wage",
      "as": "Work_Ratio"
    },

    {
      "calculate": "format(datum.Work_Ratio, '.1f') + ' days needed'",
      "as": "Ratio_Label"
    },

    {
      "fold": ["Avg_Item_Price", "Avg_Daily_Wage"],
      "as": ["Metric", "Value"]
    }
  ],

  layer: [

  
    {
      "mark": {"type": "rule", "strokeWidth": 2, "color": "#ccc"},
      "encoding": {
        "y": {
          "field": "Brand",
          "type": "nominal",
          "sort": {"field": "Work_Ratio", "order": "descending"}
        },
        "x": {
          "aggregate": "min",
          "field": "Value",
          "type": "quantitative"
        },
        "x2": {
          "aggregate": "max",
          "field": "Value"
        }
      }
    },


    {
      "mark": {"type": "point", "filled": true, "size": 80},
      "encoding": {
        "y": {
          "field": "Brand",
          "type": "nominal",
          "sort": {"field": "Work_Ratio", "order": "descending"}
        },
        "x": {
          "field": "Value",
          "type": "quantitative",
          "title": "USD Value"
        },
        "color": {
          "field": "Metric",
          "type": "nominal",
          "scale": {
            "domain": ["Avg_Daily_Wage", "Avg_Item_Price"],
            "range": ["#64b5f6", "#f062a6"]
          },
          "legend": {"title": ""},
          "orient": "right",
        },
        "tooltip": [
          {"field": "Brand", "type": "nominal"},
          {"field": "Avg_Daily_Wage", "type": "quantitative", "title": "Daily Wage", "format": "$.2f"},
          {"field": "Avg_Item_Price", "type": "quantitative", "title": "Item Price", "format": "$.2f"},
          {"field": "Work_Ratio", "type": "quantitative", "title": "Days Needed", "format": ".1f"}
        ]
      }
    },

    {
      "mark": {
        "type": "text",
        "align": "left",
        "dx": 6,
        "fontWeight": "bold"
      },
      "encoding": {
        "y": {
          "field": "Brand",
          "type": "nominal",
          "sort": {"field": "Work_Ratio", "order": "descending"}
        },
        "x": {
          "aggregate": "max",
          "field": "Value"
        },
        "text": {"field": "Ratio_Label"}
      }
    }

  ]
}, {  actions: false,
  tooltip: customTooltipHandler });

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
}, { actions: false,
  tooltip: customTooltipHandler  });


vegaEmbed("#vis-HeatMap", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  config:config,
  "data": dataSource,
  "width": "container",
  "height": 420,
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
  actions: false,
  tooltip: customTooltipHandler 
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
}, { actions: false,
  tooltip: customTooltipHandler });

// public sentiment vs ethical rating scatterplot

vegaEmbed('#vis-ethics-sentiment', {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 420,
  config: config,

  title: {
    text: "Consumers Favor Some Low-Ethics Brands",
    subtitle: "How low ethical ratings do not always lead to negative public sentiment",
    anchor: "start",
    fontSize: 18,
    subtitleFontSize: 13,
    offset: 15
  },

  data: dataSource,

  transform: [
    {
      aggregate: [
        { op: "mean", field: "Ethical_Rating", as: "avg_ethics" },
        { op: "mean", field: "Sentiment_Score", as: "avg_sentiment" }
      ],
      groupby: ["Brand"]
    },
    {
      joinaggregate: [
        { op: "mean", field: "avg_ethics", as: "mean_ethics" },
        { op: "mean", field: "avg_sentiment", as: "mean_sentiment" }
      ]
    },
    {
      calculate: `
        datum.avg_ethics < datum.mean_ethics && datum.avg_sentiment > 0
        ? 'Low Ethics, High Sentiment'
        : datum.avg_ethics < datum.mean_ethics && datum.avg_sentiment <= 0
        ? 'Low Ethics, Low Sentiment'
        : datum.avg_ethics >= datum.mean_ethics && datum.avg_sentiment > 0
        ? 'High Ethics, High Sentiment'
        : 'High Ethics, Low Sentiment'
      `,
      as: "quadrant"
    },
    {
      calculate: "datum.quadrant === 'Low Ethics, High Sentiment'",
      as: "highlight"
    }
  ],

  layer: [


    {
      mark: { type: "rule", strokeDash: [4,4], color: "#bbb" },
      encoding: {
        x: { field: "mean_ethics", type: "quantitative" }
      }
    },
    {
      mark: {
        type: "text",
        dy: -190,
        dx: 70,
        fontSize: 11,
        color: "#666",
        baseline: "bottom"
      },
      encoding: {
        x: { field: "mean_ethics", type: "quantitative" },
        text: { value: "Average Ethics Rating" }
      }
    },

    {
      mark: { type: "rule", strokeDash: [4,4], color: "#bbb" },
      encoding: {
        y: { field: "mean_sentiment", type: "quantitative" }
      }
    },

    {
      mark: {
        type: "text",
        dx: 20,
        dy: -10,
        fontSize: 11,
        color: "#666"
      },
      encoding: {
        y: { field: "mean_sentiment", type: "quantitative" },
        x: { aggregate: "min", field: "avg_ethics" },
        text: { value: "Average Public Sentiment" }
      }
    },


    {
      mark: {
        type: "circle",
        size: 260,
        stroke: "white",
        strokeWidth: 2
      },
      encoding: {
        x: {
          field: "avg_ethics",
          type: "quantitative",
          title: "Ethical Rating (Higher = Better)",
          scale: { zero: false }
        },
        y: {
          field: "avg_sentiment",
          type: "quantitative",
          title: "Public Sentiment Score (Higher = Better)",
          scale: { zero: false, padding: 20 }
        },
        color: {
          condition: {
            test: "datum.highlight",
            value: "#f062a6"
          },
          value: "#bdbdbd"
        },
        opacity: {
          condition: { test: "datum.highlight", value: 1 },
          value: 0.6
        },
        tooltip: [
          { field: "Brand", type: "nominal" },
          { field: "avg_ethics", type: "quantitative", format: ".2f", title: "Ethical Rating" },
          { field: "avg_sentiment", type: "quantitative", format: ".2f", title: "Public Sentiment" },
          { field: "quadrant", type: "nominal", title:"Classification" }
        ]
      }
    },


    {
      mark: {
        type: "text",
        fontSize: 12,
        fontWeight: "bold",
        dy:-15
      },
      encoding: {
        x: { field: "avg_ethics", type: "quantitative" },
        y: { field: "avg_sentiment", type: "quantitative" },
        text: { field: "Brand" },

        dx: {
          condition: {
            test: "datum.highlight",
            value: 8
          },
          value: 0
        },
        dy: {
          condition: {
            test: "datum.highlight",
            value: -8
          },
          value: -14
        },
        align: {
          condition: { test: "datum.highlight", value: "left" },
          value: "center"
        },

        color: {
          condition: {
            test: "datum.highlight",
            value: "#f062a6"
          },
          value: "#333",
        }
      }
    },

    {
      transform: [
        { filter: "datum.highlight" }
      ],
      mark: {
        type: "text",
        dx: 100,
        fontSize: 10,
        color: "#f062a6"
      },
      encoding: {
        x: { field: "avg_ethics", type: "quantitative" },
        y: { field: "avg_sentiment", type: "quantitative" },
        text: { value: "High sentiment despite low ethics" }
        
      }
    }

  ]

}, { actions: false,
  tooltip: customTooltipHandler });