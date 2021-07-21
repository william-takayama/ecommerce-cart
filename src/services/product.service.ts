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
        // const message = `An error has occurred while loading products: ${response.status}`;
        toast.error("Erro no carregamento dos produtos");
        return;
      }

      const productsResponse = response.data;
      const fProducts: ProductFormatted[] = productsResponse.map((product) => ({
        ...product,
        priceFormatted: formatPrice(product.price),
      }));

      toast.success("Products loaded successfully!");

      return fProducts;
    } catch (e) {
      toast.error("Erro no carregamento dos produtos");
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
        // const message = `An error has occurred while getting your product ${productId}: ${productResponse.status}`;
        toast.error("Erro na adição do produto");
        return;
      }

      const [productItem] = productResponse.data;

      return productItem;
    } catch (e) {
      toast.error("Erro na adição do produto");
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
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }
      const [{ amount }] = stockResponse.data;

      return amount;
    } catch (e) {
      toast.error("Quantidade solicitada fora de estoque");
    }
  },
};
