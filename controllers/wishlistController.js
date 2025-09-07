import Buyer from "../models/Buyer";
import User from "../models/User";

export const getWishlist = async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ userId: req.user.id }).populate(
      "whishlist.productId"
    );

    if (!buyer || buyer.whishlist.length === 0) {
      return res.status(200).json({ message: "Wishlist is empty" });
    }

    return res.status(200).json({ wishlist: buyer.whishlist });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  const productId = req.params.productId;
  try {
    const buyer = await Buyer.findOne({ userId: req.user.id });

    if (!buyer) {
      return res.status(404).json({ message: "User Record not Found" });
    }

    // const itemIndex = user.whishlist.findIndex(
    //     (item) => item.productId.toString() === productId

    // )

    const productInWhishlist = buyer.whishlist.some(
      (item) => item.productId.toString() === productId
    );

    if (productInWhishlist) {
      return res.status(400).json({
        message: "Product already in wishlist",
      });
    }

    buyer.whishlist.push({ productId });
    await buyer.save();

    const updatedBuyer = await Buyer.findOne({ userId: req.user.id }).populate("whishlist.productId")

    return res.status(200).json({
      message: "Product added to wishlist",
      wishlist: updatedBuyer.whishlist,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  const productId = req.params.productId;

  try {
    const buyer = await Buyer.findOne({ userId: req.user.id });

    if (!buyer) {
      return res.status(404).json({ message: "User Record not Found" });
    }

    const productInWhishlist = buyer.whishlist.some(
      (item) => item.productId.toString() === productId
    );

    if (!productInWhishlist) {
      return res.status(400).json({ message: "Product not found in wishlist" });
    }

    buyer.whishlist = buyer.whishlist.filter(
      (item) => item.productId.toString() !== productId
    );
    await buyer.save();

    return res.status(200).json({ message: "Item removed from wishlist..." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
