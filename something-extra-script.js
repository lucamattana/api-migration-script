const axios = require("axios");

const wpURL = "https://somethingexdev.wpengine.com/wp-json/wp/v2";

const username = "somethingexdev";
const password = "geSP ee9c 4u8O WK9G MX6Z 7SFG";

const basicAuthCredentials = `${username}:${password}`;
const encodedCredentials = Buffer.from(basicAuthCredentials).toString("base64");

//---------------------------------------------------------------
const processedData = [];
const contentData = [];
const failedFilenames = [];

async function fetchData(endpoint) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function processItem(item) {
  console.log("Processing item:", item.title);
  processedData.push({
    filename: item.filename,
    title: item.title,
  });
  if (item.links && item.links.kids) {
    const childData = await fetchData(item.links.kids);
    if (childData && childData.data && childData.data.items) {
      for (const childItem of childData.data.items) {
        await processItem(childItem);
      }
    }
  }
}

async function fetchContentFromPath(filenames) {
  for (const filename of filenames) {
    const pathEndpoint = `https://somethingextra.org/index.cfm/_api/json/v1/siteDSAMT/content/_path/${filename}`;

    try {
      const contentResponse = await fetchData(pathEndpoint);
      if (contentResponse && contentResponse.data) {
        contentData.push(contentResponse.data);
      } else {
        failedFilenames.push(filename);
      }
    } catch (error) {
      console.error(`Error fetching data for filename: ${filename}`, error);
      failedFilenames.push(filename);
    }
  }
  return { contentData, failedFilenames };
}

async function postDataToAnotherAPI(data) {
  const failedPosts = [];

  const wpData = contentData.map((post) => ({
    title: post.title,
    content: post.body,
    excerpt: post.summary,
    slug: post.urltitle,
    acf: {
      custom_excerpt: post.summary,
      filename: post.filename,
    },
  }));

  for (const dataObject of wpData) {
    try {
      const response = await axios.post(
        `https://somethingexdev.wpengine.com/wp-json/wp/v2/posts`,
        dataObject,
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Data migration successful for:", dataObject.title);
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

async function startFetching(parentId) {
  let pageIndex = 1;
  let totalPages = 1;

  do {
    const endpoint = `https://somethingextra.org/index.cfm/_api/json/v1/siteDSAMT/?&parentid=${parentId}&method=findQuery&siteid=siteDSAMT&entityname=content&pageIndex=${pageIndex}`;

    const parentData = await fetchData(endpoint);

    if (parentData && parentData.data && parentData.data.items) {
      for (const parentItem of parentData.data.items) {
        await processItem(parentItem);
      }
    }

    totalPages = parentData.data.totalpages;
    pageIndex++;
  } while (pageIndex <= totalPages);
}

async function main(parentId) {
  await startFetching(parentId);

  // Extract filenames from processed data
  const filenames = processedData.map((d) => d.filename);

  const { contentData, failedFilenames } = await fetchContentFromPath(
    filenames
  );

  if (failedFilenames.length > 0) {
    console.log(
      "Failed to fetch data for the following filenames:",
      failedFilenames
    );
  }

  await postDataToAnotherAPI(contentData);

  console.log("Data processing and posting completed!");
}

const initialParentId = "A175C518-6DAD-CB18-4E346C8F1477B1E4";
main(initialParentId);

//---------------------------------------------------------------
