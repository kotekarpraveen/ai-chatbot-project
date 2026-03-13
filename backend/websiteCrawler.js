import axios from "axios";
import { load } from "cheerio";

export async function scrapeWebsite(url) {

    const { data } = await axios.get(url);

    const $ = load(data);

    let text = "";

    $("p").each((i, el) => {
        text += $(el).text() + "\n";
    });

    return text;

}