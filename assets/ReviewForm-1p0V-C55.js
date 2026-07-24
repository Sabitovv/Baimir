import{d as V,r as l,j as e}from"./ui-core-Ys4h6eh7.js";import{S as g}from"./ScrollReveal-DhVeHh_G.js";import{G as C}from"./index-ymiDxCPq.js";import{P as E}from"./PageContainer-Ceoy9X33.js";import"./vendor-i18n-DyKGIYOG.js";import"./vendor-state-DWu6Dk3N.js";const $=({isModal:s=!1,onSuccess:n})=>{const{t:r}=V(),[F,{isLoading:o}]=C(),[d,m]=l.useState(""),[c,u]=l.useState(""),[a,x]=l.useState(5),[j,i]=l.useState(!1),[p,f]=l.useState(null),y=async t=>{t.preventDefault(),f(null),i(!1);const N={authorName:d,text:c,rating:a,source:r("reviewForm.source",{defaultValue:"Website"})};try{await F(N).unwrap(),i(!0),m(""),u(""),x(5),s&&n?n():setTimeout(()=>i(!1),5e3)}catch(w){console.error(r("reviewForm.submitErrorLog",{defaultValue:"Error while sending review:"}),w),f(w?.data?.message||r("reviewForm.submitError",{defaultValue:"An error occurred while sending your review"}))}},v=e.jsx("h2",{className:`
      font-manrope font-semibold uppercase text-[#111111]
      tracking-tight
      ${s?"text-2xl md:text-3xl mb-6 md:mb-7 text-left":"text-3xl md:text-4xl xl:text-[54px] mb-10 md:mb-12 xl:mb-16 text-center"}
    `,children:r("reviewForm.title",{defaultValue:"Leave a review"})}),h=`
    w-full px-4 py-3
    bg-white
    border border-[#D1D5DB]
    rounded-xl
    text-[#111111]
    placeholder:text-[#9CA3AF]
    focus:border-[#0B5FA1]
    focus:ring-2 focus:ring-[#0B5FA1]/15
    outline-none
    transition-all duration-200
  `,b=e.jsxs("div",{className:`
      max-w-4xl 
      mx-auto 
      bg-white
      border border-[#E5E7EB]
      rounded-2xl 
      p-6 md:p-10 xl:p-14
      ${s?"p-6 md:p-8 xl:p-10":""}
    `,children:[s&&v,j&&e.jsx("div",{className:"mb-6 p-4 bg-[#ECFDF3] border border-[#86EFAC] rounded-xl text-[#065F46] text-center",children:r("reviewForm.success",{defaultValue:"Thank you for your review! It will be moderated and published."})}),p&&e.jsx("div",{className:"mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-center",children:p}),e.jsxs("form",{onSubmit:y,className:"space-y-6 md:space-y-7",children:[e.jsx("div",{className:"grid gap-6 md:gap-8",children:e.jsxs("div",{children:[e.jsxs("label",{htmlFor:"name",className:`
                    block text-sm font-medium text-[#374151] mb-2
                  `,children:[r("reviewForm.fields.name",{defaultValue:"Your name"})," *"]}),e.jsx("input",{id:"name",type:"text",required:!0,value:d,onChange:t=>m(t.target.value),className:h,placeholder:r("reviewForm.placeholders.name",{defaultValue:"John Doe"})})]})}),e.jsxs("div",{children:[e.jsxs("label",{htmlFor:"review",className:`
                  block text-sm font-medium text-[#374151] mb-2
                `,children:[r("reviewForm.fields.review",{defaultValue:"Your review"})," *"]}),e.jsx("textarea",{id:"review",required:!0,rows:5,value:c,onChange:t=>u(t.target.value),className:`${h} resize-none min-h-[140px]`,placeholder:r("reviewForm.placeholders.review",{defaultValue:"Share your impression about our service..."})})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"block text-sm font-medium text-[#374151] mb-3",children:[r("reviewForm.fields.rating",{defaultValue:"Rating"})," *"]}),e.jsxs("div",{className:"flex items-center gap-1 flex-wrap",children:[[1,2,3,4,5].map(t=>e.jsx("button",{type:"button",onClick:()=>x(t),className:"text-3xl transition-all duration-200 hover:scale-110 focus:outline-none cursor-pointer p-1",children:e.jsx("span",{className:`
                          transition-colors duration-200
                          ${t<=a?"text-[#F59E0B]":"text-gray-300 hover:text-[#FBBF24]"}
                        `,children:"★"})},t)),e.jsxs("span",{className:"ml-2 md:ml-3 text-sm font-medium text-[#6B7280]",children:[a===5&&r("reviewForm.rating.excellent",{defaultValue:"Excellent"}),a===4&&r("reviewForm.rating.good",{defaultValue:"Good"}),a===3&&r("reviewForm.rating.normal",{defaultValue:"Average"}),a===2&&r("reviewForm.rating.bad",{defaultValue:"Bad"}),a===1&&r("reviewForm.rating.veryBad",{defaultValue:"Very bad"})]})]})]}),e.jsx("div",{className:"pt-2 flex justify-center",children:e.jsx("button",{type:"submit",disabled:o,className:`
                    min-w-[220px] px-8 py-3 
                    bg-[#F58322] text-white 
                    font-semibold 
                    text-base tracking-wide
                    rounded-xl 
                    hover:bg-[#DB741F] 
                    transition-all duration-200
                    disabled:opacity-70 disabled:cursor-not-allowed
                    disabled:hover:bg-[#F58322]
                    focus:ring-2 focus:ring-[#F58322]/30 focus:ring-offset-2
                    outline-none
                  `,children:o?e.jsxs("span",{className:"flex items-center gap-2",children:[e.jsxs("svg",{className:"animate-spin h-5 w-5",viewBox:"0 0 24 24",children:[e.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4",fill:"none"}),e.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),r("reviewForm.sending",{defaultValue:"Sending..."})]}):r("reviewForm.submit",{defaultValue:"Send review"})})})]})]});return s?e.jsx("div",{className:"px-4 py-2 md:px-6 md:py-4",children:b}):e.jsx("section",{className:"py-16 md:py-20 xl:py-24 bg-[#F5F5F5]",children:e.jsxs(E,{children:[e.jsx(g,{children:v}),e.jsx(g,{delay:.1,children:b})]})})};export{$ as default};
