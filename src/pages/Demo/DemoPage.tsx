import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import { useTranslation } from 'react-i18next'
import { useState, useRef } from 'react'
import testVideo from '@/assets/demoZal/testVideo.mp4'
import Poster from '@/assets/demoZal/posterVideo.png'
import Play from '@/assets/demoZal/Play.svg'
import one from '@/assets/demoZal/one.svg'
import two from '@/assets/demoZal/two.svg'
import three from '@/assets/demoZal/three.svg'
import four from '@/assets/demoZal/four.svg'
import five from '@/assets/demoZal/five.svg'
import Contact from '@/components/common/Contact'

const DemoPage = () => {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);


  const handlePlay = () => {
    videoRef.current?.play();
    setPlaying(true);
  };

  return (
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-14 font-manrope">

          <aside className="hidden lg:block">
            <CategoriesMenu />  
          </aside>

          <section className="mx-auto w-full">

            <h1 className="font-oswald text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold uppercase text-[#F05023]">
              {t('demo.title')}
            </h1>

            <h3 className="font-oswald text-base sm:text-lg md:text-xl font-bold mt-1 mb-4 md:mb-6 whitespace-pre-line">
              {t('demo.subTitle')}
            </h3>

            <p className="text-gray-600 max-w-3xl mb-6 md:mb-10 text-sm md:text-base">
              {t('demo.text')}
            </p>

            <div className="relative max-w-4xl mx-auto rounded-lg overflow-hidden aspect-video">

              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={Poster}
                controls={playing}
              >
                <source src={testVideo} type="video/mp4" />
              </video>

              {!playing && (
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img
                    src={Play}
                    className="w-14 sm:w-20 md:w-24"
                  />
                </button>
              )}
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-light">
              {t('demo.videoSubText')}
            </p>
            
            {/* WHY */}
            <div className="max-w-3xl my-10 md:my-16">
            
              <h3 className="font-extrabold text-xl sm:text-2xl mb-4">
                {t('demo.why')}
              </h3>
            
              <ul className="text-sm space-y-2">
                {[1,2,3,4].map((n) => (
                  <li key={n} className="leading-relaxed">
                    • <span className="font-bold">
                      {t(`demo.whymain${n}`)}
                    </span>{' '}
                    {t(`demo.whytext${n}`)}
                  </li>
                ))}
              </ul>
              
            </div>
              
            {/* HOW IT WORKS */}
            <div className="max-w-4xl mx-auto mb-16 md:mb-20">
              
              <h2 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-bold text-[#F05023] uppercase mb-8 md:mb-10 text-center md:text-left">
                {t("demo.work")}
              </h2>
              
              <div className="space-y-8">
              
                {[one, two, three, four, five].map((icon, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 sm:gap-6 ${
                      i !== 4 && 'border-b border-[#F05023]'
                    }`}
                  >
                    <img
                      src={icon}
                      className="w-10 sm:w-12 md:w-14 mb-3 flex-shrink-0"
                    />

                    <div className="flex-1 pb-4">
                      <h4 className="font-semibold mb-1 text-sm sm:text-base">
                        {t(`demo.workmain${i + 1}`)}
                      </h4>
                  
                      <p className="text-xs sm:text-sm text-gray-600">
                        {t(`demo.worktext${i + 1}`)}
                      </p>
                    </div>
                  
                  </div>
                ))}

              </div>
            </div>
              
            {/* FORM */}
            <div className="mb-24 md:mb-40">
              
              <h2 className="px-2 sm:px-4 text-2xl sm:text-3xl md:text-4xl font-oswald font-semibold mb-6 md:mb-8 text-center md:text-left">
                Записаться в демозал
              </h2>
              
              <div className="max-w-xl mx-auto md:mx-0">
                <Contact />
              </div>
              
            </div>
              
          </section>
        </div>
      </PageContainer>
  )
}

export default DemoPage




// import PageContainer from '@/components/ui/PageContainer'
// import CategoriesMenu from '@/components/common/CategoriesMenu'
// import Contact from '@/components/common/Contact'
// import img1 from '@/assets/sklad1.png'
// import {Link} from 'react-router-dom'
// import BlogCard from '@/components/common/BlogCardProps'

// const DemoPage = () => {
//       const posts = [
//           { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
//           { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
//           { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
//           { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
//           { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
//           { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
//           { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
//           { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
//       ]
//   return (
//     <PageContainer>

//       <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 mt-16">

//         <aside className="hidden lg:block">
//           <CategoriesMenu />
//         </aside>

//         <section className="max-w-[1000px] ml-10">

//           <h1 className="font-oswald text-[40px] font-bold uppercase mb-2">
//             Посетите наши демозалы
//           </h1>

//           <h3 className="font-oswald text-xl font-semibold mb-4">
//             Подберем станки под ваш бизнес
//           </h3>

//           <p className="text-[#3A3A3A] max-w-[760px] leading-[1.7] mb-10">
//             Ждём вас в наших демозалах, где мы покажем в работе любое оборудование,
//             выполним тестовые детали и операции под нужды вашего бизнеса.
//           </p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">


//               {posts.map(post => (
//                     <Link to={`/Blog/${post.id}`} className="block">
//                         <BlogCard
//                             key={post.id}
//                             image={post.image}
//                             text={post.text}
//                         />
//                     </Link>
//               ))}


//           </div>

//         </section>

//       </div>

//       <div className="mt-24 text-center max-w-[600px] mx-auto mb-30">

//         <h2 className="font-oswald text-[42px] font-bold uppercase mb-8">
//           Оставьте заявку
//         </h2>

//         <Contact />

//       </div>

//     </PageContainer>
//   )
// }

// export default DemoPage


