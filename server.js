const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router(require("./db.js")());
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);

server.use(jsonServer.bodyParser);

router.render = (req, res) => {
  if (req.url !== "/companies") {
    const reqPage = parseInt(req.url.split("page=").pop().split("&")[0]);
    const reqLimit = parseInt(req.url.split("limit=").pop().split("&")[0]);
    const reqBrands = req.url.includes("brands=")
      ? req.url.split("brands=").pop().split("&")[0].split(",")
      : [];
    const reqTags = req.url.includes("itemTags=")
      ? req.url.split("itemTags=").pop().split("&")[0].split(",")
      : [];

    const filteredByBrands = reqBrands.length
      ? res.locals.data.filter((data) =>
          reqBrands.some((brand) => brand === data.manufacturer)
        )
      : res.locals.data;

    const filteredByTags = reqTags.length
      ? res.locals.data.filter((data) =>
          reqTags.some((tag) => data.tags.includes(tag))
        )
      : res.locals.data;

    const filteredByBoth = reqTags.length
      ? filteredByBrands.filter((data) =>
          reqTags.some((tag) => data.tags.includes(tag))
        )
      : filteredByBrands;

    const filteredData = filteredByBoth;
    const data = filteredData.slice(
      (reqPage - 1) * reqLimit,
      reqPage * reqLimit
    );
    const dataCount = filteredData.length;
    const brands = filteredByTags.reduce((acc, curr) => {
      const placedSameManufacturerItem = acc.filter(
        (manufacturer) => manufacturer.slug === curr.manufacturer
      )[0];
      if (placedSameManufacturerItem) {
        placedSameManufacturerItem.count += 1;
      } else {
        acc.push({ slug: curr.manufacturer, count: 1 });
      }
      return acc;
    }, []);
    const tags = filteredByBrands.reduce((acc, curr) => {
      curr.tags.forEach((tag) => {
        const placedSameTagItem = acc.filter((slug) => tag === slug.slug)[0];
        if (placedSameTagItem) {
          placedSameTagItem.count += 1;
        } else {
          acc.push({ slug: tag, count: 1 });
        }
      });
      return acc;
    }, []);

    res.jsonp({
      data: data,
      count: dataCount,
      brands: brands,
      tags: tags,
    });
  } else {
    res.jsonp(res.locals.data);
  }
};

server.use(router);

server.listen(port);
