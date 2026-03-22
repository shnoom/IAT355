const data = [
  { "Brand": "Shein", "Production": 501.5, "Water": 195.6, "Price": 20.10, "DailyWage": 5.84 },
  { "Brand": "H&M", "Production": 500.3, "Water": 198.0, "Price": 19.80, "DailyWage": 5.80 },
  { "Brand": "Forever 21", "Production": 497.6, "Water": 204.2, "Price": 19.85, "DailyWage": 5.70 },
  { "Brand": "Zara", "Production": 497.5, "Water": 202.1, "Price": 19.99, "DailyWage": 5.76 },
  { "Brand": "Uniqlo", "Production": 489.6, "Water": 204.6, "Price": 19.96, "DailyWage": 5.72 }
];
// just divided thei monthly by 26 (avergae working days in a month) to get the dialy wage number, so didn't have to like use another library
const config = {
  "view": {"stroke": "transparent"},
  "font": "Work Sans",
  "axis": {
    "domain": false,
    "ticks": false,
    "labelColor": "#888",
    "titleColor": "#888",
    "gridColor": "#f0f0f0",
  
    
  }
};

// Chart 1: Productions CHart
vegaEmbed('#vis-production', {
  ...config,
  "data": {"values": data},
  "width": 600, "height": 300,
  "mark": {"type": "bar", "color": "#222", "size": 30},
  "encoding": {
    "x": {"field": "Brand", "type": "nominal", "sort": "-y", "axis": {"labelAngle": 0, "title": "Retailer Brand"}},
    "y": {"field": "Production", "type": "quantitative", "title": "Tonnes per Month"}
  }
});

// Chart 2: Water usage
vegaEmbed('#vis-water', {
  ...config,
  "data": {"values": data},
  "width": 600, "height": 300,
  "layer": [
    {"mark": {"type": "bar", "color": "#eee"}, "encoding": {
      "x": {"field": "Brand", "type": "nominal", "sort": "-y", "axis": {"labelAngle": 0, "title": "Retailer Brand"}},
      "y": {"field": "Water", "type": "quantitative", "title": "Million Litres"}
    }},
    {"data": {"values": [{"y": 0.08}]}, "mark": {"type": "rule", "color": "#e63946", "size": 2}, "encoding": {
      "y": {"field": "y", "type": "quantitative"}
    }}
  ]
});

// Chart 3: Cleveland dot plot for wage vs, price
vegaEmbed('#vis-wage', {
  ...config,
  "data": {"values": data},
  "width": 600, "height": 300,
  "layer": [
    {"mark": {"type": "rule", "color": "#ccc"}, "encoding": {
      "x": {"field": "Brand", "type": "nominal", "axis": {"labelAngle": 0, "title": "Retailer Brand"}},
      "y": {"field": "DailyWage", "type": "quantitative"},
      "y2": {"field": "Price"}
    }},
    {"mark": {"type": "point", "size": 100, "filled": true, "color": "#e63946"}, "encoding": {
      "x": {"field": "Brand", "type": "nominal"},
      "y": {"field": "Price", "type": "quantitative", "title": "USD ($)"}
    }},
    {"mark": {"type": "point", "size": 100, "filled": true, "color": "#222"}, "encoding": {
      "x": {"field": "Brand", "type": "nominal"},
      "y": {"field": "DailyWage", "type": "quantitative"}
    }}
  ]
});