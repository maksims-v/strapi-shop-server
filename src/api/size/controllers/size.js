"use strict";

/**
 * size controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::size.size", ({ strapi }) => ({
  async getAllSizes(ctx) {
    const entity = await strapi.entityService.findMany("api::size.size", {
      populate: { size: true },
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },
}));
