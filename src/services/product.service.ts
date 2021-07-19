import { toast } from "react-toastify";
import { ProductFormatted } from "../pages/Home";
import { Product, Stock } from "../types";
import { formatPrice } from "../util/format";
import { api } from "./api";

export const productService = {
  async loadAllProductsWithPrice() {
    try {
      const response = await api.get<Product[]>("/products");

      if (!(response.status === 200)) {
        const message = `An error has occurred while loading products: ${response.status}`;
        toast(message, {
          type: "error",
        });
        throw new Error(message);
      }

      const productsResponse = response.data;
      const fProducts: ProductFormatted[] = productsResponse.map((product) => ({
        ...product,
        priceFormatted: formatPrice(product.price),
      }));

      toast("Products loaded successfully!", {
        type: "success",
      });

      return fProducts;
    } catch (e) {
      toast(`An error has occurred ${e.message}`, {
        type: "error",
      });
      // console.error(e.message);
    }
  },
  async getProductById(productId: number) {
    try {
      const productResponse = await api.get<Product[]>("/products", {
        params: {
          id: productId,
        },
      });

      if (!(productResponse.status === 200)) {
        const message = `An error has occurred while getting your product ${productId}: ${productResponse.status}`;
        toast(message, {
          type: "error",
        });
        throw new Error(message);
      }

      const [productItem] = productResponse.data;

      return productItem;
    } catch (e) {
      toast(e.message, {
        type: "error",
      });
      // console.error(e.message);
    }
  },
  async getStockFromProductById(productId: number) {
    try {
      const stockResponse = await api.get<Stock[]>("/stock", {
        params: {
          id: productId,
        },
      });

      if (!(stockResponse.status === 200)) {
        // const message = `An error has occurred while checking stock for ${productId}: ${stockResponse.status}`;
        const message = "Quantidade solicitada fora de estoque";
        toast(message, {
          type: "error",
        });
        throw new Error(message);
      }
      const [{ amount }] = stockResponse.data;

      return amount;
    } catch (e) {
      toast("Quantidade solicitada fora de estoque", {
        type: "error",
      });
      // console.error(e.message);
    }
  },
};
