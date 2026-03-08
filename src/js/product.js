// product.js (partial)
import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

function addProductToCart(product) {
  // Get existing cart or initialize empty array
  let cartContents = getLocalStorage("so-cart") || [];
  // Add new product
  cartContents.push(product);
  // Save updated array
  setLocalStorage("so-cart", cartContents);
}

// add to cart button event handler
async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);
