import crypto from "crypto";

const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const random = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `WF-${date}-${random}`;
};

export default generateOrderNumber;
