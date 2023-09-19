"use strict";

/**
 * layout-footer controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::layout-footer.layout-footer",
  ({ strapi }) => ({
    async layoutFooter(ctx) {
      const entity = await strapi.entityService.findMany(
        "api::layout-footer.layout-footer",
        {
          populate: {
            supportLinks: {
              populate: {
                link: "*",
              },
            },
            aboutLinks: {
              populate: {
                link: "*",
              },
            },
            allProductsLinks: {
              populate: {
                link: "*",
              },
            },
            socialLinks: {
              populate: {
                link: "*",
              },
            },
          },
          filters: {
            publishedAt: {
              $null: null,
            },
          },
        }
      );

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      return this.transformResponse(sanitizedEntity);
    },
  })
);
