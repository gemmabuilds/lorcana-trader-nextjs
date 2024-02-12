import playwright from 'playwright';

function getProductUrl(itemId: String) {
    return `https://www.tcgplayer.com/product/${itemId}?Language=English`;
}

function getGridPageUrl(setCodename: String, page: Number) {
    return `https://www.tcgplayer.com/search/lorcana-tcg/product?view=grid&productLineName=lorcana-tcg&setName=${setCodename}&page=${page}`
}

class pwManager {
    url: string;
    page?: playwright.Page;
    browser?: playwright.Browser;

    constructor(url: string) {
        this.url = url;
    }

    async getPage(): Promise<playwright.Page> {
        this.browser = await playwright.chromium.launch({
            headless: true
        });
        this.page = await this.browser.newPage();
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');

        return this.page;
    }

    async close() {
        if (this.browser)
            await this.browser.close();
    }
}

export async function getNumberOfPages(setCodename: String): Promise<Number> {
    const pwMan = new pwManager(getGridPageUrl(setCodename, 1));
    const page = await pwMan.getPage();

    const numberOfPages = await page.locator('css=.tcg-pagination__pages')
        .getByRole('link')
        .last()
        .textContent();

    await pwMan.close();

    if (numberOfPages)
        return parseInt(numberOfPages);
    return 0;
}

export async function loadTcgItem(itemId: String): Promise<any> {
    const pwMan = new pwManager(getProductUrl(itemId));
    const page = await pwMan.getPage();

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


