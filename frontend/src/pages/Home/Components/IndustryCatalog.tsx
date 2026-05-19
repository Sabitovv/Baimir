import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import PageContainer from "@/components/ui/PageContainer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";
import { useGetCategoriesTreeQuery } from "@/api/categoriesApi";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/pagination";

type CatalogCardItem = {
  title: string;
  image?: string;
  path: string;
};

const IndustryCatalog = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const swiperRef = useRef<SwiperType | null>(null);

  const { data } = useGetCategoriesTreeQuery({ lang: i18n.language });
  const cards: CatalogCardItem[] = [];
  if (data) {
    [
      { index: 0, path: "catalog/metalworking?categoryId=19" },
      { index: 1, path: "catalog/metalworking?categoryId=8" },
      { index: 2, path: "catalog/metalworking?categoryId=20" },
      { index: 3, path: "catalog/metalworking?categoryId=21" },
    ].forEach(({ index, path }) => {
      const category = data[index];
      if (!category) return;
      cards.push({ title: category.name, image: category.imageUrl, path });
    });
  }

  return (
    <section className="bg-white py-12 md:py-20">
      <PageContainer>
        <ScrollReveal>
          <div className="mb-6 md:mb-10">
            <h1 className="font-oswald text-[32px] font-semibold uppercase leading-[1.05] text-[#111111] md:text-5xl xl:text-6xl">
              {t("home.catalog.title")}
            </h1>

            <p
              className="mt-2 text-base leading-6 text-gray-500 md:text-xl xl:text-2xl"
            >
              {t("home.catalog.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="md:hidden">
          <Swiper
            key={`catalog-mobile-${cards.length}-${i18n.language}`}
            modules={[Pagination, Autoplay]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              if (cards.length > 1) {
                swiper.autoplay.start();
              }
            }}
            autoplay={
              cards.length > 1
                ? {
                    delay: 3400,
                    disableOnInteraction: true,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            onTouchStart={() => swiperRef.current?.autoplay?.stop()}
            slidesPerView={1.12}
            spaceBetween={12}
            pagination={{ clickable: true }}
            className="pb-10 [&_.swiper-pagination-bullet]:bg-[#B0B0B0] [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:transition-colors [&_.swiper-pagination-bullet-active]:bg-[#F58322]"
          >
            {cards.map((card, index) => (
              <SwiperSlide key={index} className="h-auto">
                <Link to={card.path} className="flex flex-col h-full">
                  <div className="group flex min-h-[320px] flex-col rounded-xl border border-[#EFEFEF] bg-gradient-to-b from-[#FCFCFC] to-[#F6F6F6] p-5">
                    <h1
                      className="mb-3 text-center font-oswald text-sm font-bold uppercase leading-5 text-[#111111] transition-colors group-hover:text-[#DB741F]"
                    >
                      {card.title}
                    </h1>

                    <div className="flex w-full flex-grow items-center justify-center rounded-lg bg-white/70 p-3">
                      <img
                        src={card.image}
                        className="max-h-40 object-contain"
                        alt={card.title}
                      />
                    </div>
                    <span className="mt-4 hidden text-xs font-bold uppercase tracking-widest text-[#F58322] md:inline">
                      {t("home.catalog.link")} &gt;
                    </span>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="hidden md:block">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card, index) => (
              <StaggerItem key={index} className="flex flex-col">
                <div
                  className="
                    bg-[#F9F9F9]
                    p-6 md:p-8
                    flex flex-col items-center
                    min-h-[380px] md:min-h-[420px] xl:min-h-[450px]
                    hover:shadow-lg transition-shadow
                    group
                  "
                >
                  <Link
                    to={card.path}
                    className="
                      font-oswald font-bold uppercase text-center
                      text-base md:text-lg
                      group-hover:text-[#DB741F]
                      mb-4
                    "
                  >
                    {card.title}
                  </Link>

                  <div className="flex-grow flex items-center justify-center">
                    <img
                      src={card.image}
                      className="max-h-40 md:max-h-44 xl:max-h-48 object-contain"
                      alt={card.title}
                    />
                  </div>
                </div>

                <Link
                  to={card.path}
                  className="
                    text-[#F58322]
                    text-xs
                    font-bold uppercase tracking-widest
                    self-end mt-3
                    hover:underline
                  "
                >
                  {t("home.catalog.link")} &gt;
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </PageContainer>
    </section>
  );
};

export default IndustryCatalog;
