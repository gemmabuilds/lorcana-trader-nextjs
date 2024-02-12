import { loadTcgItem, getNumberOfPages } from '@/server/playwright';

export default async function Page() {
    const {normal, foil} = await loadTcgItem('503469');
    const pages = await getNumberOfPages('the-first-chapter');

    return (
        <main>
            <h1>Lorcana Trader</h1>
            <p>Normal Price: {normal}</p>
            <p>Foil Price: {foil}</p>
            <p>Number of pages in The First Chapter: {pages.toString()}</p>
        </main>
    );
}