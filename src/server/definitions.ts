export type Card = {
    id: string;
    set_id: string;
    name: string;
    set_number: string;
    tcgplayer_id: string;
    tcgplayer_last_load?: Date;
    tcgplayer_price?: string;
    tcgplayer_price_foil?: string;
}