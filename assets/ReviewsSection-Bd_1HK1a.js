import{d as b,r as f,j as e,$ as x,a0 as g,a1 as w,a2 as j,a3 as u}from"./ui-core-Ys4h6eh7.js";import{S as v,A as y,a as N}from"./vendor-swiper-CvHiO48w.js";import{S as h}from"./ScrollReveal-DhVeHh_G.js";import{P as B}from"./PageContainer-Ceoy9X33.js";import{F as S}from"./index-ymiDxCPq.js";import"./vendor-i18n-DyKGIYOG.js";import"./vendor-state-DWu6Dk3N.js";const F=(s,t)=>{if(!s)return"";const i=new Date(s);if(Number.isNaN(i.getTime()))return"";const n=t==="en"?"en-US":t==="kk"||t==="kz"?"kk-KZ":"ru-RU";return i.toLocaleDateString(n,{day:"2-digit",month:"2-digit",year:"numeric"})},A=(s,t="2GIS",i="Source")=>{if(!s)return t;try{const n=new URL(s).hostname.replace("www.","").toLowerCase();return n.includes("2gis")?"2GIS":n.includes("google")?"Google":n.includes("yandex")?"Yandex":n.split(".")[0]?.toUpperCase()||i}catch{return t}},k=s=>{if(!s)return"B";const t=s.trim();return t&&t.charAt(0).toUpperCase()||"B"},G=({onOpenReviewModal:s})=>{const{t,i18n:i}=b(),n=f.useRef(null),{data:a=[],isLoading:m,isError:p}=S(),o=a.length>1,l=()=>{n.current?.autoplay?.stop()};return m?e.jsx("div",{className:"py-24 text-center text-[#4B5563]",children:t("home.reviews.loading",{defaultValue:"Загрузка отзывов..."})}):p||a.length===0?null:e.jsx("section",{className:"py-16 md:py-20 xl:py-24 bg-[#F5F5F5] overflow-x-hidden",children:e.jsxs(B,{children:[e.jsx(h,{children:e.jsx("h2",{className:`
              font-manrope font-semibold text-center 
              text-3xl md:text-4xl xl:text-[54px]
              mb-10 md:mb-12 xl:mb-16
              tracking-tight leading-none
            `,children:t("home.reviews.title")})}),e.jsx(h,{delay:.15,children:e.jsxs("div",{className:"relative",children:[e.jsx("button",{type:"button",onClick:()=>{l(),n.current?.slidePrev()},disabled:!o,"aria-label":t("commonCatalog.prev",{defaultValue:"Предыдущий"}),className:`
                hidden md:flex
                absolute -left-6 xl:-left-16 top-1/2 -translate-y-1/2
                w-12 h-12 rounded-full border-2 border-[#6B7280] bg-white/90
                items-center justify-center
                text-[#374151] hover:bg-[#0B5FA1] hover:text-white hover:border-[#0B5FA1]
                transition z-50 shadow-sm
                disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/90 disabled:hover:text-[#374151] disabled:hover:border-[#6B7280]
              `,children:e.jsx(x,{sx:{fontSize:18}})}),e.jsx(v,{modules:[y],onSwiper:r=>{n.current=r},autoplay:o?{delay:3500,disableOnInteraction:!0,pauseOnMouseEnter:!0}:!1,onTouchStart:l,spaceBetween:24,slidesPerView:1,loop:o,breakpoints:{640:{slidesPerView:1},768:{slidesPerView:a.length>=2?2:a.length},1024:{slidesPerView:a.length>=3?3:a.length},1440:{slidesPerView:a.length>=4?4:a.length}},children:a.map(r=>e.jsx(N,{children:(()=>{const d=r.profileUrl||r.profileLink;return e.jsxs("div",{className:`
                      bg-white
                      p-5 md:p-6
                      border border-[#E5E7EB] rounded-2xl
                      shadow-[0_8px_24px_rgba(16,24,40,0.04)]
                      flex flex-col gap-6
                      h-full
                      min-h-[270px] md:min-h-[300px] xl:min-h-[320px]
                    `,children:[e.jsxs("div",{className:"flex items-start gap-3",children:[r.imageUrl?e.jsx("img",{src:r.imageUrl,alt:"",width:48,height:48,loading:"lazy",decoding:"async",className:"w-12 h-12 rounded-full object-cover"}):e.jsx("div",{className:"w-12 h-12 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-manrope text-xl",children:k(r.authorName)}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("h4",{className:"font-manrope font-semibold text-[17px] leading-tight text-[#111827] mb-1 truncate",children:r.authorName}),e.jsx("div",{className:"flex items-center gap-0.5 mb-1.5",children:Array.from({length:5},(E,c)=>c<Math.max(0,Math.min(5,Math.round(r.rating||0)))?e.jsx(g,{sx:{fontSize:16,color:"#F59E0B"}},c):e.jsx(w,{sx:{fontSize:16,color:"#D1D5DB"}},c))}),r.authorDescription&&e.jsx("p",{className:"text-[#6B7280] text-[12px] leading-tight truncate",children:r.authorDescription})]})]}),e.jsx("p",{className:"text-[#374151] text-[14px] leading-relaxed line-clamp-5 flex-1",children:r.text}),e.jsxs("div",{className:"pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-3 text-[12px]",children:[e.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[e.jsx("span",{className:"text-[#9CA3AF] whitespace-nowrap",children:F(r.reviewDate||r.createdAt,i.language)}),e.jsx("span",{className:"px-2 py-1 rounded-md bg-[#E8F6EF] text-[#047857] font-semibold whitespace-nowrap",children:A(d,"2GIS",t("home.reviews.sourceGeneric",{defaultValue:"Источник"}))})]}),d&&e.jsxs("a",{href:d,target:"_blank",rel:"noreferrer",className:"inline-flex items-center gap-1 text-[#F59E0B] hover:text-[#DB741F] font-semibold whitespace-nowrap",children:[t("home.reviews.source",{defaultValue:"Источник"}),e.jsx(j,{sx:{fontSize:14}})]})]})]})})()},r.id))}),e.jsx("button",{type:"button",onClick:()=>{l(),n.current?.slideNext()},disabled:!o,"aria-label":t("commonCatalog.next",{defaultValue:"Следующий"}),className:`
                hidden md:flex
                absolute -right-6 xl:-right-16 top-1/2 -translate-y-1/2
                w-12 h-12 rounded-full border-2 border-[#6B7280] bg-white/90
                items-center justify-center
                text-[#374151] hover:bg-[#0B5FA1] hover:text-white hover:border-[#0B5FA1]
                transition z-50 shadow-sm
                disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/90 disabled:hover:text-[#374151] disabled:hover:border-[#6B7280]
              `,children:e.jsx(u,{sx:{fontSize:18}})}),e.jsxs("div",{className:"mt-5 flex items-center justify-center gap-3 md:hidden",children:[e.jsx("button",{type:"button",onClick:()=>{l(),n.current?.slidePrev()},disabled:!o,"aria-label":t("commonCatalog.prev",{defaultValue:"Предыдущий"}),className:"inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#6B7280] bg-white text-[#374151] transition hover:bg-[#0B5FA1] hover:text-white hover:border-[#0B5FA1] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#374151] disabled:hover:border-[#6B7280]",children:e.jsx(x,{sx:{fontSize:16}})}),e.jsx("button",{type:"button",onClick:()=>{l(),n.current?.slideNext()},disabled:!o,"aria-label":t("commonCatalog.next",{defaultValue:"Следующий"}),className:"inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#6B7280] bg-white text-[#374151] transition hover:bg-[#0B5FA1] hover:text-white hover:border-[#0B5FA1] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#374151] disabled:hover:border-[#6B7280]",children:e.jsx(u,{sx:{fontSize:16}})})]})]})}),e.jsx(h,{className:"flex justify-end",children:e.jsx("button",{type:"button",onClick:s,className:`
              mt-8 md:mt-12
              bg-[#F58322] hover:bg-[#DB741F]
              px-8 md:px-10 py-3 md:py-4
              font-bold uppercase tracking-widest
              transition
              text-xs md:text-sm
              hover:shadow-lg hover:shadow-[#F05023]/20
              text-white
            `,children:t("home.reviews.leaveReview",{defaultValue:"Оставить отзыв"})})})]})})};export{G as default};
