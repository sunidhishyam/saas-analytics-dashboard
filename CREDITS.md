# Credits

This project is built on top of the open-source MERN Admin Dashboard by **besufekad-haz**.

- Original repository: https://github.com/besufekad-haz/mern-admin-dashboard
- Original author: [besufekad-haz](https://github.com/besufekad-haz)
- License: MIT

## Enhancements added in this fork

- **KPI Growth API** (`/kpi/growth`): New endpoint that computes month-over-month revenue and units growth percentages using MongoDB aggregation on `OverallStat` monthly data.
- **KPI Summary API** (`/kpi/summary`): Returns a consolidated summary — total customers, yearly sales/units, and the top-selling product category.
- **CSV Export API** (`/export/transactions`, `/export/monthly-sales`): Streams transaction and monthly sales data as downloadable CSV files, with pagination support on the transactions endpoint.
- Route registrations for `/kpi` and `/export` added to `server/index.js`.
