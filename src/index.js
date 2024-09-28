import { Table } from "./modules/Table"
import { Visualizer } from "./modules/Visualizer";

const investments = [
  {
    id: "#Ticker-tickers",
    params: ["dy", "yoc", "var"]
  },
  {
    id: "#Fii-tickers",
    params: ["dy", "yoc", "var"]
  },
  {
    id: "#Crypto-tickers",
    params: ["var"]
  },
  {
    id: "#Etf-tickers",
    params: ["var"]
  }
]

document.addEventListener("DOMContentLoaded", async () => {
  investments.forEach(async ({ id, params }) => {
    const table = await Table.initialize(id);

    if (table) {
      Visualizer.initialize(table).render(params);
    }
  })
})