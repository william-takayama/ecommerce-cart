import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { productService } from "../services/product.service";
import { Product } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");
    const parsedCart = JSON.parse(storagedCart ?? "[]");

    if (parsedCart.length > 0) {
      return parsedCart;
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    // console.log("CALLED");
    try {
      const productItem = await productService.getProductById(productId);

      if (productItem == null) {
        return;
      }

      if (cart.findIndex((p) => p.id === productId) !== -1) {
        await updateProductAmount({
          amount: 1,
          productId,
        });
        return;
      }

      const productItemWithAmount = {
        ...productItem,
        amount: 1,
      };

      setCart([...cart, productItemWithAmount]);

      localStorage.setItem(
        "@RocketShoes:cart",
        JSON.stringify([...cart, productItemWithAmount])
      );

      toast(`${productItemWithAmount.title} added successfully!`, {
        type: "success",
      });
    } catch (e) {
      // console.error(e.message);
      toast("Erro na adição do produto", {
        type: "error",
      });
    }
  };

  const removeProduct = (productId: number) => {
    try {
      if (cart.findIndex((p) => p.id === productId) === -1) {
        throw new Error("Erro na remoção do produto");
      }

      const filteredProducts = cart.filter(
        (product) => product.id !== productId
      );

      setCart([...filteredProducts]);

      toast("Product removed successfully!", {
        type: "success",
      });

      localStorage.setItem(
        "@RocketShoes:cart",
        JSON.stringify([...filteredProducts])
      );
    } catch (e) {
      // console.error(e.message);
      toast("Erro na remoção do produto", {
        type: "error",
      });
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const stockQty = await productService.getStockFromProductById(productId);

      const currentProductQty =
        cart.find((p) => p.id === productId)?.amount ?? 0;

      if ((stockQty ?? 0) <= 0) {
        const message = "Quantidade solicitada fora de estoque";
        throw new Error(message);
      }

      if (stockQty && currentProductQty + amount > stockQty) {
        const message = "Quantidade solicitada fora de estoque";
        // const message = `You can't add this product because it has just ${stockQty} unit(s) availables`;
        throw new Error(message);
      }

      setCart((oldCart) => {
        const items = oldCart.map((product) =>
          product.id === productId
            ? {
                ...product,
                amount: product.amount + amount,
              }
            : product
        );

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(items));
        return items;
      });
    } catch (e) {
      toast("Erro na alteração de quantidade do produto", {
        type: "warning",
      });
      // console.error(e.message);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
