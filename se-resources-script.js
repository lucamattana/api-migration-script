const axios = require("axios");

const wpURL = "https://somethingexdev.wpengine.com/wp-json/wp/v2";
const username = "somethingexdev";
const password = "geSP ee9c 4u8O WK9G MX6Z 7SFG";

const basicAuthCredentials = `${username}:${password}`;
const encodedCredentials = Buffer.from(basicAuthCredentials).toString("base64");

//---------------------------------------------------------------
const contentData = [];
const failedParentIds = [];

async function fetchData(endpoint) {
  try {
    const response = await axios.get(endpoint, {
      auth: {
        username,
        password,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function fetchContentByParentId(parentId) {
  const pathEndpoint = `https://somethingextra.org/index.cfm/_api/json/v1/siteDSAMT/?&parentid=${parentId}&method=findQuery&siteid=siteDSAMT&entityname=content`;

  try {
    const contentResponse = await fetchData(pathEndpoint);
    if (contentResponse && contentResponse.data && contentResponse.data.items) {
      contentData.push(...contentResponse.data.items);
    } else {
      failedParentIds.push(parentId);
    }
  } catch (error) {
    console.error(`Error fetching data for parent ID: ${parentId}`, error);
    failedParentIds.push(parentId);
  }
}

async function postDataToAnotherAPI(data) {
  const failedPosts = [];

  for (const dataObject of data) {
    try {
      const response = await axios.post(
        `${wpURL}/resource`,
        {
          title: dataObject.title,
          excerpt: dataObject.summary,
          acf: {
            title_link_url: dataObject.assocurl,
            custom_excerpt: dataObject.summary,
            filename: dataObject.filename,
          },
        },
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Data migration successful for:",

        dataObject.title
        // dataObject.summary,
        // dataObject.assocurl,
        // dataObject.filename
      );
    } catch (error) {
      console.error(
        "Data migration failed for:",
        dataObject.title,
        error.message
      );
      failedPosts.push(dataObject);
    }
  }

  if (failedPosts.length > 0) {
    console.log("Failed to migrate data for the following posts:", failedPosts);
  } else {
    console.log("All data migration successful!");
  }
}

async function main(parentIds) {
  for (const parentId of parentIds) {
    await fetchContentByParentId(parentId);
  }

  if (failedParentIds.length > 0) {
    console.log(
      "Failed to fetch data for the following parent IDs:",
      failedParentIds
    );
  }

  await postDataToAnotherAPI(contentData);

  console.log("Data processing and posting completed!");
}

const initialParentIds = [
  "A1768CCA-6DAD-CB18-4E3C6640C98FFF6F",
  "A175C78A-6DAD-CB18-4E30DA5BF2114FE6",
  "A175CBD0-6DAD-CB18-4E34459DCEA0B78A",
  "A17591E9-6DAD-CB18-4E3AC877F770FAB4",
  "A2135B6D-6DAD-CB18-4E3D07C08D3924FE",
  "A17590A6-6DAD-CB18-4E34CDDD77C09E51",
  "A1758BA7-6DAD-CB18-4E37A559B9C0A634",
  "A1758C56-6DAD-CB18-4E39F7C8E68EBE13",
  "A1759144-6DAD-CB18-4E358955F9E866FA",
  "A1759006-6DAD-CB18-4E38DF28168AD469",
  "A175BE45-6DAD-CB18-4E3934142B809669",
  "A175CD9D-6DAD-CB18-4E31DE8F3AEE0BA0",
  "A1759B5C-6DAD-CB18-4E360243C42F0DCF",
  "37D2E283-6DAD-CB18-4E33E317968EF764",
  "A1759C8D-6DAD-CB18-4E3BEA9C1F10D179",
  "A1759ABE-6DAD-CB18-4E35F0EA1F3FDAEB",
  "A1758ECB-6DAD-CB18-4E38B79BC6BAFE2C",
  "97A44430-6DAD-CB18-4E30EEC3D6F3DE28",
  "A175931F-6DAD-CB18-4E33CA279C46BBCE",
  "A1768A62-6DAD-CB18-4E3536C66662BCE2",
  "A1758E2D-6DAD-CB18-4E391F2012BB3066",
  "A1758D95-6DAD-CB18-4E36CDA43E57E95B",
  "A1758CFE-6DAD-CB18-4E36DE7E0CA7E0AE",
  "A1758F69-6DAD-CB18-4E3625CE93F8127A",
]; // Add more parent IDs as needed
main(initialParentIds);

//---------------------------------------------------------------
