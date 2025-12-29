"use client";

import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  selectCartItems,
  selectCartTotal,
  selectIsCartOpen,
  closeCart,
  removeItemFromCart,
  updateCartItemQuantity,
  selectIsCartLoading,
  CartItem,
} from "@/store";
import { useTranslation } from "@/i18n/client";
import { LoadingOverlay } from "@/components/ui/Loading";
import styles from "./CartSidebar.module.scss";

export default function CartSidebar() {
  const dispatch = useDispatch();
  const { t } = useTranslation("common");
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const isOpen = useSelector(selectIsCartOpen);
  const isLoading = useSelector(selectIsCartLoading);

  const handleClose = () => dispatch(closeCart());
  const shipping = total > 200 ? 0 : 15;
  const finalTotal = total + shipping;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles["cart-sidebar__backdrop"]} ${isOpen ? styles.visible : ""}`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div className={`${styles["cart-sidebar"]} ${isOpen ? styles.open : ""}`}>
        {/* Header */}
        <div className={styles["cart-sidebar__header"]}>
          <h2 className={styles["cart-sidebar__title"]}>
            {t("cart.title")}{" "}
            <span className={styles["cart-sidebar__count"]}>
              ({items.length})
            </span>
          </h2>
          <button
            className={styles["cart-sidebar__close"]}
            onClick={handleClose}
            aria-label={t("common.close")}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles["cart-sidebar__content"]}>
          {isLoading && <LoadingOverlay message={t("common.loading")} />}
          {items.length === 0 ? (
            <div className={styles["cart-sidebar__empty"]}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p>{t("cart.empty")}</p>
              <button className="btn btn--primary" onClick={handleClose}>
                {t("cart.continueShopping")}
              </button>
            </div>
          ) : (
            <div className={styles["cart-sidebar__items"]}>
              <AnimatePresence>
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onRemove={() =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      dispatch(removeItemFromCart(item.id) as any)
                    }
                    onUpdateQuantity={(qty) =>
                      dispatch(
                        updateCartItemQuantity({
                          id: item.id,
                          quantity: qty,
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        }) as any
                      )
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles["cart-sidebar__footer"]}>
            <div className={styles["cart-sidebar__summary"]}>
              <div className={styles["cart-sidebar__row"]}>
                <span>{t("cart.subtotal")}</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className={styles["cart-sidebar__row"]}>
                <span>{t("cart.shipping")}</span>
                <span>
                  {shipping === 0
                    ? t("checkout.summary.free")
                    : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div
                className={`${styles["cart-sidebar__row"]} ${styles["cart-sidebar__row--total"]}`}
              >
                <span>{t("cart.total")}</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className={`btn btn--primary btn--lg ${styles["cart-sidebar__checkout-btn"]}`}
              onClick={handleClose}
            >
              {t("cart.checkout")} - ${finalTotal.toFixed(2)}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

// Cart Item Component
function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  const { t } = useTranslation("common");
  const neonColors = ["#ff3366", "#00d4ff", "#9d4edd", "#00ff88"];
  const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];

  const optionsText = item.options
    ? Object.values(item.options).filter(Boolean).join(" • ")
    : null;

  return (
    <motion.div
      className={styles["cart-item"]}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles["cart-item__image"]}>
        <div
          className={styles["cart-item__image-placeholder"]}
          style={{
            color: randomColor,
            textShadow: `0 0 10px ${randomColor}`,
          }}
        >
          {item.name.slice(0, 2).toUpperCase()}
        </div>
      </div>

      <div className={styles["cart-item__content"]}>
        <div className={styles["cart-item__name"]}>{item.name}</div>
        {optionsText && (
          <div className={styles["cart-item__options"]}>{optionsText}</div>
        )}
        <div className={styles["cart-item__price"]}>${item.price}</div>

        <div className={styles["cart-item__actions"]}>
          <div className={styles["cart-item__quantity"]}>
            <button onClick={() => onUpdateQuantity(item.quantity - 1)}>
              −
            </button>
            <span>{item.quantity}</span>
            <button onClick={() => onUpdateQuantity(item.quantity + 1)}>
              +
            </button>
          </div>

          <button className={styles["cart-item__remove"]} onClick={onRemove}>
            {t("cart.remove")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
