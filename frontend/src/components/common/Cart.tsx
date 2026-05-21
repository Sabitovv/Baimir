import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CartCard from "./CartCard";
import ProductCarousel from "@/components/collections/ProductCarousel";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useProductCollectionPlacement } from "@/features/productCollections/useProductCollectionPlacement";
import {
  clearCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "@/features/cartSlice";
import { useCreateInquiryMutation } from "@/api/categoriesApi";
import { useGetCompanySettingsQuery } from "@/api/productsApi";
import { isCompanyWorkingNow } from "@/utils/workSchedule";
import WorkScheduleDialog from "@/components/common/WorkScheduleDialog";

const CheckCircleIcon = () => (
  <svg
    className="w-16 h-16 text-green-500 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    ></path>
  </svg>
);

type CartProps = {
  isOpen?: boolean;
  onClose: () => void;
};

const CartCrossSellSection = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const { collections } = useProductCollectionPlacement(
    "CART_CROSS_SELL_COLLECTION",
    { lang: i18n.language, maxItems: 10 },
  );

  const visibleCollections = collections.filter(
    (collection) => collection.products.length > 0,
  );

  if (visibleCollections.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-[#EEF1F4] bg-gradient-to-b from-[#FFFFFF] to-[#FAFBFC] px-2.5 py-2">
      <div className="mb-2 flex items-start justify-between gap-2 border-b border-dashed border-[#E5EAF0] pb-1.5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#1F2937]">
            Берут вместе
          </p>
          <p className="mt-0.5 text-[10px] text-[#6B7280]">
            Универсальные товары: расходники, аксессуары и полезные мелочи
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="shrink-0 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[10px] font-semibold text-[#4B5563] transition hover:border-[#D1D5DB] hover:text-[#111827]"
        >
          {isOpen ? "Скрыть" : "Показать"}
        </button>
      </div>

      {!isOpen ? null : (
        <div className="space-y-2.5">
          {visibleCollections.map((collection) => (
            <div key={collection.id}>
              <ProductCarousel
                products={collection.products}
                cardVariant="mini"
                enableMouseDrag
                showCompare={false}
                className="[&>div]:pb-1.5 [&>div]:pt-0"
                itemClassName="!w-[118px] !min-w-[118px] sm:!w-[126px] sm:!min-w-[126px]"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const Cart = ({ isOpen = false, onClose }: CartProps) => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);

  const [openUp, setOpenUp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const [createInquiry, { isLoading }] = useCreateInquiryMutation();
  const { data: companySettingsData } = useGetCompanySettingsQuery();
  const isCompanyClosedNow =
    isCompanyWorkingNow(companySettingsData?.COMPANY_WORK_SCHEDULE) === false;

  const total = items.reduce((sum, item) => {
    const itemPrice =
      typeof item.price === "number" && Number.isFinite(item.price)
        ? item.price
        : 0;
    return sum + itemPrice * item.quantity;
  }, 0);
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setOpenUp(false);
      setIsSuccess(false);
    }, 300);
  };

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyWidth = document.body.style.width;
    const prevBodyLeft = document.body.style.left;
    const prevBodyRight = document.body.style.right;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.width = prevBodyWidth;
      document.body.style.left = prevBodyLeft;
      document.body.style.right = prevBodyRight;

      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setOpenUp(false);
        setIsSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  const onIncrement = (id: number) => dispatch(incrementQuantity(id));
  const onDecrement = (id: number) => dispatch(decrementQuantity(id));
  const onRemove = (id: number) => dispatch(removeFromCart(id));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      sourceUrl: window.location.href,
    };

    try {
      await createInquiry(payload).unwrap();

      setIsSuccess(true);

      dispatch(clearCart());
    } catch (error) {
      console.error(t("cart.submitErrorLog"), error);
      alert(t("cart.submitError"));
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={() => {
        if (isScheduleDialogOpen) return;
        handleClose();
      }}
    >
      <div
        className={`relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex items-center justify-center px-4 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-black text-center">
            {t("cart.title")}
          </h2>
          <button
            onClick={handleClose}
            className="absolute right-4 text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            {t("cart.close")}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-6">
              <p className="text-base font-semibold text-gray-900">
                {t("cart.emptyTitle")}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {t("cart.emptyDescription")}
              </p>
              <Link
                to="/catalog"
                onClick={handleClose}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#F58322] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#DB741F]"
              >
                {t("cart.goToCatalog")}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <CartCard
                  key={item.id}
                  image={item.image}
                  title={item.name}
                  price={item.price}
                  oldPrice={item.oldPrice}
                  quantity={item.quantity}
                  onIncrement={() => onIncrement(item.id)}
                  onDecrement={() => onDecrement(item.id)}
                  onRemove={() => onRemove(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-4 pb-2 bg-white max-h-[24vh] overflow-y-auto">
            <CartCrossSellSection />
          </div>
        )}

        <div className="border-t border-gray-200 p-4 space-y-3 bg-white relative z-10">
          {isCompanyClosedNow && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <p>{t("home.contact.nonWorkingHoursNotice")}</p>
              <button
                type="button"
                onClick={() => setIsScheduleDialogOpen(true)}
                className="mt-2 inline-flex text-xs font-semibold text-[#DB741F] hover:text-[#b85f18] hover:underline"
              >
                {t("home.contact.viewSchedule")}
              </button>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{t("cart.itemsTotalLabel")}</span>
            <span>
              {itemsCount} {t("cart.pieces")}
            </span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-gray-900">
            <span>{t("cart.totalToPay")}</span>
            <span>{total.toLocaleString(i18n.language)} ₸</span>
          </div>

          <button
            disabled={items.length === 0}
            className="w-full rounded-lg bg-[#F58322] py-3 text-sm font-semibold text-white transition hover:bg-[#DB741F] disabled:cursor-not-allowed disabled:bg-gray-300"
            onClick={() => setOpenUp(true)}
          >
            {t("cart.submitRequest")}
          </button>
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 h-full bg-white z-20 flex flex-col transition-transform duration-500 ease-in-out ${
            openUp ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {isSuccess ? (
            <div className="flex-1 bg-gray-50 p-4 sm:p-6">
              <div className="mx-auto flex h-full w-full max-w-sm flex-col items-center justify-center text-center">
              <CheckCircleIcon />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t("cart.successTitle")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("cart.successDescription")}
              </p>

              <button
                onClick={handleClose}
                className="mt-4 w-full rounded-lg bg-[#F58322] py-3 text-sm font-semibold text-white transition hover:bg-[#DB741F]"
              >
                {t("cart.backToShopping")}
              </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xl font-semibold text-black">
                  {t("cart.requestTitle")}
                </h3>
                <button
                  onClick={() => setOpenUp(false)}
                  className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  {t("cart.back")}
                </button>
              </div>

              <div className="flex-1 overflow-auto p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("cart.form.name")} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#F58322] focus:border-transparent outline-none transition-all"
                      placeholder={t("cart.form.namePlaceholder")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("cart.form.phone")} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#F58322] focus:border-transparent outline-none transition-all"
                      placeholder={t("cart.form.phonePlaceholder")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("cart.form.email")} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#F58322] focus:border-transparent outline-none transition-all"
                      placeholder={t("cart.form.emailPlaceholder")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("cart.form.comment")}
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#F58322] focus:border-transparent outline-none transition-all resize-none"
                      placeholder={t("cart.form.commentPlaceholder")}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-6">
                    <div className="flex items-center justify-between text-base font-semibold text-gray-900 mb-4">
                      <span>{t("cart.orderSum")}</span>
                      <span>{total.toLocaleString(i18n.language)} ₸</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-lg bg-[#F58322] py-3 text-sm font-semibold text-white transition hover:bg-[#DB741F] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t("cart.sending")}
                        </>
                      ) : (
                        t("cart.submitRequest")
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
      <WorkScheduleDialog
        open={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
      />
    </div>
  );
};

export default Cart;
