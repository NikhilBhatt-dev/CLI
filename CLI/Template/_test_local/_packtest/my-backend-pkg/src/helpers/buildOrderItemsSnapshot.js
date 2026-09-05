const buildOrderItemsSnapshot = (validatedItems) => {
  return validatedItems.map(({ product, quantity }) => {
    const sellingPrice =
      product.discountPrice > 0
        ? product.discountPrice
        : product.price;

    return {
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || "",
      quantity,
      price: sellingPrice,
    };
  });
};

export default buildOrderItemsSnapshot;