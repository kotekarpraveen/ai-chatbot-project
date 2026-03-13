import axios from "axios";
import cheerio from "cheerio";

export async function scrapeWebsite(url) {

    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    let text = "";

    $("p").each((i, el) => {
        text += $(el).text() + "\n";
    });

    return text;

}