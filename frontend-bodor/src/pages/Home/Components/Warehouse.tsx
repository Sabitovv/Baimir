import { useTranslation } from "react-i18next";
import PageContainer from "@/components/ui/PageContainer";
import CardImg from "@/assets/home/sklad1.webp";
import CardImg2 from "@/assets/home/sklad2.webp";
import CardImg3 from "@/assets/home/sklad3.webp";
import { useState } from "react";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";
import { EditableImage } from "@/zustand/EditableImage";

type WarehouseImageItem = {
  key: string;
  src: string;
};

const Warehouse = () => {
  const { t } = useTranslation();

  const [imgChange, setImgChange] = useState(0);

  const statusKeys: string[] = [
    "home.warehouse.statuses.inStock",
    "home.warehouse.statuses.inTransit",
    "home.warehouse.statuses.atFactory",
    "home.warehouse.statuses.onOrder",
  ];

  const images: WarehouseImageItem[] = [
    { key: "home_warehouse_main_1", src: CardImg },
    { key: "home_warehouse_main_2", src: CardImg2 },
    { key: "home_warehouse_main_3", src: CardImg3 },
  ];
  const activeImage = images[imgChange] ?? images[0];

  return (
    <section className="py-16 md:py-20 bg-white">
      <PageContainer>
        <ScrollReveal>
          <h1
            className="
            font-rubik font-bold uppercase text-[#171B25]
            text-4xl md:text-5xl xl:text-6xl
            mb-10
          "
          >
            {t("home.warehouse.title")}
          </h1>
        </ScrollReveal>

        <div className="flex flex-col lg:flex-row gap-10">
          <ScrollReveal className="flex-1">
            <div className="mb-4">
              {activeImage && (
                <EditableImage
                  imageKey={activeImage.key}
                  fallbackSrc={activeImage.src}
                  alt={t("home.warehouse.imageAlt")}
                  width={960}
                  height={380}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[380px] aspect-[48/19] object-cover"
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {images.slice(0, 3).map((img, index) => (
                <div
                  key={index}
                  className={`
                  border-2
                  ${imgChange == index ? "border-[#FF4610]" : "border-none"}
                  transition
                  cursor-pointer
                `}
                >
                  <EditableImage
                    imageKey={img.key}
                    fallbackSrc={img.src}
                    onClick={() => setImgChange(index)}
                    alt={t("home.warehouse.imageAlt")}
                    width={320}
                    height={110}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-[110px] aspect-[32/11] object-cover"
                  />
                </div>
              ))}
            </div>
          </ScrollReveal>

          <StaggerContainer
            staggerDelay={0.15}
            className="w-full lg:w-[420px] flex flex-col gap-8"
          >
            <StaggerItem>
              <p className="text-gray-600 text-base leading-relaxed">
                {t("home.warehouse.description")}
              </p>
            </StaggerItem>

            <StaggerItem>
              <div>
                <div className="font-rubik font-bold uppercase text-[#171B25] text-sm tracking-widest mb-4">
                  {t("home.warehouse.statusesLabel")}
                </div>

                <ul className="flex flex-col gap-3">
                  {statusKeys.map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-[#FF4610]" />
                      <span className="text-gray-600 text-sm leading-relaxed">
                        {t(key)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>

            <StaggerItem>
              <button
                onClick={() =>
                  document
                    .getElementById("contact-section")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="
                  inline-flex min-h-11 items-center justify-center rounded-sm bg-[#FF4610] px-6 py-3
                  text-[11px] font-bold uppercase tracking-[0.16em] text-white transition
                  hover:bg-[#E03A08] md:px-8 md:py-4 md:text-sm
                "
              >
                {t("home.warehouse.cta")}
              </button>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </PageContainer>
    </section>
  );
};

export default Warehouse;
