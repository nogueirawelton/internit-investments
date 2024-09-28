export class Table {
  #tableID;
  #rows;

  constructor(tableID) {
    this.#tableID = tableID
  }

  // AVERAGE

  getVariation() {
    const amount = this.getAmount()
    const currentPriceVariation = this.getCurrentPrice().map((item, index) => item * amount[index])
    const averagePriceVariation = this.getAveragePrice().map((item, index) => item * amount[index])

    const totalCurrentPriceVariation = currentPriceVariation.reduce((acc, crt) => acc + crt, 0);
    const totalAveragePriceVariation = averagePriceVariation.reduce((acc, crt) => acc + crt, 0);

    return totalCurrentPriceVariation - totalAveragePriceVariation;
  }

  getDividendYieldAverage() {
    const totalDY = this.getDividendYield().reduce((acc, crt) => acc + crt, 0);
    const lengthDY = this.getDividendYield().length

    return totalDY / lengthDY;
  }

  getYieldOnCostAverage() {
    const totalYOC = this.getYieldOnCost().reduce((acc, crt) => acc + crt, 0);
    const lengthYOC = this.getYieldOnCost().length

    return totalYOC / lengthYOC;
  }

  // BASE

  getDividendYield() {
    const column = this.#getFieldColumn("DY");
    return column != -1 && this.#parseData(column, "percent")
  }

  getYieldOnCost() {
    const column = this.#getFieldColumn("Yield On Cost");
    return column != -1 && this.#parseData(column, "percent")
  }

  getCurrentPrice() {
    const column = this.#getFieldColumn("Preço Atual");
    return column != -1 && this.#parseData(column, "price")
  }

  getAveragePrice() {
    const column = this.#getFieldColumn("Preço Médio");
    return column != -1 && this.#parseData(column, "price")
  }

  getTickers() {
    const column = this.#getFieldColumn("Ativo");
    return column != -1 && this.#parseData(column, "ticker")
  }

  getAmount() {
    const column = this.#getFieldColumn("Quantidade");
    return column != -1 && this.#parseData(column)
  }

  // UTILS

  getId() {
    return this.#tableID;
  }

  #parseData(column, type = "none") {
    const cb = {
      price: (row) => +row.querySelectorAll("td")[column]?.innerText.replaceAll(".", "").replaceAll(",", ".").replaceAll("R$ ", ""),
      percent: (row) => +row.querySelectorAll("td")[column]?.innerText.replaceAll(".", "").replaceAll(",", ".").replaceAll("%", ""),
      none: (row) => +row.querySelectorAll("td")[column]?.innerText.replaceAll(",", "."),
      ticker: (row) => row.querySelectorAll("td")[column]?.querySelector(".name").innerText
    }

    return this.#rows.slice(1).map(cb[type])
  }

  #getFieldColumn(field) {
    return [...this.#rows[0].querySelectorAll("th")].findIndex((item) => item.innerText.includes(field));
  }

  // ASYNC INIT

  async #loadTable() {
    if (!this.#tableID) {
      console.log("Invalid Table")
      return;
    }

    return await new Promise((resolve) => {
      const table = document.querySelector(this.#tableID);

      if (table) {
        const interval = setInterval(() => {
          const processing = document.querySelector(`${this.#tableID}_processing`)

          if (processing && !processing.checkVisibility()) {
            this.#rows = [...table.querySelectorAll("tr")]
            if (document.querySelector(`${this.#tableID} .dataTables_empty`)) {
              resolve(null);
            }

            resolve(this);
            clearInterval(interval);
          }
        }, 1000)
      } else {
        console.log(`${this.#tableID} not found!`)
        resolve(null)
      }
    })
  }

  async #init() {
    return await this.#loadTable()
  }

  static async initialize(props) {
    return await new Table(props).#init()
  }
}