import Product from "../models/Product.js";

const updateProductStock = async (validatedItems, session) => {
  const operations = validatedItems.map(({ product, quantity }) => ({
    updateOne: {
      filter: {
        _id: product._id,
      },
      update: {
        $inc: {
          stock: -quantity,
        },
      },
    },
  }));

  await Product.bulkWrite(operations, { session });
};

export default updateProductStock;
