"use strict";
const _ = require("lodash");
/**
 * product controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::product.product", ({ strapi }) => ({
  async filterSearch(ctx) {
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const {
      sale,
      brands,
      category,
      pageCategory,
      subcat,
      size,
      search,
      pmin,
      pmax,
      currentPage,
      sorting,
      clearance,
      newproduct,
    } = sanitizedQueryParams;

    let howToSort = sorting;

    if (sorting == "Sort By") {
      howToSort = false;
    } else if (sorting == "Latest arrivals") {
      howToSort = false;
    } else if (sorting == "Price asc.") {
      howToSort = "asc";
    } else if (sorting == "Price desc.") {
      howToSort = "desc";
    }

    // pagination logic
    let startPage = 0;
    let limitPage = 24 * currentPage;
    if (currentPage > 1) {
      startPage = limitPage - 24;
    } else {
      startPage = 0;
    }

    //---------------

    const searchItem = search ? search : "";
    const salesSplitToArr = sale ? sale.split(",") : [];
    const brandsSplitToArr = brands ? brands.split(",") : [];
    const categorySplitToArr = category ? category.split(",") : [];
    const pageCategorySplitArr = pageCategory ? pageCategory.split(",") : [];
    const subCategoryArr = subcat ? subcat.split(",") : [];

    if (pageCategory == "all")
      pageCategorySplitArr.push("women's", "men's", "equipment");
    if (pageCategory == "men's" || pageCategory == "women's")
      pageCategorySplitArr.push("all");

    let sizeArr = [];
    if (
      size === "false" ||
      size === "undefined" ||
      size == undefined ||
      size === ""
    ) {
      sizeArr = [];
    } else {
      sizeArr = size.split(",");
    }
    // sizeArr = size ? size.split(",") : [];

    let priceMin = pmin ? pmin : 0;
    let priceMax = pmax ? pmax : 9999;

    // "sale" on/off
    let saleItem = false;
    salesSplitToArr.map((item) => {
      if (item == "Sale") {
        saleItem = !saleItem;
      }
    });
    //---------------

    const products = await strapi.entityService.findMany(
      "api::product.product",
      {
        start: startPage,
        limit: 24,
        sort: howToSort ? [{ price: howToSort }] : { id: "desc" },
        filters: {
          publishedAt: {
            $null: null,
          },
          $and: [
            {
              $or: [
                { title: { $startsWith: searchItem } },
                { brand: { $startsWith: searchItem } },
                {
                  searchKeyWord: {
                    keyWord: {
                      $startsWith: searchItem,
                    },
                  },
                },
              ],
            },
            {
              $or: [{ price: { $between: [priceMin, priceMax] } }],
            },
            {
              brand: {
                $eqi: brandsSplitToArr,
              },
            },
            {
              pageCategory: {
                $eqi: pageCategorySplitArr,
              },
            },
            {
              $or: [
                {
                  category: {
                    $eqi: categorySplitToArr,
                  },
                },
                {
                  equipmentCategory: {
                    $eqi: categorySplitToArr,
                  },
                },
              ],
            },
            {
              $or: [
                { lampsLanternsCategory: { $eqi: subCategoryArr } },
                { campSleepCategory: { $eqi: subCategoryArr } },
                { toolsGearCategory: { $eqi: subCategoryArr } },
                { otherCategory: { $eqi: subCategoryArr } },
                { clothingCategory: { $eqi: subCategoryArr } },
                { footwearCategory: { $eqi: subCategoryArr } },
                { accessoriesCategory: { $eqi: subCategoryArr } },
                { activityCategory: { $eqi: subCategoryArr } },
              ],
            },
            {
              $or: [
                { sale: saleItem ? true : true },
                { sale: saleItem ? true : false },
              ],
            },
            { clearance: clearance == "false" ? { $eqi: [] } : true },
            { new: newproduct == "false" ? { $eqi: [] } : true },
            {
              size: {
                size: {
                  $eqi: sizeArr,
                },
              },
            },
          ],
        },
        populate: {
          image: true,
          size: true,
        },
      }
    );

    const pagination = await strapi.entityService.findMany(
      "api::product.product",
      {
        filters: {
          publishedAt: {
            $null: null,
          },
          $and: [
            {
              $or: [
                { title: { $startsWith: searchItem } },
                { brand: { $startsWith: searchItem } },
                {
                  searchKeyWord: {
                    keyWord: {
                      $startsWith: searchItem,
                    },
                  },
                },
              ],
            },
            {
              $or: [{ price: { $between: [priceMin, priceMax] } }],
            },
            {
              brand: {
                $eqi: brandsSplitToArr,
              },
            },
            {
              pageCategory: {
                $eqi: pageCategorySplitArr,
              },
            },

            {
              $or: [
                {
                  category: {
                    $eqi: categorySplitToArr,
                  },
                },
                {
                  equipmentCategory: {
                    $eqi: categorySplitToArr,
                  },
                },
              ],
            },

            {
              $or: [
                { lampsLanternsCategory: { $eqi: subCategoryArr } },
                { campSleepCategory: { $eqi: subCategoryArr } },
                { toolsGearCategory: { $eqi: subCategoryArr } },
                { otherCategory: { $eqi: subCategoryArr } },
                { clothingCategory: { $eqi: subCategoryArr } },
                { footwearCategory: { $eqi: subCategoryArr } },
                { accessoriesCategory: { $eqi: subCategoryArr } },
                { activityCategory: { $eqi: subCategoryArr } },
              ],
            },
            {
              $or: [
                { sale: saleItem ? true : true },
                { sale: saleItem ? true : false },
              ],
            },
            { clearance: clearance == "false" ? { $eqi: [] } : true },
            { new: newproduct == "false" ? { $eqi: [] } : true },
            {
              size: {
                size: {
                  $eqi: sizeArr,
                },
              },
            },
          ],
        },
        populate: { size: true },
      }
    );

    // get Min, Max price
    if (products.length !== 0) {
      const minMaxPriceArr = pagination?.map((item) => {
        return item.price;
      });

      priceMin = Math.min.apply(null, minMaxPriceArr);
      priceMax = Math.max.apply(null, minMaxPriceArr);
    }
    //---------------

    // get all products count
    const paginationLength = pagination.length;
    //---------------

    // get pages count
    const pages = Math.ceil(paginationLength / 24);
    //---------------

    // get pageCategory
    const allPageCategory = pagination.map((item) => {
      return item.pageCategory.toLowerCase();
    });
    const getUniqPageCategory = allPageCategory.filter(
      (item, id) => allPageCategory.indexOf(item) === id
    );
    //---------------

    // get category
    let conCatCategory;

    const allCategory = pagination.map((item) => {
      return item.category.toLowerCase();
    });
    const getUniqCategory = allCategory.filter(
      (item, id) => allCategory.indexOf(item) === id
    );

    const allEquipmentCategory = pagination.map((item) => {
      return item.equipmentCategory.toLowerCase();
    });
    const getEquipmentCategory = allEquipmentCategory.filter(
      (item, id) => allEquipmentCategory.indexOf(item) === id
    );

    conCatCategory = [...getUniqCategory, ...getEquipmentCategory];

    const removeNullFromCategoryArr = conCatCategory.filter((item) => {
      if (item !== "null") return item;
    });
    //---------------

    // get subCategory

    let conCatSubCategory = [];

    const allClothingSubCategory = pagination.map((item) => {
      return item.clothingCategory.toLowerCase();
    });
    const getUniqClothingSubCategory = allClothingSubCategory.filter(
      (item, id) => allClothingSubCategory.indexOf(item) === id
    );

    const allAccessoriesSubCategory = pagination.map((item) => {
      return item.accessoriesCategory.toLowerCase();
    });
    const getAccessoriesSubCategory = allAccessoriesSubCategory.filter(
      (item, id) => allAccessoriesSubCategory.indexOf(item) === id
    );

    const allFootwearSubCategory = pagination.map((item) => {
      return item.footwearCategory.toLowerCase();
    });
    const getFootwearSubCategory = allFootwearSubCategory.filter(
      (item, id) => allFootwearSubCategory.indexOf(item) === id
    );

    const allActivitySubCategory = pagination.map((item) => {
      return item.activityCategory.toLowerCase();
    });
    const getActivitySubCategory = allActivitySubCategory.filter(
      (item, id) => allActivitySubCategory.indexOf(item) === id
    );

    const allLampsLanternsSubCategory = pagination.map((item) => {
      return item.lampsLanternsCategory.toLowerCase();
    });
    const getUniqLampsLanternsSubCategory = allLampsLanternsSubCategory.filter(
      (item, id) => allLampsLanternsSubCategory.indexOf(item) === id
    );

    const allCampSleepSubCategory = pagination.map((item) => {
      return item.campSleepCategory.toLowerCase();
    });
    const getUniqCampSleepSubCategory = allCampSleepSubCategory.filter(
      (item, id) => allCampSleepSubCategory.indexOf(item) === id
    );

    const allToolsGearSubCategory = pagination.map((item) => {
      return item.toolsGearCategory.toLowerCase();
    });
    const getUniqToolsGearSubCategory = allToolsGearSubCategory.filter(
      (item, id) => allToolsGearSubCategory.indexOf(item) === id
    );

    const allOtherSubCategory = pagination.map((item) => {
      return item.otherCategory.toLowerCase();
    });
    const getUniqOtherSubCategory = allOtherSubCategory.filter(
      (item, id) => allOtherSubCategory.indexOf(item) === id
    );

    conCatSubCategory = [
      ...getUniqLampsLanternsSubCategory,
      ...getUniqCampSleepSubCategory,
      ...getUniqToolsGearSubCategory,
      ...getUniqOtherSubCategory,
      ...getUniqClothingSubCategory,
      ...getFootwearSubCategory,
      ...getAccessoriesSubCategory,
      ...getActivitySubCategory,
    ];

    const removeNullFromSubCategoryArr = conCatSubCategory.filter((item) => {
      if (item !== "null") return item;
    });
    //---------------

    // get brands
    const allBrands = pagination.map((item) => {
      return item.brand.toLowerCase();
    });

    const getUniqBrands = allBrands.filter(
      (item, id) => allBrands.indexOf(item) === id
    );
    //---------------

    // get sizes
    const allSizes = pagination.map((item) => {
      return item.size;
    });
    const sortSizes = allSizes.filter(
      (item, id) => allSizes.indexOf(item) === id
    );

    const filterSizes = sortSizes.map((item) => {
      const sort = item.map((items) => {
        return items.size;
      });
      return sort;
    });

    const filterSizesConcCat = filterSizes.flat(2);
    const getUniqSize = filterSizesConcCat.filter(
      (item, id) => filterSizesConcCat.indexOf(item) === id
    );

    //---------------

    //sortedProductsImages
    const sortedProducts = products.map((item) => ({
      ...item,
      image: item.image[0].formats.medium.url,
    }));

    //---------------

    const sanitizedEntity = await this.sanitizeOutput({ sortedProducts }, ctx);
    const sanitizedPagination = await this.sanitizeOutput(
      {
        priceMin,
        priceMax,
        total: paginationLength,
        pages,
        category: removeNullFromCategoryArr,
        pageCategory: getUniqPageCategory,
        subCategory: removeNullFromSubCategoryArr,
        brands: getUniqBrands,
        sizes: getUniqSize,
      },
      ctx
    );

    return this.transformResponse(sanitizedEntity, sanitizedPagination);
  },

  async newArrivals(ctx) {
    const entity = await strapi.entityService.findMany("api::product.product", {
      limit: 20,
      filters: {
        new: true,
        publishedAt: {
          $ne: null,
        },
      },
      populate: { image: true },
    });

    //sortedProductsImages
    const sortedProducts = entity.map((item) => ({
      ...item,
      image: item.image[0].formats.small.url,
    }));

    const sanitizedEntity = await this.sanitizeOutput({ sortedProducts }, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async relatedProducts(ctx) {
    const { pageCategory, category, subcat, id } = ctx.query;

    const productId = id;

    const entity = await strapi.entityService.findMany("api::product.product", {
      limit: 20,
      filters: {
        publishedAt: {
          $ne: null,
        },
        $not: {
          id: productId,
        },
        $and: [
          {
            pageCategory: {
              $eqi: pageCategory,
            },
          },
          {
            $or: [
              {
                category: {
                  $eqi: category,
                },
              },
              {
                equipmentCategory: {
                  $eqi: category,
                },
              },
            ],
          },
          {
            $or: [
              { lampsLanternsCategory: { $eqi: subcat } },
              { campSleepCategory: { $eqi: subcat } },
              { toolsGearCategory: { $eqi: subcat } },
              { otherCategory: { $eqi: subcat } },
              { clothingCategory: { $eqi: subcat } },
              { footwearCategory: { $eqi: subcat } },
              { accessoriesCategory: { $eqi: subcat } },
              { activityCategory: { $eqi: subcat } },
            ],
          },
        ],
      },

      populate: { image: true },
    });

    //sortedProductsImages
    const sortedProducts = entity.map((item) => ({
      ...item,
      image: item.image[0].formats.small.url,
    }));

    const sanitizedEntity = await this.sanitizeOutput({ sortedProducts }, ctx);

    return this.transformResponse(sanitizedEntity);
  },
}));
