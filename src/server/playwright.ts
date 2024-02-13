import playwright from 'playwright';

function getProductUrl(itemId: String) {
    return `https://www.tcgplayer.com/product/${itemId}?Language=English`;
}

function getGridPageUrl(setCodename: String, page: Number) {
    return `https://www.tcgplayer.com/search/lorcana-tcg/product?view=grid&productLineName=lorcana-tcg&ProductTypeName=Cards&setName=${setCodename}&page=${page}`
}

class pwManager {
    browser?: playwright.Browser;
    page?: playwright.Page;

    async getPage(url: string): Promise<playwright.Page> {
        if (!this.browser)
            this.browser = await playwright.chromium.launch({
                headless: true
            });
        if (!this.page)
            this.page = await this.browser.newPage();

        await this.page.goto(url);
        await this.page.waitForLoadState('domcontentloaded');

        return this.page;
    }

    async close() {
        if (this.browser)
            await this.browser.close();
    }
}

export async function getNumberOfPages(setCodename: String): Promise<number> {
    const pwMan = new pwManager();
    const page = await pwMan.getPage(getGridPageUrl(setCodename, 1));

    const numberOfPages = await page.locator('css=.tcg-pagination__pages')
        .getByRole('link')
        .last()
        .textContent();

    await pwMan.close();

    if (numberOfPages)
        return parseInt(numberOfPages);
    return 0;
}

export async function loadAllCardsInSet(setCodename: String) {
    const numPages = await getNumberOfPages(setCodename);
    const pwMan = new pwManager();
    const cards = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await pwMan.getPage(getGridPageUrl(setCodename, i));

        const cardsOnPageLocator = await page.locator('css=.search-result');
        await cardsOnPageLocator.first().waitFor();
        const cardsOnPage = await cardsOnPageLocator.all();
        for (const cardTile of cardsOnPage) {
            const name = await cardTile.locator('css=.search-result__title').textContent();
            const setNumber = (await cardTile.locator('css=.search-result__rarity').textContent())?.split('#')[1];
            const productUrl = await cardTile.getByRole('link').getAttribute('href');
            const tcgPlayerId = productUrl?.split('/')[2];

            cards.push({name, setNumber, tcgPlayerId});
        }
    }

    pwMan.close();
    console.log(cards);
}

export async function loadTcgItem(itemId: String): Promise<any> {
    const pwMan = new pwManager();
    const page = await pwMan.getPage(getProductUrl(itemId));

    const marketTr = page.locator('tr', {
        hasText: 'market',
        hasNotText: 'buylist'
    });
    const normalPrice = await marketTr.locator('css=td:nth-child(2)').textContent();
    const foilPrice = await marketTr.locator('css=td:nth-child(3)').textContent();

    const response = { 'normal': normalPrice, 'foil': foilPrice };

    await pwMan.close();

    return response;
}


