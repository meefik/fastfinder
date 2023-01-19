# fastfinder-parser

Website search parser.

## How to run the server

```sh
npm start
```

## Run the server in dev mode

```sh
npm run dev
```

## Run tests

```sh
npm test
```

## Send request to API

cURL request:

```sh
curl -X POST -H 'Content-Type: application/json' -H 'X-Api-Key: secret' -d '{
    "vehicle": {
      "year": "2015",
      "make": "Ford",
      "model": "Transit-150",
      "engine": "5 Cylinders V 3.2L Turbo Dsl DOHC 195 CID",
      "vin": ""
    },
    "location": {
      "zip": "98264"
    },
    "categories": [
      "Batteries, Starting and Charging",
      "Batteries",
      "Battery"
    ]
}' http://localhost:8080/api/autozone
```

Output:

```json
[
    {
        "image": "https://contentinfo.autozone.com/znetcs/product-info/en/US/jci/H6-AGM/image/2/",
        "title": "Duralast Platinum AGM Battery H6-AGM Group Size 48 760 CCA",
        "price": 239.99,
        "location": "142 BAY LYN DR",
        "availability": true,
        "link": "https://www.autozone.com/batteries-starting-and-charging/battery/p/duralast-platinum-agm-battery-h6-agm-group-size-48-760-cca/319460_0_0"
    },
    {
        "image": "https://contentinfo.autozone.com/znetcs/product-info/en/US/jci/DH6/image/2/",
        "title": "Optima AGM Yellow Top Battery DH6 Group Size H6/LN3 800 CCA",
        "price": 339.99,
        "location": "",
        "availability": false,
        "link": "https://www.autozone.com/batteries-starting-and-charging/battery/p/optima-agm-yellow-top-battery-dh6-group-size-h6-ln3-800-cca/937705_0_0"
    },
    {
        "image": "https://contentinfo.autozone.com/znetcs/product-info/en/US/ody/48-720T/image/2/",
        "title": "Odyssey Battery 48-720T Group Size 48 723 CCA",
        "price": 324.99,
        "location": "142 BAY LYN DR",
        "availability": true,
        "link": "https://www.autozone.com/batteries-starting-and-charging/battery/p/odyssey-battery-48-720t-group-size-48-723-cca/832130_0_0"
    }
]
```
