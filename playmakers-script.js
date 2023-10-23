const axios = require("axios");

const productionURL = "https://growing-moonlight-c9cb750c3b.strapiapp.com/";
const localURL = "http://localhost:1337/";
//prod token
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjkxNTA4OTc0LCJleHAiOjE2OTQxMDA5NzR9.ytjv8l_35TtDW9y9p5KG3vhmf0Cyr8ptsBsZNe6kjqU";
//local token
// const token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjkyMjc2OTE3LCJleHAiOjE2OTQ4Njg5MTd9.3f9UXJm7UJZu-5_DzAJpVAwJgq88veLA3Hd5BBtDEKc";
async function migrateDataPosts() {
  try {
    const wordpressData = await axios.get(
      "https://playmakers.com/wp-json/wp/v2/posts?per_page=100"
    );

    // Transform data if needed
    const strapiDataArtclePosts = wordpressData.data.map((post) => ({
      data: {
        postTitle: post.title.rendered,
        wpId: post.id,
        articleBody: post.content.rendered,
        postDate: post.date,
        slug: post.slug,
        articleExcerpt: post.excerpt.rendered,
        seoMetaInformation: [
          {
            seoTitle: post.yoast_head_json.title,
            seoMetaDescription: post.yoast_head_json.description,
            seoOgDescription: post.yoast_head_json.og_description,
          },
        ],
        // Map other fields as required by your Strapi API
      },
    }));
    // console.log(strapiDataArtclePosts);

    for (const dataObject of strapiDataArtclePosts) {
      // Send a POST request for each object in strapiData
      const response = await axios.post(
        `${productionURL}api/article-posts`,
        dataObject,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Data migration successful for:", dataObject.data.postTitle);
    }
  } catch (error) {
    console.error("Data migration failed:", error.message);
  }
}

async function migrateDataEvents() {
  try {
    const wordpressData = await axios.get(
      "https://playmakers.com/wp-json/wp/v2/featured-races"
    );
    console.log(wordpressData);
    // Transform data if needed
    const strapiDataEvents = wordpressData.data.map((post) => ({
      data: {
        eventName: post.title.rendered,
        wpId: post.id,
        eventDescription: post.content.rendered,
        // eventDate,
        eventType: post.type,
        // eventSignUpUrl,
        slug: post.slug,
        seoMetaInformation: [
          {
            seoTitle: post.yoast_head_json.title,
            seoMetaDescription: post.yoast_head_json.description,
            seoOgDescription: post.yoast_head_json.og_description,
          },
        ],
        // Map other fields as required by your Strapi API
      },
    }));

    console.log(strapiDataEvents);
    for (const dataObject of strapiDataEvents) {
      // Send a POST request for each object in strapiData
      const response = await axios.post(
        `${productionURL}api/events`,
        dataObject,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Data migration successful for:", dataObject.data.eventName);
    }
  } catch (error) {
    console.error("Data migration failed:", error.message);
  }
}

async function migrateDataRaceResults() {
  let i = 1;
  try {
    while (true) {
      const wordpressData = await axios.get(
        `https://playmakers.com/wp-json/wp/v2/race-results?per_page=100&page=${i}`
      );

      if (wordpressData.data.length === 0) {
        // No more data, break the loop
        break;
      }

      const strapiRaceResults = wordpressData.data.map((post) => ({
        data: {
          raceName: post.title.rendered,
          wpId: post.id,
          raceCity: post.acf.race_city,
          raceState: post.acf.race_state,
          raceType: post.acf.race_type,
          raceResultUrl: [
            {
              linkText: post.acf.race_url,
              linkUrl: post.acf.race_url,
            },
          ],
          slug: post.slug,
          seoMetaInformation: [
            {
              seoTitle: post.yoast_head_json.title,
              seoMetaDescription: post.yoast_head_json.description,
              seoOgDescription: post.yoast_head_json.og_description,
            },
          ],
          // Map other fields as required by your Strapi API
        },
      }));

      for (const dataObject of strapiRaceResults) {
        // Send a POST request for each object in strapiData
        const response = await axios.post(
          `${productionURL}api/race-results`,
          dataObject,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Data migration successful for:", dataObject.data.raceName);
      }

      i++;
    }
  } catch (error) {
    console.error("Data migration failed:", error.message);
  }
}

async function migrateDataBrands() {
  let i = 1;
  try {
    while (true) {
      const wordpressData = await axios.get(
        `https://playmakers.com/wp-json/wp/v2/brand?per_page=100&page=${i}`
      );

      if (wordpressData.data.length === 0) {
        // No more data, break the loop
        break;
      }

      const strapiRaceResults = wordpressData.data.map((post) => ({
        data: {
          brandName: post.title.rendered,
          wpId: post.id,
          brandFeaturedCategories: post.acf.brand_featured_categories,
          brandPillars: post.acf.brand_pillars,
          brandFeaturedProducts: post.acf.brand_feature_products,
          brandPageHeader: [
            {
              backgroundColor: post.acf.brand_page_header.background_color,
              textColor: post.acf.brand_page_header.text_color,
              brandHeading: post.acf.brand_page_header.brand_header_heading,
              brandText: post.acf.brand_page_header.brand_header_text,
              logoImgId: post.acf.brand_page_header.brand_header_logo,
              button: [
                {
                  linkText: post.acf.brand_page_header.brand_header_text_button,
                  linkUrl: post.acf.brand_page_header.button_url,
                },
              ],
            },
          ],
          whyWeLove: [
            {
              header: post.acf.brand_why_we_love.brand_love_header,
              body: post.acf.brand_why_we_love.brand_love_body,
              imgId: post.acf.brand_why_we_love.brand_love_image,
            },
          ],
          brandOptionalVideoEmbed:
            post.acf.brand_optional_video_embed.brand_video_embed_section,
          brandInfoBox: [
            {
              heading: post.acf.brand_footer_info_box.brand_footer_heading,
              description:
                post.acf.brand_footer_info_box.brand_footer_description,
              button: [
                {
                  linkText:
                    post.acf.brand_footer_info_box.brand_footer_button_text,
                  linkUrl:
                    post.acf.brand_footer_info_box.bran_footer_button_url,
                },
              ],
            },
          ],
          brandSubscribe: [
            {
              heading: post.acf.brand_subscribe.brand_subscribe_heading,
              description: post.acf.brand_subscribe.brand_subscribe_description,
              wcImgId: post.acf.brand_subscribe.brand_subscribe_image,
            },
          ],
          slug: post.slug,
          seoMetaInformation: [
            {
              seoTitle: post.yoast_head_json.title,
              seoMetaDescription: post.yoast_head_json.description,
              seoOgDescription: post.yoast_head_json.og_description,
            },
          ],
          // Map other fields as required by your Strapi API
        },
      }));

      for (const dataObject of strapiRaceResults) {
        // Send a POST request for each object in strapiData
        // const response = await axios.post(`${localURL}api/brands`, dataObject, {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     "Content-Type": "application/json",
        //   },
        // });

        console.log("Data migration successful for:", dataObject.data);
      }

      i++;
    }
  } catch (error) {
    console.error("Data migration failed:", error.message);
  }
}

async function migrateDataPages() {
  let i = 1;
  try {
    while (true) {
      const wordpressData = await axios.get(
        `https://playmakers.com/wp-json/wp/v2/pages?per_page=100&page=${i}`
      );

      if (wordpressData.data.length === 0) {
        // No more data, break the loop
        break;
      }

      const strapiRaceResults = wordpressData.data.map((post) => ({
        data: {
          pageTitle: post.title.rendered,
          wpId: post.id,
          acf: post.acf,
          pageContent: post.content.rendered,
          pageExcerpt: post.excerpt.rendered,
          pageSlug: post.slug,
          seoMetaInformation: [
            {
              seoTitle: post.yoast_head_json.title,
              seoMetaDescription: post.yoast_head_json.description,
              seoOgDescription: post.yoast_head_json.og_description,
            },
          ],
          // Map other fields as required by your Strapi API
        },
      }));

      for (const dataObject of strapiRaceResults) {
        // Send a POST request for each object in strapiData
        const response = await axios.post(
          `${productionURL}api/pages`,
          dataObject,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Data migration successful for:", dataObject.data);
      }

      i++;
    }
  } catch (error) {
    console.error("Data migration failed:", error.message);
  }
}

async function migrateDataResources() {
  let i = 1;
  try {
    while (true) {
      const wordpressData = await axios.get(
        `https://playmakers.com/wp-json/wp/v2/resource?per_page=100&page=${i}`
      );

      if (wordpressData.data.length === 0) {
        // No more data, break the loop
        break;
      }

      const strapiRaceResults = wordpressData.data.map((post) => ({
        data: {
          resourceName: post.title.rendered,
          wpId: post.id,
          acf: post.acf,
          resourceDescription: post.content.rendered,
          resourceExcerpt: post.excerpt.rendered,
          pageSlug: post.slug,
          seoMetaInformation: [
            {
              seoTitle: post.yoast_head_json.title,
              seoMetaDescription: post.yoast_head_json.description,
              seoOgDescription: post.yoast_head_json.og_description,
            },
          ],
          // Map other fields as required by your Strapi API
        },
      }));

      for (const dataObject of strapiRaceResults) {
        // Send a POST request for each object in strapiData
        const response = await axios.post(
          `${productionURL}api/resources`,
          dataObject,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Data migration successful for:", dataObject.data);
      }

      i++;
    }
  } catch (error) {
    console.error("Data migration failed:", error.message);
  }
}
// Call the migration function

// migrateDataPosts();
// migrateDataEvents();
// migrateDataRaceResults();
// migrateDataBrands();
// migrateDataPages();
migrateDataResources();
