import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.dataSource = dataSource;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    this.renderProductDetails();
    document
      .getElementById("addToCart")
      .addEventListener("click", this.addProductToCart.bind(this));
  }

  addProductToCart() {
    let cartContents = getLocalStorage("so-cart") || [];
    cartContents.push(this.product);
    setLocalStorage("so-cart", cartContents);
  }

  renderProductDetails() {
    const product = this.product;

    document.querySelector(".product-detail h3").textContent = product.Brand.Name;
    document.querySelector(".product-detail h2").textContent = product.NameWithoutBrand;
    document.querySelector(".product-detail img").src = product.Images.PrimaryLarge;
    document.querySelector(".product-detail img").alt = product.NameWithoutBrand;
    document.querySelector(".product-card__price").textContent = `$${product.FinalPrice}`;
    document.querySelector(".product__color").textContent = product.Colors[0].ColorName;
    document.querySelector(".product__description").textContent =
      product.DescriptionHtmlSimple.replace(/<[^>]+>/g, "");
    document.getElementById("addToCart").dataset.id = product.Id;
    document.title = `Sleep Outside | ${product.Name}`;
  }
}
