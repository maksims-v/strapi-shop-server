"use strict";

/**
 * layout-header controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::layout-header.layout-header",
  ({ strapi }) => ({
    async layoutHeader(ctx) {
      const entity = await strapi.entityService.findMany(
        "api::layout-header.layout-header",
        {
          populate: {
            linkList: {
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
