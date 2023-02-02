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
  "vin": "1FTSW21P75EA53447",
  "zip": "98264",
  "partNumber": "S9549XL"
}' http://localhost:8080/api/autozone
```

Output:

```json
[
  {
    "image": "https://contentinfo.autozone.com/znetcs/product-info/en/US/sxl/S9549XL/image/10/",
    "title": "STP Extended Life Oil Filter S9549XL",
    "partNumber": "S9549XL",
    "price": 14.99,
    "availability": true,
    "location": "142 BAY LYN DR",
    "fits": true,
    "link": "https://www.autozone.com/filters-and-pcv/oil-filter/p/stp-extended-life-oil-filter-s9549xl/663671_0_0?searchText=S9549XL"
  }
]
```
