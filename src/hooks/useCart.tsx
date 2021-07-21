import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
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

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const prevCartRef = useRef<Product[]>();

  useEffect(() => {
    prevCartRef.current = cart;
  });

  const cartPreviousValue = prevCartRef.current ?? cart;

  useEffect(() => {
    if (cartPreviousValue !== cart) {
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
    }
  }, [cart, cartPreviousValue]);

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productExists = updatedCart.find((p) => p.id === productId);

      const stock = await api.get(`/stock/${productId}`);

      const stockAmount = stock.data.amount;
      const currentAmount = productExists ? productExists.amount : 0;
      const desiredAmount = currentAmount + 1;

      if (desiredAmount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      if (productExists) {
        productExists.amount = desiredAmount;
      } else {
        const product = await api.get(`/products/${productId}`);

        const newProduct = {
          ...product.data,
          amount: 1,
        };
        updatedCart.push(newProduct);
      }

      setCart(updatedCart);
    } catch (e) {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productIndex = updatedCart.findIndex(
        (product) => product.id === productId
      );

      if (productIndex === -1) {
        throw Error();
      }

      updatedCart.splice(productIndex, 1);
      setCart(updatedCart);
    } catch (e) {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }

      const stock = await api.get(`/stock/${productId}`);

      const stockAmount = stock.data.amount;

      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const updatedCart = [...cart];
      const productExists = updatedCart.find(
        (product) => product.id === productId
      );

      if (!productExists) {
        throw Error();
      }

      productExists.amount = amount;
      setCart(updatedCart);
    } catch (e) {
      toast.error("Erro na alteração de quantidade do produto");
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
// import { createContext, ReactNode, useContext, useState } from "react";
// import { toast } from "react-toastify";
// import { productService } from "../services/product.service";
// import { Product } from "../types";

// interface CartProviderProps {
//   children: ReactNode;
// }

// interface UpdateProductAmount {
//   productId: number;
//   amount: number;
// }

// interface CartContextData {
//   cart: Product[];
//   addProduct: (productId: number) => Promise<void>;
//   removeProduct: (productId: number) => void;
//   updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
// }

// const CartContext = createContext<CartContextData>({} as CartContextData);

// export function CartProvider({ children }: CartProviderProps): JSX.Element {
//   const [cart, setCart] = useState<Product[]>(() => {
//     const storagedCart = localStorage.getItem("@RocketShoes:cart");

//     if (storagedCart) {
//       return JSON.parse(storagedCart);
//     }

//     return [];
//   });

//   const addProduct = async (productId: number) => {
//     try {
//       const productItem = await productService.getProductById(productId);

//       if (!productItem) {
//         toast.error("Erro na adição	do produto");
//         return;
//       }

//       if (cart.findIndex((p) => p.id === productId) !== -1) {
//         await updateProductAmount({
//           amount: 1,
//           productId,
//         });
//         return;
//       }

//       const productItemWithAmount = {
//         ...productItem,
//         amount: 1,
//       };

//       setCart([...cart, productItemWithAmount]);

//       localStorage.setItem(
//         "@RocketShoes:cart",
//         JSON.stringify([...cart, productItemWithAmount])
//       );

//       toast.success(`${productItemWithAmount.title} added successfully!`);
//     } catch (e) {
//       toast.error("Erro na adição do produto");
//     }
//   };

//   const removeProduct = (productId: number) => {
//     try {
//       if (cart.findIndex((p) => p.id === productId) === -1) {
//         toast.error("Erro na remoção do produto");
//         return;
//       }

//       const filteredProducts = cart.filter(
//         (product) => product.id !== productId
//       );

//       setCart([...filteredProducts]);

//       toast.success("Product removed successfully!");

//       localStorage.setItem(
//         "@RocketShoes:cart",
//         JSON.stringify([...filteredProducts])
//       );
//     } catch (e) {
//       toast.error("Erro na remoção do produto");
//     }
//   };

//   const updateProductAmount = async ({
//     productId,
//     amount,
//   }: UpdateProductAmount) => {
//     try {
//       const stockQty = await productService.getStockFromProductById(productId);

//       const currentProductQty =
//         cart.find((p) => p.id === productId)?.amount ?? 0;

//       if (
//         (stockQty ?? 0) <= 0 ||
//         (stockQty && currentProductQty + amount > stockQty)
//       ) {
//         toast.error("Quantidade solicitada fora de estoque");
//         return;
//       }

//       setCart((oldCart) => {
//         const items = oldCart.map((product) =>
//           product.id === productId
//             ? {
//                 ...product,
//                 amount: product.amount + amount,
//               }
//             : product
//         );

//         localStorage.setItem("@RocketShoes:cart", JSON.stringify(items));
//         return items;
//       });
//     } catch (e) {
//       toast.error("Erro na alteração de quantidade do produto");
//     }
//   };

//   return (
//     <CartContext.Provider
//       value={{ cart, addProduct, removeProduct, updateProductAmount }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart(): CartContextData {
//   const context = useContext(CartContext);

//   return context;
// }
