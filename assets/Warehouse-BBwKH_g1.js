import{d as h,r as d,j as e}from"./ui-core-Ys4h6eh7.js";import{P as x}from"./PageContainer-Ceoy9X33.js";import{S as n}from"./ScrollReveal-DhVeHh_G.js";import{S as u,a as g}from"./StaggerItem-Nzfm4_s9.js";import{E as c}from"./index-ymiDxCPq.js";import"./vendor-i18n-DyKGIYOG.js";import"./vendor-state-DWu6Dk3N.js";const p="/assets/sklad1-Bj6raRDm.webp",f="/assets/sklad2-BvIN2o22.webp",w="/assets/sklad3-DN14nVQi.webp",_=()=>{const{t:s}=h(),[r,m]=d.useState(0),i=[{valueKey:"home.warehouse.values.space",fallbackValue:"5 500 m2",textKey:"home.warehouse.stats.space"},{valueKey:"home.warehouse.values.staff",fallbackValue:"120+",textKey:"home.warehouse.stats.staff"},{valueKey:"home.warehouse.values.since",fallbackValue:"2012",textKey:"home.warehouse.stats.since"}],t=[{key:"home_warehouse_main_1",src:p},{key:"home_warehouse_main_2",src:f},{key:"home_warehouse_main_3",src:w}],o=t[r]??t[0];return e.jsx("section",{className:"py-16 md:py-20 bg-white",children:e.jsxs(x,{children:[e.jsx(n,{children:e.jsx("h1",{className:`
            font-manrope font-bold uppercase text-[#111111]
            text-4xl md:text-5xl xl:text-6xl
            mb-10
          `,children:s("home.warehouse.title")})}),e.jsxs("div",{className:"flex flex-col lg:flex-row gap-10",children:[e.jsxs(n,{className:"flex-1",children:[e.jsx("div",{className:"mb-4",children:o&&e.jsx(c,{imageKey:o.key,fallbackSrc:o.src,alt:s("home.warehouse.imageAlt"),width:960,height:380,loading:"lazy",decoding:"async",className:"w-full h-[380px] aspect-[48/19] object-cover"})}),e.jsx("div",{className:"grid grid-cols-3 gap-3",children:t.slice(0,3).map((a,l)=>e.jsx("div",{className:`
                  border-2
                  ${r==l?"border-[#F58322]":"border-none"}
                  transition
                  cursor-pointer
                `,children:e.jsx(c,{imageKey:a.key,fallbackSrc:a.src,onClick:()=>m(l),alt:s("home.warehouse.imageAlt"),width:320,height:110,loading:"lazy",decoding:"async",className:"w-full h-[110px] aspect-[32/11] object-cover"})},l))})]}),e.jsx(u,{staggerDelay:.15,className:"w-full lg:w-[420px] flex flex-col gap-8",children:i.map((a,l)=>e.jsx(g,{children:e.jsxs("div",{children:[e.jsxs("div",{className:`
                    font-manrope font-bold text-[#F58322]
                    text-4xl md:text-5xl
                    leading-none
                    mb-2
                  `,children:[s(a.valueKey,{defaultValue:a.fallbackValue}),a.unit&&e.jsx("span",{className:"text-xl md:text-2xl ml-1 font-manrope font-semibold",children:s(`home.warehouse.units.${a.unit}`)})]}),e.jsx("p",{className:"text-gray-600 text-sm leading-relaxed",children:s(a.textKey)})]})},l))})]})]})})};export{_ as default};
