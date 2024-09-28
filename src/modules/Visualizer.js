export class Visualizer {
  #table;
  #type = {
    "#Ticker-tickers": {
      id: null,
      apiRoute: "api/cotacoes/acao/chart",
      siteRoute: null,
      external: false
    },

    "#Fii-tickers": {
      id: "data-company-id",
      apiRoute: "api/fii/cotacoes/chart",
      siteRoute: "fiis",
      external: true
    }
  }

  constructor(table) {
    this.#table = table;
  }

  async #getExternalID(ticker, requestData) {
    const response = await fetch(`/${requestData.siteRoute}/${ticker.toLowerCase()}/`)
    const HTMLData = await response.text();

    const container = document.createElement("div");
    container.innerHTML = HTMLData;

    const id = container.querySelector(`[${requestData.id}]`).getAttribute(requestData.id);

    return id;
  }

  async #getData(days = 30) {
    const tickers = this.#table.getTickers();
    const requestData = this.#type[this.#table.getId()];

    let html = "";

    if (!requestData) return;

    for (const ticker of tickers) {
      const APIData = await fetch(`/${requestData.apiRoute}/${requestData.external ? await this.#getExternalID(ticker, requestData) : ticker.toLowerCase()}/${days}`)
      const prices = await APIData.json();

      console.log(prices.real);
    }
  }

  async render(props) {
    const table = document.querySelector(this.#table.getId());

    table.insertAdjacentHTML("afterend",
      `
        <div class="header">
          <div class="col" style="display:flex;gap:32px;flex:1">
            ${props.includes("var") ? `
              <div>
                <span class="desktop">Variação (R$):</span>
                <strong>${this.#table.getVariation().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
              </div >
            ` : ""}

            ${props.includes("dy") ? `
              <div>
                <span class="desktop">DY (Média):</span>
                <strong>${String(this.#table.getDividendYieldAverage().toFixed(2)).replace(".", ",")}%</strong>
              </div>
            ` : ""}

            ${props.includes("yoc") ? `
              <div>
                <span class="desktop">Yield On Cost (Média):</span>
                <strong>${String(this.#table.getYieldOnCostAverage().toFixed(2)).replace(".", ",")}%</strong>
              </div >
            ` : ""}
          </div >

          <button data-history-handler="${this.#table.getId()}" style="width:50px;display:grid;place-items:center;background:transparent;border:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#222222" viewBox="0 0 256 256"><path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z"></path></svg>
          </button>

        </div >
      `);

    document.body.insertAdjacentHTML("beforeend", `
        <div data-history="${this.#table.getId()}" style="position:fixed;z-index:9999999999;background:rgba(0,0,0,0.6);inset:0;display:none;place-items:center">
          <div style="background:#ffffff;padding: 2rem;width:100%;max-width:1280px;height:100%;max-height:720px;position:relative;">
            <button data-history-handler="${this.#table.getId()}" style="background:transparent;border:none;position:absolute;right:1.5rem;top:1.5rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#222222" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
            </button>

            <div style="margin-top:1rem;">
              <h2 style="color:#222222;">Histórico</h2>

              <div id="history-cards-container" style="display:grid;grid-template-columns:repeat(4,1fr);margin-top:2rem;gap:30px">
                ${this.#table.getTickers().reduce((acc, crt) => {
      return acc + `
                  <div style="border-radius:10px;border:1px solid #ccc;padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <h3>${crt}</h3>
                      <strong>R$ 00,00</strong>
                    </div>
                  </div>
                `;
    }, "")}
              </div>
            </div>
          </div>
        </div>
      `)

    document.querySelectorAll(`[data-history-handler="${this.#table.getId()}"]`).forEach(item => item.addEventListener("click", () => {
      const modal = document.querySelector(`[data-history="${this.#table.getId()}"]`)
      const styles = window.getComputedStyle(modal);

      if (styles.display === 'grid') {
        modal.style.display = "none";
      } else {
        modal.style.display = "grid";
        this.#getData().then()
      }
    }))

  }

  static initialize(props) {
    return new Visualizer(props);
  }
}